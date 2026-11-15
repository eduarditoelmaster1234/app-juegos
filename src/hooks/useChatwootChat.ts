import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatwootConfig, StoredContactIdentity } from '../lib/chatwoot/config';
import {
  buildCableUrl,
  createContactIdentifier,
  createMessageClientId,
  getContactCustomAttributes,
  getContactName,
  isIdentityStorageAvailable,
  loadStoredIdentity,
  readChatwootConfig,
  saveStoredIdentity,
  updateStoredIdentity,
} from '../lib/chatwoot/config';
import type { ChatwootConversation } from '../lib/chatwoot/client';
import {
  ChatwootApiError,
  createContact,
  createConversation,
  createMessage,
  getContact,
  listConversations,
  listMessages,
  updateContact,
} from '../lib/chatwoot/client';
import type { ChatwootRealtimeEvent, ChatwootSocketStatus } from '../lib/chatwoot/socket';
import { ChatwootSocket } from '../lib/chatwoot/socket';
import type { ChatMessageView } from '../lib/chatwoot/messages';
import {
  confirmLocalMessage,
  mergeIncomingMessage,
  mergeServerMessages,
  sortMessages,
  toChatMessage,
} from '../lib/chatwoot/messages';

export type ChatPhase = 'loading' | 'ready' | 'error';

export interface UseChatwootChatOptions {
  username: string;
  displayName: string;
  initialTopic: 'cargar' | 'retirar' | null;
}

interface ChatSession {
  config: ChatwootConfig;
  identity: StoredContactIdentity;
  conversationId: number;
}

const TOPIC_DEDUPE_WINDOW_MS = 2 * 60 * 1000;
const conversationLocks = new Map<string, Promise<ChatwootConversation>>();

function isAbortError(error: unknown): boolean {
  return typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError';
}

function friendlyError(error: unknown): string {
  if (error instanceof ChatwootApiError) {
    if (error.status === 401 || error.status === 403) {
      return 'Chatwoot rechazó la conexión. Verificá el identificador de la bandeja API.';
    }
    if (error.status === 404) {
      return 'La conversación ya no está disponible en Chatwoot.';
    }
    if (error.status === 422) {
      return 'Chatwoot no aceptó la solicitud. Revisá la configuración de la bandeja.';
    }
    if (error.status === 429) {
      return 'Demasiados mensajes en poco tiempo. Esperá unos segundos e intentá de nuevo.';
    }
    if (error.status !== null && error.status >= 500) {
      return 'Chatwoot no está disponible en este momento. Reintentá en unos segundos.';
    }
    return error.message || 'Ocurrió un error al comunicarse con Chatwoot.';
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado al comunicarse con Chatwoot.';
}

/**
 * Recupera el contacto del cliente o lo crea la primera vez.
 *
 * El identifier se genera en el navegador y se conserva por usuario.
 * Nunca se usa el nombre de usuario como identificador único.
 */
async function resolveStoredContact(
  config: ChatwootConfig,
  username: string,
  displayName: string,
  signal: AbortSignal,
): Promise<StoredContactIdentity> {
  const stored = loadStoredIdentity(username);
  const desiredName = getContactName(username, displayName);
  const customAttributes = getContactCustomAttributes(username);

  if (stored) {
    try {
      const contact = await getContact(config, stored.sourceId, signal);
      let identity: StoredContactIdentity = {
        ...stored,
        sourceId: contact.source_id || stored.sourceId,
        pubsubToken: contact.pubsub_token || stored.pubsubToken,
        contactId: typeof contact.id === 'number' ? contact.id : stored.contactId,
      };

      if (stored.syncedName !== desiredName) {
        try {
          const updated = await updateContact(
            config,
            identity.sourceId,
            { name: desiredName, customAttributes },
            signal,
          );
          identity = {
            ...identity,
            sourceId: updated.source_id || identity.sourceId,
            pubsubToken: updated.pubsub_token || identity.pubsubToken,
            contactId: typeof updated.id === 'number' ? updated.id : identity.contactId,
            syncedName: desiredName,
          };
        } catch (error) {
          if (isAbortError(error)) throw error;
          // El nombre es secundario: si falla, el chat puede seguir funcionando.
        }
      }

      const changed =
        identity.sourceId !== stored.sourceId ||
        identity.pubsubToken !== stored.pubsubToken ||
        identity.contactId !== stored.contactId ||
        identity.syncedName !== stored.syncedName;
      if (changed) saveStoredIdentity(username, identity);
      return identity;
    } catch (error) {
      if (isAbortError(error)) throw error;
      if (!(error instanceof ChatwootApiError) || error.status !== 404) throw error;
      // El contacto ya no existe en Chatwoot. Se recrea con el mismo identifier.
    }
  }

  const identifier = stored?.identifier ?? createContactIdentifier();
  const contact = await createContact(
    config,
    { identifier, name: desiredName, customAttributes },
    signal,
  );

  if (!contact.source_id || !contact.pubsub_token) {
    throw new ChatwootApiError('Chatwoot no devolvió los identificadores del contacto.');
  }

  const identity: StoredContactIdentity = {
    identifier,
    sourceId: contact.source_id,
    pubsubToken: contact.pubsub_token,
    contactId: typeof contact.id === 'number' ? contact.id : 0,
    syncedName: desiredName,
    updatedAt: Date.now(),
  };
  saveStoredIdentity(username, identity);
  return identity;
}

/**
 * Reutiliza la conversación abierta más reciente. Solo crea una nueva cuando
 * todas las existentes están resueltas. El lock evita carreras entre montajes.
 */
async function resolveConversation(
  config: ChatwootConfig,
  identity: StoredContactIdentity,
  signal: AbortSignal,
): Promise<ChatwootConversation> {
  const key = `${config.baseUrl}|${config.inboxIdentifier}|${identity.sourceId}`;
  const inFlight = conversationLocks.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const conversations = await listConversations(config, identity.sourceId, signal);
    const activeConversation = conversations
      .filter((conversation) => conversation.status !== 'resolved')
      .sort((a, b) => b.id - a.id)[0];

    if (activeConversation) return activeConversation;
    return createConversation(config, identity.sourceId, signal);
  })();

  conversationLocks.set(key, promise);
  try {
    return await promise;
  } finally {
    conversationLocks.delete(key);
  }
}

