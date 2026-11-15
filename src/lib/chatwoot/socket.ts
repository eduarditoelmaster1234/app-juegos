export type ChatwootSocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline';

export interface ChatwootRealtimeEvent {
  event: string;
  data: unknown;
}

interface ChatwootSocketOptions {
  cableUrl: string;
  pubsubToken: string;
  onStatus: (status: ChatwootSocketStatus) => void;
  onSubscribed: () => void;
  onEvent: (event: ChatwootRealtimeEvent) => void;
  onSubscriptionRejected: () => void;
}

const MAX_BACKOFF_MS = 30000;
const HEARTBEAT_CHECK_MS = 5000;
const STALE_CONNECTION_MS = 20000;
const MAX_BACKOFF_ATTEMPT = 6;

/**
 * Cliente mínimo del protocolo ActionCable de Chatwoot (`/cable`).
 *
 * Se suscribe a RoomChannel con el pubsub_token del contacto:
 *   { command: "subscribe",
 *     identifier: JSON.stringify({ channel: "RoomChannel", pubsub_token }) }
 *
 * No usa el widget de Chatwoot ni el paquete @rails/actioncable.
 */
export class ChatwootSocket {
  private socket: WebSocket | null = null;
  private closed = false;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectAttempt = 0;
  private lastMessageAt = 0;

  constructor(private readonly options: ChatwootSocketOptions) {}

  connect(): void {
    if (this.closed) return;
    this.open();
  }

  reconnectNow(): void {
    if (this.closed) return;
    this.clearReconnectTimer();
    this.reconnectAttempt = 0;
    this.teardownSocket();
    this.open();
  }

  close(): void {
    this.closed = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    this.teardownSocket();
  }

  private open(): void {
    if (this.closed) return;

    this.clearReconnectTimer();
    this.teardownSocket();
    this.options.onStatus(this.reconnectAttempt === 0 ? 'connecting' : 'reconnecting');

    let socket: WebSocket;
    try {
      socket = new WebSocket(this.options.cableUrl);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket = socket;
    this.lastMessageAt = Date.now();

    socket.onopen = () => {
      if (this.closed || this.socket !== socket) return;
      this.lastMessageAt = Date.now();
      this.startHeartbeat();

      try {
        socket.send(
          JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'RoomChannel',
              pubsub_token: this.options.pubsubToken,
            }),
          }),
        );
      } catch {
        this.handleDisconnect(socket);
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      if (this.socket !== socket) return;
      this.handleMessage(event.data);
    };

    socket.onerror = () => {
      // Normalmente el navegador dispara onclose después de onerror.
      // Si no lo hace, el heartbeat detecta la conexión vencida.
    };

    socket.onclose = () => {
      if (this.socket === socket) this.handleDisconnect(socket);
    };
  }

  private handleMessage(raw: unknown): void {
    this.lastMessageAt = Date.now();
    if (typeof raw !== 'string') return;

    let payload: unknown;
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      return;
    }

    if (!payload || typeof payload !== 'object') return;
    const envelope = payload as {
      type?: unknown;
      message?: unknown;
      reconnect?: unknown;
    };

    if (envelope.type === 'welcome') return;

    if (envelope.type === 'ping') {
      // El cliente oficial de ActionCable no responde los ping: solo los usa
      // como señal de vida. Actualizamos lastMessageAt arriba.
      return;
    }

    if (envelope.type === 'confirm_subscription') {
      this.reconnectAttempt = 0;
      this.options.onStatus('connected');
      this.options.onSubscribed();
      return;
    }

    if (envelope.type === 'reject_subscription') {
      this.options.onSubscriptionRejected();
      const socket = this.socket;
      if (socket) this.handleDisconnect(socket);
      return;
    }

    if (envelope.type === 'disconnect') {
      const allowReconnect = envelope.reconnect !== false;
      if (!allowReconnect) {
        this.closed = true;
        this.options.onStatus('offline');
      }
      const socket = this.socket;
      if (socket) this.handleDisconnect(socket);
      return;
    }

    if (envelope.message && typeof envelope.message === 'object') {
      const message = envelope.message as { event?: unknown; data?: unknown };
      if (typeof message.event === 'string') {
        this.options.onEvent({ event: message.event, data: message.data });
      }
    }
  }

  private handleDisconnect(socket: WebSocket): void {
    if (this.socket !== socket) return;

    this.socket = null;
    this.stopHeartbeat();
    this.detachSocket(socket);

    if (this.closed) return;
    this.scheduleReconnect();
  }

  private detachSocket(socket: WebSocket): void {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    try {
      socket.close();
    } catch {
      // La conexión ya estaba cerrada.
    }
  }

  private teardownSocket(): void {
    const socket = this.socket;
    this.socket = null;
    this.stopHeartbeat();
    if (socket) this.detachSocket(socket);
  }

  private scheduleReconnect(): void {
    if (this.closed || this.reconnectTimer !== null) return;

    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    this.options.onStatus(isOffline ? 'offline' : 'reconnecting');

    const backoff = Math.min(
      1000 * 2 ** Math.min(this.reconnectAttempt, MAX_BACKOFF_ATTEMPT),
      MAX_BACKOFF_MS,
    );
    const delay = isOffline ? MAX_BACKOFF_MS : backoff + Math.floor(Math.random() * 400);
    this.reconnectAttempt = Math.min(this.reconnectAttempt + 1, MAX_BACKOFF_ATTEMPT);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer === null) return;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (Date.now() - this.lastMessageAt <= STALE_CONNECTION_MS) return;
      const socket = this.socket;
      if (socket) this.handleDisconnect(socket);
    }, HEARTBEAT_CHECK_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer === null) return;
    window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
}
