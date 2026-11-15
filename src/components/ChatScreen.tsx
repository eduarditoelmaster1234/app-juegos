import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Headphones,
  ShieldCheck,
  CheckCheck,
  Smile,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { useChatwootChat } from '../hooks/useChatwootChat';
import { formatChatTime } from '../lib/chatwoot/messages';

interface ChatScreenProps {
  username: string;
  displayName: string;
  onBackToHome: () => void;
  initialTopic?: 'cargar' | 'retirar' | null;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Reacciones y gestos',
    emojis: ['😀', '😂', '😎', '😍', '🥳', '🤩', '🤑', '🤔', '👍', '👏', '🙌', '🔥', '🚀', '💯'],
  },
  {
    name: 'Casino y suerte',
    emojis: ['🎰', '🎲', '👑', '💎', '🍀', '🃏', '💰', '💵', '🪙', '🎯', '🏆', '✨', '⭐', '🍾'],
  },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  username,
  displayName,
  onBackToHome,
  initialTopic = null,
}) => {
  const {
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
  } = useChatwootChat({ username, displayName, initialTopic });

  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const canInteract = phase === 'ready';

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Listen to window.visualViewport changes to detect virtual keyboard opening/closing
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      const layoutHeight = window.innerHeight;
      const visualHeight = vv.height;
      const offsetTop = vv.offsetTop;

      const offset = Math.max(0, layoutHeight - visualHeight - offsetTop);
      setKeyboardOffset(offset);

      scrollToBottom('auto');
    };

    const vv = window.visualViewport;
    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);

    return () => {
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentTyping, showEmojiPicker, phase]);

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;

    const accepted = sendMessage(text);
    if (!accepted) return;

    setInputText('');
    setShowEmojiPicker(false);
  };

  const quickPrompts = [
    'Quiero cargar fichas 💰',
    'Quiero retirar fichas 🪙',
    '¿Cómo ingresar a jugar? 🎰',
    'Horarios de soporte 🕒',
  ];

  const connectionLabel =
    connection === 'connected'
      ? 'En línea · Cargas, retiros y consultas'
      : connection === 'connecting'
        ? 'Conectando con el soporte…'
        : connection === 'reconnecting'
          ? 'Reconectando…'
          : 'Sin conexión · reintentando';

  const connectionDotClass =
    connection === 'connected'
      ? 'bg-emerald-400'
      : connection === 'offline'
        ? 'bg-red-400'
        : 'bg-amber-400';

  const inputPlaceholder =
    phase === 'loading'
      ? 'Conectando con el soporte…'
      : phase === 'error'
        ? 'Chat no disponible'
        : 'Escribí tu mensaje...';

  return (
    <div
      ref={chatContainerRef}
      style={{
        paddingBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : undefined,
      }}
      className="relative flex flex-col h-full w-full bg-gradient-to-b from-[#0a0316] via-[#07020f] to-[#04010a] overflow-hidden transition-[padding] duration-150 ease-out"
    >
      {/* Soft ambient glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header - Standardized 56px height */}
      <header className="relative z-10 flex items-center justify-between px-3 sm:px-4 h-14 bg-[#100522]/95 backdrop-blur-md border-b border-violet-950/60 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToHome}
            aria-label="Volver al inicio"
            className="w-9 h-9 flex items-center justify-center text-violet-300 hover:text-white rounded-full hover:bg-violet-900/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white border border-violet-400/30 shadow-[0_0_10px_rgba(139,92,246,0.25)]">
              <Headphones className="w-4 h-4" />
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#100522] transition-colors ${connectionDotClass}`}
            />
          </div>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none truncate">
                Soporte GANAMOS
              </h2>
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            </div>
            <p className="text-[10px] text-violet-300/60 mt-0.5 truncate">
              {connectionLabel}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5 space-y-3"
        aria-live="polite"
        aria-busy={phase === 'loading'}
      >
        {/* Subtle security notice */}
        <div className="flex justify-center my-0.5">
          <span className="text-[10px] text-violet-300/45 bg-violet-950/30 border border-violet-800/25 px-3 py-0.5 rounded-full">
            Canal de atención oficial de GANAMOS
          </span>
        </div>

        {storageBlocked && (
          <div className="flex justify-center">
            <span className="text-[10px] text-amber-200/80 bg-amber-950/25 border border-amber-500/25 px-3 py-1 rounded-full text-center leading-relaxed">
              El navegador bloqueó el almacenamiento local. El chat funcionará, pero no podrá
              recordar la conversación al cerrar la app.
            </span>
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            <p className="text-[11px] text-violet-300/60">Cargando conversación…</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="mx-auto max-w-[320px] my-6 p-4 rounded-2xl bg-[#140827] border border-red-500/25 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-500/25 text-red-300 mx-auto flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">No pudimos conectar el chat</p>
              <p className="text-[11px] text-violet-300/65 leading-relaxed">
                {error || 'Revisá la conexión con Chatwoot.'}
              </p>
            </div>
            <button
              type="button"
              onClick={reload}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-[0.98] text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 border border-violet-400/25 shadow-[0_2px_10px_rgba(124,58,237,0.25)] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {phase === 'ready' && connection !== 'connected' && (
          <div className="flex justify-center">
            <span
              className={`text-[10px] px-3 py-1 rounded-full border text-center leading-relaxed ${
                connection === 'offline'
                  ? 'text-red-200/85 bg-red-950/25 border-red-500/25'
                  : 'text-amber-200/85 bg-amber-950/25 border-amber-500/25'
              }`}
            >
              {connection === 'offline'
                ? 'Sin conexión. Reintentaremos automáticamente.'
                : 'Reconectando con el soporte…'}
            </span>
          </div>
        )}

        {phase === 'ready' && syncError && (
          <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-amber-950/25 border border-amber-500/25 text-[10.5px] text-amber-100/85 leading-relaxed">
            <span className="flex items-start gap-1.5 min-w-0">
              <WifiOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{syncError}</span>
            </span>
            <button
              type="button"
              onClick={retrySync}
              className="shrink-0 font-bold text-white underline underline-offset-2 hover:text-amber-50 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {phase === 'ready' && sendError && (
          <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-red-950/35 border border-red-500/30 text-[10.5px] text-red-100/90 leading-relaxed">
            <span className="flex items-start gap-1.5 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{sendError}</span>
            </span>
            <button
              type="button"
              onClick={dismissSendError}
              aria-label="Cerrar aviso"
              className="shrink-0 text-red-200/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {phase === 'ready' && messages.length === 0 && !syncError && (
          <div className="mx-auto max-w-[300px] my-8 p-4 rounded-2xl bg-[#130726]/90 border border-violet-500/20 text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-violet-600/15 border border-violet-500/25 text-violet-300 mx-auto flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white">Iniciá la conversación</p>
            <p className="text-[11px] text-violet-300/60 leading-relaxed">
              Escribí tu consulta y un asesor de GANAMOS te responderá por este mismo chat.
            </p>
          </div>
        )}

        {phase === 'ready' &&
          messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <div
                key={message.key}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs border border-violet-400/25'
                      : 'bg-[#15082a] text-violet-100 rounded-bl-xs border border-violet-500/20'
                  }`}
                >
                  <p className="break-words font-normal text-[13px] sm:text-[13.5px]">
                    {message.text}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9.5px] ${
                      isUser ? 'text-violet-200/80' : 'text-violet-400/50'
                    }`}
                  >
                    <span>{formatChatTime(message.createdAt)}</span>
                    {isUser && message.status === 'sending' && (
                      <>
                        <span className="text-[9px]">Enviando…</span>
                        <Clock className="w-3 h-3 text-violet-200/80" />
                      </>
                    )}
                    {isUser && message.status === 'sent' && (
                      <CheckCheck className="w-3 h-3 text-violet-200" />
                    )}
                    {isUser && message.status === 'failed' && (
                      <AlertCircle className="w-3 h-3 text-red-200" />
                    )}
                  </div>

                  {isUser && message.status === 'failed' && (
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className="text-[9.5px] text-red-200/90">No enviado</span>
                      <button
                        type="button"
                        onClick={() => retryMessage(message.key)}
                        className="text-[9.5px] font-bold text-white underline underline-offset-2 hover:text-violet-100 cursor-pointer"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {phase === 'ready' && agentTyping && (
          <div className="flex items-start">
            <div className="px-3.5 py-2 rounded-2xl rounded-bl-xs bg-[#15082a] border border-violet-500/20 text-violet-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-xs text-violet-300/70">Escribiendo...</span>
              <div className="flex gap-1 items-center ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions pills */}
      {keyboardOffset === 0 && (
        <div className="px-4 sm:px-5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-violet-950/40">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              disabled={!canInteract}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-violet-950/50 hover:bg-violet-900/50 active:bg-violet-800 text-violet-300 hover:text-white border border-violet-500/15 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-violet-950/50 disabled:hover:text-violet-300"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* EMOJI PICKER DRAWER */}
      {showEmojiPicker && (
        <div className="relative z-20 border-t border-violet-800/30 bg-[#120524] p-3 shadow-2xl shrink-0 transition-all max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-violet-900/30">
            <span className="text-xs font-bold text-violet-200">
              Emojis
            </span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 text-violet-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Cerrar"
              aria-label="Cerrar selector de emojis"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pr-1">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-1">
                <span className="text-[10px] font-semibold text-violet-400/60 uppercase tracking-wider block">
                  {category.name}
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="h-8 sm:h-9 rounded-xl hover:bg-violet-900/40 active:scale-95 flex items-center justify-center text-lg transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input bar - Standard 44px elements */}
      <div className="p-3 bg-[#0e041e]/95 backdrop-blur-md border-t border-violet-950/60 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-[420px] mx-auto"
        >
          {/* Emoji Trigger */}
          <button
            type="button"
            disabled={!canInteract}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setTimeout(() => scrollToBottom('smooth'), 100);
            }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer border shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
              showEmojiPicker
                ? 'bg-violet-600 text-white border-violet-400'
                : 'bg-[#15082a] text-violet-300/80 hover:text-white hover:bg-violet-950 border-violet-500/20'
            }`}
            title="Insertar emoji"
            aria-label="Insertar emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            disabled={!canInteract}
            onFocus={() => {
              setTimeout(() => scrollToBottom('smooth'), 150);
            }}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={inputPlaceholder}
            autoComplete="off"
            enterKeyHint="send"
            className="flex-1 h-11 px-3.5 bg-[#15082a] text-white placeholder-violet-300/35 text-xs sm:text-sm rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canInteract || !inputText.trim()}
            aria-label="Enviar mensaje"
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-[0_2px_10px_rgba(124,58,237,0.25)] transition-all cursor-pointer border border-violet-400/25 shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