function getTopicMessage(topic: 'cargar' | 'retirar', username: string): string {
  const normalizedUsername = username.trim();
  const userSuffix = normalizedUsername ? ` Mi usuario es @${normalizedUsername}.` : '';
  return topic === 'cargar'
    ? `Hola, quiero realizar una carga de fichas.${userSuffix}`
    : `Hola, quiero solicitar un retiro de fichas.${userSuffix}`;
}

function topicMarkerKey(conversationId: number, topic: 'cargar' | 'retirar'): string {
  return `ganamos.chatwoot.topic.${conversationId}.${topic}`;
}

function wasTopicRecentlySent(conversationId: number, topic: 'cargar' | 'retirar'): boolean {
  try {
    const raw = window.sessionStorage.getItem(topicMarkerKey(conversationId, topic));
    if (!raw) return false;
    const timestamp = Number(raw);
    return Number.isFinite(timestamp) && Date.now() - timestamp < TOPIC_DEDUPE_WINDOW_MS;
  } catch {
    return false;
  }
}

function markTopicSent(conversationId: number, topic: 'cargar' | 'retirar'): void {
  try {
    window.sessionStorage.setItem(topicMarkerKey(conversationId, topic), String(Date.now()));
  } catch {
    // sessionStorage puede estar bloqueado; el chequeo del último mensaje
    // sigue evitando duplicados cuando el historial ya está disponible.
  }
}

function normalizeTopicText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function isLastMessageTopic(messages: ChatMessageView[], topicText: string): boolean {
  const lastMessage = messages[messages.length - 1];
  return (
    lastMessage?.sender === 'user' &&
    normalizeTopicText(lastMessage.text) === normalizeTopicText(topicText)
  );
}

