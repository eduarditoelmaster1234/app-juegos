import type { ChatwootMessage } from './client';

export type ChatMessageSender = 'user' | 'support';
export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessageView {
  key: string;
  serverId?: number;
  clientId?: string;
  sender: ChatMessageSender;
  text: string;
  createdAt: number;
  status: ChatMessageStatus;
}

const CONTENT_MATCH_WINDOW_MS = 2 * 60 * 1000;

export function parseChatwootTimestamp(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric < 1e12 ? numeric * 1000 : numeric;
    }
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return Date.now();
}

function parseMessageType(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'incoming') return 0;
    if (normalized === 'outgoing') return 1;
    if (normalized === 'activity') return 2;
    if (normalized === 'template') return 3;

    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }

  return null;
}

/**
 * Convierte un mensaje de Chatwoot al modelo de la UI.
 *
 * - message_type 0 = mensaje del cliente (incoming)
 * - message_type 1 = mensaje del agente (outgoing)
 * - message_type 2 = actividad del sistema (no se muestra)
 * - message_type 3 = plantilla enviada por el agente (se muestra como soporte)
 */
export function toChatMessage(raw: ChatwootMessage | null | undefined): ChatMessageView | null {
  if (!raw || raw.id === undefined || raw.id === null) return null;
  if (raw.private === true) return null;

  const type = parseMessageType(raw.message_type);
  if (type !== 0 && type !== 1 && type !== 3) return null;

  const text = typeof raw.content === 'string' ? raw.content : '';
  if (!text.trim()) return null;

  const serverId = Number(raw.id);
  if (!Number.isFinite(serverId)) return null;

  return {
    key: `server-${serverId}`,
    serverId,
    clientId: typeof raw.echo_id === 'string' && raw.echo_id ? raw.echo_id : undefined,
    sender: type === 0 ? 'user' : 'support',
    text,
    createdAt: parseChatwootTimestamp(raw.created_at),
    status: 'sent',
  };
}

export function sortMessages(messages: ChatMessageView[]): ChatMessageView[] {
  return [...messages].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    const aId = a.serverId ?? Number.MAX_SAFE_INTEGER;
    const bId = b.serverId ?? Number.MAX_SAFE_INTEGER;
    return aId - bId;
  });
}

export function dedupeMessages(messages: ChatMessageView[]): ChatMessageView[] {
  const byServerId = new Map<number, ChatMessageView>();
  const localMessages: ChatMessageView[] = [];

  for (const message of messages) {
    if (message.serverId !== undefined) {
      const existing = byServerId.get(message.serverId);
      byServerId.set(
        message.serverId,
        existing
          ? { ...existing, ...message, clientId: message.clientId ?? existing.clientId }
          : message,
      );
    } else {
      localMessages.push(message);
    }
  }

  const seenLocalKeys = new Set<string>();
  const uniqueLocalMessages = localMessages.filter((message) => {
    if (seenLocalKeys.has(message.key)) return false;
    seenLocalKeys.add(message.key);
    return true;
  });

  return sortMessages([...byServerId.values(), ...uniqueLocalMessages]);
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function findMatchingLocalMessage(
  current: ChatMessageView[],
  incoming: ChatMessageView,
): ChatMessageView | undefined {
  if (incoming.sender !== 'user') return undefined;

  return current.find(
    (message) =>
      message.sender === 'user' &&
      message.serverId === undefined &&
      (message.status === 'sending' || message.status === 'failed') &&
      normalizeText(message.text) === normalizeText(incoming.text) &&
      Math.abs(message.createdAt - incoming.createdAt) <= CONTENT_MATCH_WINDOW_MS,
  );
}

/**
 * Inserta o actualiza un mensaje recibido por WebSocket.
 * Evita duplicados por id de servidor y por echo_id (mensajes propios).
 */
export function mergeIncomingMessage(
  current: ChatMessageView[],
  incoming: ChatMessageView,
): ChatMessageView[] {
  if (incoming.serverId !== undefined) {
    const existing = current.find((message) => message.serverId === incoming.serverId);
    if (existing) {
      return dedupeMessages(
        current.map((message) =>
          message.serverId === incoming.serverId
            ? { ...incoming, clientId: message.clientId ?? incoming.clientId }
            : message,
        ),
      );
    }
  }

  if (incoming.clientId) {
    const localMatch = current.find((message) => message.clientId === incoming.clientId);
    if (localMatch) {
      return dedupeMessages([
        ...current.filter(
          (message) =>
            message.key !== localMatch.key && message.serverId !== incoming.serverId,
        ),
        { ...incoming, clientId: incoming.clientId ?? localMatch.clientId },
      ]);
    }
  }

  const contentMatch = findMatchingLocalMessage(current, incoming);
  if (contentMatch) {
    return dedupeMessages([
      ...current.filter(
        (message) =>
          message.key !== contentMatch.key && message.serverId !== incoming.serverId,
      ),
      { ...incoming, clientId: incoming.clientId ?? contentMatch.clientId },
    ]);
  }

  return dedupeMessages([...current, incoming]);
}

export function mergeServerMessages(
  current: ChatMessageView[],
  serverMessages: ChatMessageView[],
): ChatMessageView[] {
  return serverMessages.reduce(
    (accumulator, message) => mergeIncomingMessage(accumulator, message),
    current,
  );
}

/** Confirma un mensaje optimista con la respuesta REST del mensaje creado. */
export function confirmLocalMessage(
  current: ChatMessageView[],
  clientId: string,
  serverMessage: ChatMessageView,
): ChatMessageView[] {
  return dedupeMessages([
    ...current.filter(
      (message) => message.clientId !== clientId && message.serverId !== serverMessage.serverId,
    ),
    { ...serverMessage, clientId },
  ]);
}

export function formatChatTime(timestamp: number): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}
