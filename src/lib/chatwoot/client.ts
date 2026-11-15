import type { ChatwootConfig } from './config';
import { buildApiBase } from './config';

export interface ChatwootContact {
  id: number;
  source_id: string;
  pubsub_token: string;
  name?: string | null;
  identifier?: string | null;
}

export interface ChatwootMessageSender {
  id?: number;
  name?: string;
  type?: string;
}

export interface ChatwootMessage {
  id: number;
  content?: string | null;
  message_type?: number | string;
  content_type?: number | string | null;
  created_at?: number | string;
  conversation_id?: number;
  private?: boolean;
  status?: number | string;
  echo_id?: string | null;
  sender?: ChatwootMessageSender | null;
}

export interface ChatwootConversation {
  id: number;
  status?: string;
  messages?: ChatwootMessage[];
  contact?: {
    id?: number;
    name?: string | null;
  } | null;
}

export class ChatwootApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ChatwootApiError';
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 15000;

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === 'string' && record.error.trim()) return record.error.trim();
    if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  }
  return null;
}

async function request<T>(
  config: ChatwootConfig,
  path: string,
  options: RequestInit = {},
  externalSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;

  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort);
  }

  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body !== undefined && options.body !== null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${buildApiBase(config)}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const message =
        extractErrorMessage(payload) ?? `Chatwoot respondió con el estado ${response.status}.`;
      throw new ChatwootApiError(message, response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ChatwootApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      if (externalSignal?.aborted) throw error;
      if (timedOut) throw new ChatwootApiError('Chatwoot no respondió a tiempo.');
      throw new ChatwootApiError('La conexión con Chatwoot se interrumpió.');
    }

    throw new ChatwootApiError('No pudimos conectar con Chatwoot. Revisá la URL y tu conexión.');
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

export function createContact(
  config: ChatwootConfig,
  input: {
    identifier: string;
    name: string;
    customAttributes: Record<string, string>;
  },
  signal?: AbortSignal,
): Promise<ChatwootContact> {
  return request<ChatwootContact>(
    config,
    '/contacts',
    {
      method: 'POST',
      body: JSON.stringify({
        identifier: input.identifier,
        name: input.name,
        custom_attributes: input.customAttributes,
      }),
    },
    signal,
  );
}

export function getContact(
  config: ChatwootConfig,
  sourceId: string,
  signal?: AbortSignal,
): Promise<ChatwootContact> {
  return request<ChatwootContact>(
    config,
    `/contacts/${encodeURIComponent(sourceId)}`,
    {},
    signal,
  );
}

export function updateContact(
  config: ChatwootConfig,
  sourceId: string,
  input: {
    name?: string;
    customAttributes?: Record<string, string>;
  },
  signal?: AbortSignal,
): Promise<ChatwootContact> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.customAttributes) body.custom_attributes = input.customAttributes;

  return request<ChatwootContact>(
    config,
    `/contacts/${encodeURIComponent(sourceId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    signal,
  );
}

export function listConversations(
  config: ChatwootConfig,
  sourceId: string,
  signal?: AbortSignal,
): Promise<ChatwootConversation[]> {
  return request<ChatwootConversation[]>(
    config,
    `/contacts/${encodeURIComponent(sourceId)}/conversations`,
    {},
    signal,
  );
}

export function createConversation(
  config: ChatwootConfig,
  sourceId: string,
  signal?: AbortSignal,
): Promise<ChatwootConversation> {
  return request<ChatwootConversation>(
    config,
    `/contacts/${encodeURIComponent(sourceId)}/conversations`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    signal,
  );
}

export function listMessages(
  config: ChatwootConfig,
  sourceId: string,
  conversationId: number,
  signal?: AbortSignal,
): Promise<ChatwootMessage[]> {
  return request<ChatwootMessage[]>(
    config,
    `/contacts/${encodeURIComponent(sourceId)}/conversations/${conversationId}/messages`,
    {},
    signal,
  );
}

export function createMessage(
  config: ChatwootConfig,
  sourceId: string,
  conversationId: number,
  content: string,
  echoId: string,
  signal?: AbortSignal,
): Promise<ChatwootMessage> {
  return request<ChatwootMessage>(
    config,
    `/contacts/${encodeURIComponent(sourceId)}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content, echo_id: echoId }),
    },
    signal,
  );
}