export function useChatwootChat({
  username,
  displayName,
  initialTopic,
}: UseChatwootChatOptions) {
  const [phase, setPhase] = useState<ChatPhase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [connection, setConnection] = useState<ChatwootSocketStatus>('connecting');
  const [agentTyping, setAgentTyping] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const usernameRef = useRef(username);
  const displayNameRef = useRef(displayName);
  usernameRef.current = username;
  displayNameRef.current = displayName;

  const messagesRef = useRef<ChatMessageView[]>([]);
  const sessionRef = useRef<ChatSession | null>(null);
  const socketRef = useRef<ChatwootSocket | null>(null);
  const startSocketRef = useRef<((config: ChatwootConfig, token: string) => void) | null>(null);
  const handleRealtimeEventRef = useRef<((event: ChatwootRealtimeEvent) => void) | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const syncPromiseRef = useRef<Promise<boolean> | null>(null);
  const syncErrorRef = useRef<string | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const socketRejectionsRef = useRef(0);
  const topicAttemptedRef = useRef(false);

  const updateMessages = useCallback(
    (updater: (current: ChatMessageView[]) => ChatMessageView[]) => {
      const next = updater(messagesRef.current);
      messagesRef.current = next;
      setMessages(next);
    },
    [],
  );

  const clearTyping = useCallback(() => {
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setAgentTyping(false);
  }, []);

  const syncMessages = useCallback(async (): Promise<boolean> => {
    if (syncPromiseRef.current) return syncPromiseRef.current;

    const session = sessionRef.current;
    if (!session) return false;

    const promise = (async (): Promise<boolean> => {
      try {
        const rawMessages = await listMessages(
          session.config,
          session.identity.sourceId,
          session.conversationId,
          abortRef.current?.signal,
        );
        if (!mountedRef.current) return false;

        const views = rawMessages
          .map((message) => toChatMessage(message))
          .filter((message): message is ChatMessageView => message !== null);

        updateMessages((current) => mergeServerMessages(current, views));
        syncErrorRef.current = null;
        setSyncError(null);
        return true;
      } catch (caught) {
        if (isAbortError(caught)) return false;
        if (!mountedRef.current) return false;
        const message = friendlyError(caught);
        syncErrorRef.current = message;
        setSyncError(message);
        return false;
      } finally {
        syncPromiseRef.current = null;
      }
    })();

    syncPromiseRef.current = promise;
    return promise;
  }, [updateMessages]);

  const handleRealtimeEvent = useCallback(
    (event: ChatwootRealtimeEvent) => {
      const session = sessionRef.current;
      if (!session || !mountedRef.current) return;

      if (event.event === 'message.created' || event.event === 'message.updated') {
        const raw = event.data as {
          conversation_id?: unknown;
        } & Parameters<typeof toChatMessage>[0];

        const conversationId = Number(raw?.conversation_id);
        if (
          Number.isFinite(conversationId) &&
          conversationId > 0 &&
          conversationId !== session.conversationId
        ) {
          return;
        }

        const view = toChatMessage(raw);
        if (!view) return;
        if (view.sender === 'support') clearTyping();
        updateMessages((current) => mergeIncomingMessage(current, view));
        return;
      }

      if (event.event === 'conversation.typing_on') {
        const typingData = event.data as {
          conversation?: { id?: number };
          conversation_id?: number;
          is_private?: boolean;
        };

        const conversationId = Number(
          typingData?.conversation?.id ?? typingData?.conversation_id,
        );
        if (
          Number.isFinite(conversationId) &&
          conversationId > 0 &&
          conversationId !== session.conversationId
        ) {
          return;
        }
        if (typingData?.is_private) return;

        setAgentTyping(true);
        if (typingTimerRef.current !== null) window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = window.setTimeout(() => {
          typingTimerRef.current = null;
          if (mountedRef.current) setAgentTyping(false);
        }, 30000);
        return;
      }

      if (event.event === 'conversation.typing_off') {
        const typingData = event.data as {
          conversation?: { id?: number };
          conversation_id?: number;
        };
        const conversationId = Number(
          typingData?.conversation?.id ?? typingData?.conversation_id,
        );
        if (
          Number.isFinite(conversationId) &&
          conversationId > 0 &&
          conversationId !== session.conversationId
        ) {
          return;
        }
        clearTyping();
        return;
      }

      if (event.event === 'contact.merged') {
        const token = (event.data as { pubsub_token?: unknown } | null)?.pubsub_token;
        if (typeof token !== 'string' || !token) return;

        const updated = updateStoredIdentity(usernameRef.current, { pubsubToken: token });
        if (!updated) return;

        sessionRef.current = { ...session, identity: updated };
        socketRef.current?.close();
        startSocketRef.current?.(session.config, token);
      }
    },
    [clearTyping, updateMessages],
  );

  const startSocket = useCallback(
    (config: ChatwootConfig, pubsubToken: string) => {
      socketRef.current?.close();
      socketRejectionsRef.current = 0;

      const socket = new ChatwootSocket({
        cableUrl: buildCableUrl(config),
        pubsubToken,
        onStatus: (status) => {
          if (mountedRef.current) setConnection(status);
        },
        onSubscribed: () => {
          if (!mountedRef.current) return;
          socketRejectionsRef.current = 0;
          setConnection('connected');
          void syncMessages();
        },
        onEvent: (event) => {
          handleRealtimeEventRef.current?.(event);
        },
        onSubscriptionRejected: () => {
          socketRejectionsRef.current += 1;
          if (socketRejectionsRef.current < 3) return;

          socket.close();
          if (!mountedRef.current) return;
          setConnection('offline');
          setSyncError(
            'La conexión en tiempo real fue rechazada por Chatwoot. Cerrá y volvé a abrir el chat para reintentar.',
          );
        },
      });

      socketRef.current = socket;
      socket.connect();
    },
    [syncMessages],
  );

  startSocketRef.current = startSocket;
  handleRealtimeEventRef.current = handleRealtimeEvent;

  const sendMessage = useCallback(
    (rawText: string, options?: { onDelivered?: () => void }): boolean => {
      const session = sessionRef.current;
      const text = rawText.trim();
      if (!session || !text) return false;

      const clientId = createMessageClientId();
      const optimisticMessage: ChatMessageView = {
        key: `local-${clientId}`,
        clientId,
        sender: 'user',
        text,
        createdAt: Date.now(),
        status: 'sending',
      };

      updateMessages((current) => sortMessages([...current, optimisticMessage]));
      setSendError(null);

      void (async () => {
        try {
          const created = await createMessage(
            session.config,
            session.identity.sourceId,
            session.conversationId,
            text,
            clientId,
            abortRef.current?.signal,
          );
          if (!mountedRef.current) return;

          const view = toChatMessage(created);
          if (view) {
            updateMessages((current) => confirmLocalMessage(current, clientId, view));
          } else {
            updateMessages((current) =>
              current.map((message) =>
                message.clientId === clientId ? { ...message, status: 'sent' } : message,
              ),
            );
          }
          options?.onDelivered?.();
        } catch (caught) {
          if (isAbortError(caught)) return;
          if (!mountedRef.current) return;

          updateMessages((current) =>
            current.map((message) =>
              message.clientId === clientId ? { ...message, status: 'failed' } : message,
            ),
          );
          setSendError(friendlyError(caught));
        }
      })();

      return true;
    },
    [updateMessages],
  );

  const retryMessage = useCallback(
    (messageKey: string) => {
      const session = sessionRef.current;
      const message = messagesRef.current.find((item) => item.key === messageKey);
      if (
        !session ||
        !message ||
        message.sender !== 'user' ||
        message.status === 'sending'
      ) {
        return;
      }

      const clientId = message.clientId ?? createMessageClientId();
      updateMessages((current) =>
        current.map((item) =>
          item.key === messageKey ? { ...item, clientId, status: 'sending' } : item,
        ),
      );
      setSendError(null);

      void (async () => {
        try {
          // Si el mensaje llegó a Chatwoot pero se perdió la respuesta,
          // el historial lo devuelve y evitamos reenviarlo.
          await syncMessages();
          if (!mountedRef.current) return;

          const current = messagesRef.current.find((item) => item.clientId === clientId);
          if (!current || current.status === 'sent' || current.serverId !== undefined) return;

          const created = await createMessage(
            session.config,
            session.identity.sourceId,
            session.conversationId,
            current.text,
            clientId,
            abortRef.current?.signal,
          );
          if (!mountedRef.current) return;

          const view = toChatMessage(created);
          if (view) {
            updateMessages((current) => confirmLocalMessage(current, clientId, view));
          } else {
            updateMessages((current) =>
              current.map((item) =>
                item.clientId === clientId ? { ...item, status: 'sent' } : item,
              ),
            );
          }
        } catch (caught) {
          if (isAbortError(caught)) return;
          if (!mountedRef.current) return;

          updateMessages((current) =>
            current.map((item) =>
              item.clientId === clientId ? { ...item, status: 'failed' } : item,
            ),
          );
          setSendError(friendlyError(caught));
        }
      })();
    },
    [syncMessages, updateMessages],
  );

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const retrySync = useCallback(() => {
    setSyncError(null);
    void syncMessages();
  }, [syncMessages]);

  const dismissSendError = useCallback(() => {
    setSendError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    socketRef.current?.close();
    socketRef.current = null;
    sessionRef.current = null;
    syncPromiseRef.current = null;
    syncErrorRef.current = null;
    socketRejectionsRef.current = 0;
    topicAttemptedRef.current = false;

    messagesRef.current = [];
    setMessages([]);
    setPhase('loading');
    setError(null);
    setSendError(null);
    setSyncError(null);
    setAgentTyping(false);
    setStorageBlocked(!isIdentityStorageAvailable());
    clearTyping();

    const configResult = readChatwootConfig();
    if (!configResult.config) {
      setPhase('error');
      setError(configResult.error);
      setConnection('offline');
      return () => {
        mountedRef.current = false;
        controller.abort();
      };
    }

    const config = configResult.config;
    setConnection(navigator.onLine === false ? 'offline' : 'connecting');

    let disposed = false;
    const isDisposed = () => disposed || controller.signal.aborted;

    const initialize = async () => {
      try {
        const identity = await resolveStoredContact(
          config,
          username,
          displayNameRef.current,
          controller.signal,
        );
        if (isDisposed()) return;

        if (!identity.pubsubToken) {
          throw new ChatwootApiError(
            'Chatwoot no devolvió el token de tiempo real del contacto.',
          );
        }

        const conversation = await resolveConversation(config, identity, controller.signal);
        if (isDisposed()) return;

        const session: ChatSession = {
          config,
          identity,
          conversationId: conversation.id,
        };
        sessionRef.current = session;
        startSocket(config, identity.pubsubToken);

        const historyOk = await syncMessages();
        if (isDisposed()) return;

        if (!historyOk) {
          socketRef.current?.close();
          socketRef.current = null;
          setPhase('error');
          setError(syncErrorRef.current ?? 'No pudimos cargar la conversación.');
          setConnection(navigator.onLine === false ? 'offline' : 'reconnecting');
          return;
        }

        setPhase('ready');
      } catch (caught) {
        if (isDisposed() || isAbortError(caught)) return;

        socketRef.current?.close();
        socketRef.current = null;
        setPhase('error');
        setError(friendlyError(caught));
        setConnection(navigator.onLine === false ? 'offline' : 'reconnecting');
      }
    };

    void initialize();

    return () => {
      disposed = true;
      mountedRef.current = false;
      controller.abort();
      socketRef.current?.close();
      socketRef.current = null;
      sessionRef.current = null;
      syncPromiseRef.current = null;
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [username, reloadToken, startSocket, syncMessages, clearTyping]);

  useEffect(() => {
    if (phase !== 'ready' || !initialTopic || topicAttemptedRef.current) return;

    const session = sessionRef.current;
    if (!session) return;
    topicAttemptedRef.current = true;

    const topicText = getTopicMessage(initialTopic, username);
    if (wasTopicRecentlySent(session.conversationId, initialTopic)) return;
    if (isLastMessageTopic(messagesRef.current, topicText)) return;

    sendMessage(topicText, {
      onDelivered: () => markTopicSent(session.conversationId, initialTopic),
    });
  }, [phase, initialTopic, username, sendMessage]);

  useEffect(() => {
    const handleOnline = () => {
      if (!sessionRef.current) return;
      setConnection('connecting');
      socketRef.current?.reconnectNow();
      void syncMessages();
    };

    const handleOffline = () => {
      setConnection('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setConnection('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncMessages]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !sessionRef.current) return;
      void syncMessages();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncMessages]);

  useEffect(() => {
    if (!sendError) return;
    const timeout = window.setTimeout(() => setSendError(null), 8000);
    return () => window.clearTimeout(timeout);
  }, [sendError]);

  return {
    phase,
    error,
    messages,
    connection,
    agentTyping,
    sendError,
    syncError,
    storageBlocked,
    sendMessage,
    retryMessage,
    retrySync,
    dismissSendError,
    reload,
  };
}
