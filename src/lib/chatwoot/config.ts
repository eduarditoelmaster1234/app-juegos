/**
 * Configuración pública del canal API de Chatwoot.
 *
 * Solo se leen variables VITE_* que son datos públicos de conexión.
 * Ningún token administrativo, secreto de webhook ni clave HMAC debe
 * vivir en este archivo ni en ninguna variable VITE_*.
 */

export interface ChatwootConfig {
  baseUrl: string;
  inboxIdentifier: string;
}

export interface ChatwootConfigResult {
  config: ChatwootConfig | null;
  error: string | null;
}

const IDENTITY_STORAGE_KEY = 'ganamos.chatwoot.identities.v1';
const MEMORY_STORE_LIMIT = 8;

export interface StoredContactIdentity {
  /** Identificador estable generado por GANAMOS (no es el nombre de usuario). */
  identifier: string;
  /** source_id que devuelve Chatwoot; se usa en todas las llamadas siguientes. */
  sourceId: string;
  /** Token del contacto para autenticar el WebSocket. */
  pubsubToken: string;
  contactId: number;
  /** Último nombre sincronizado, para no pisar cambios hechos por el agente. */
  syncedName: string;
  updatedAt: number;
}

type IdentityStore = Record<string, StoredContactIdentity>;

let storageAvailable: boolean | null = null;
const memoryStore: IdentityStore = {};

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isIdentityStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  const storage = getLocalStorage();
  if (!storage) {
    storageAvailable = false;
    return false;
  }
  try {
    const probe = '__ganamos_storage_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

function identityKey(username: string): string {
  const normalized = username.trim().toLowerCase();
  return normalized || 'invitado';
}

function sanitizeStoredIdentity(value: unknown): StoredContactIdentity | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<StoredContactIdentity>;
  if (typeof candidate.identifier !== 'string' || !candidate.identifier) return null;
  if (typeof candidate.sourceId !== 'string' || !candidate.sourceId) return null;

  return {
    identifier: candidate.identifier,
    sourceId: candidate.sourceId,
    pubsubToken: typeof candidate.pubsubToken === 'string' ? candidate.pubsubToken : '',
    contactId: typeof candidate.contactId === 'number' ? candidate.contactId : 0,
    syncedName: typeof candidate.syncedName === 'string' ? candidate.syncedName : '',
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : Date.now(),
  };
}

function readStore(): IdentityStore {
  const storage = getLocalStorage();
  // Se devuelve una copia: writeStore puede reemplazar el store en memoria y
  // no debe mutar el objeto que está leyendo.
  if (!storage || !isIdentityStorageAvailable()) return { ...memoryStore };

  try {
    const raw = storage.getItem(IDENTITY_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const store: IdentityStore = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const identity = sanitizeStoredIdentity(value);
      if (identity) store[key] = identity;
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: IdentityStore): void {
  const storage = getLocalStorage();
  if (!storage || !isIdentityStorageAvailable()) {
    replaceMemoryStore(store);
    return;
  }

  try {
    const entries = Object.entries(store)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .slice(0, MEMORY_STORE_LIMIT);
    storage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Si el navegador bloquea la escritura, mantenemos la identidad en memoria
    // durante esta sesión para no crear contactos duplicados en cada render.
    storageAvailable = false;
    replaceMemoryStore(store);
  }
}

function replaceMemoryStore(store: IdentityStore): void {
  for (const key of Object.keys(memoryStore)) delete memoryStore[key];
  Object.assign(memoryStore, store);
}

export function loadStoredIdentity(username: string): StoredContactIdentity | null {
  return readStore()[identityKey(username)] ?? null;
}

export function saveStoredIdentity(username: string, identity: StoredContactIdentity): void {
  const store = readStore();
  store[identityKey(username)] = { ...identity, updatedAt: Date.now() };
  writeStore(store);
}

export function updateStoredIdentity(
  username: string,
  patch: Partial<Omit<StoredContactIdentity, 'identifier'>>,
): StoredContactIdentity | null {
  const store = readStore();
  const key = identityKey(username);
  const current = store[key];
  if (!current) return null;

  const next: StoredContactIdentity = { ...current, ...patch, updatedAt: Date.now() };
  store[key] = next;
  writeStore(store);
  return next;
}

function randomUuid(): string {
  const cryptoObject = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (cryptoObject && typeof cryptoObject.randomUUID === 'function') {
    return cryptoObject.randomUUID();
  }

  if (cryptoObject && typeof cryptoObject.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoObject.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Identificador estable para Chatwoot: UUID aleatorio con prefijo de la app. */
export function createContactIdentifier(): string {
  return `ganamos-${randomUuid()}`;
}

/** Identificador efímero para correlacionar un mensaje optimista con su eco. */
export function createMessageClientId(): string {
  return `ganamos-msg-${randomUuid()}`;
}

export function getContactName(username: string, displayName: string): string {
  const name = displayName.trim();
  if (name) return name;
  const fallback = username.trim();
  return fallback || 'Cliente GANAMOS';
}

export function getContactCustomAttributes(username: string): Record<string, string> {
  const normalized = username.trim();
  return {
    ganamos_username: normalized || 'invitado',
    ganamos_app: 'GANAMOS',
  };
}

export function readChatwootConfig(): ChatwootConfigResult {
  const rawBaseUrl = (import.meta.env.VITE_CHATWOOT_BASE_URL ?? '').trim();
  const inboxIdentifier = (import.meta.env.VITE_CHATWOOT_INBOX_IDENTIFIER ?? '').trim();

  if (!rawBaseUrl || !inboxIdentifier) {
    return {
      config: null,
      error:
        'El chat no está configurado. Definí VITE_CHATWOOT_BASE_URL y VITE_CHATWOOT_INBOX_IDENTIFIER (por ejemplo en .env.local).',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawBaseUrl);
  } catch {
    return {
      config: null,
      error: 'VITE_CHATWOOT_BASE_URL no es una URL válida.',
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      config: null,
      error: 'VITE_CHATWOOT_BASE_URL debe comenzar con http:// o https://.',
    };
  }

  // Conservamos un posible subpath (ej. https://host/chatwoot) y quitamos
  // query/hash y la barra final para construir las rutas de la API.
  const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');

  return {
    config: { baseUrl, inboxIdentifier },
    error: null,
  };
}

export function buildApiBase(config: ChatwootConfig): string {
  return `${config.baseUrl}/public/api/v1/inboxes/${encodeURIComponent(config.inboxIdentifier)}`;
}

export function buildCableUrl(config: ChatwootConfig): string {
  const url = new URL(config.baseUrl);
  const basePath = url.pathname.replace(/\/+$/, '');
  url.pathname = `${basePath}/cable`;
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.search = '';
  url.hash = '';
  return url.toString();
}
