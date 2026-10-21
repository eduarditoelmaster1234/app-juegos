import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Headphones, ShieldCheck, CheckCheck, Smile, X } from 'lucide-react';

interface Message {
  id: string;
  sender: 'support' | 'user';
  text: string;
  timestamp: string;
}

interface ChatScreenProps {
  username: string;
  onBackToHome: () => void;
  initialTopic?: 'cargar' | 'retirar' | null;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Reacciones & Gestos',
    emojis: ['😀', '😂', '😎', '😍', '🥳', '🤩', '🤑', '🤔', '👍', '👏', '🙌', '🔥', '🚀', '💯'],
  },
  {
    name: 'Casino & Suerte',
    emojis: ['🎰', '🎲', '👑', '💎', '🍀', '🃏', '💰', '💵', '🪙', '🎯', '🏆', '✨', '⭐', '🍾'],
  },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  username,
  onBackToHome,
  initialTopic = null,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const defaultMessages: Message[] = [
      {
        id: 'msg-1',
        sender: 'support',
        text: '¡Hola! Te damos la bienvenida a la atención oficial de GANAMOS.',
        timestamp: '18:30',
      },
    ];

    if (initialTopic === 'cargar') {
      defaultMessages.push({
        id: 'msg-topic-cargar',
        sender: 'support',
        text: '¿Deseas realizar una carga de fichas? Indicanos tu usuario y el medio con el que querés operar.',
        timestamp: '18:31',
      });
    } else if (initialTopic === 'retirar') {
      defaultMessages.push({
        id: 'msg-topic-retirar',
        sender: 'support',
        text: '¿Deseas solicitar un retiro de fichas? Indicanos tu usuario para coordinar la operación.',
        timestamp: '18:31',
      });
    } else {
      defaultMessages.push({
        id: 'msg-2',
        sender: 'support',
        text: '¿En qué te podemos ayudar hoy? Estamos disponibles para asistirte con el acceso o el juego.',
        timestamp: '18:31',
      });
    }

    return defaultMessages;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Listen to window.visualViewport changes to detect virtual keyboard opening/closing
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      // Calculate difference between window height and visual viewport height
      // This represents keyboard height + any dynamic browser bars
      const layoutHeight = window.innerHeight;
      const visualHeight = vv.height;
      const offsetTop = vv.offsetTop;

      // Positive offset indicates virtual keyboard presence
      const offset = Math.max(0, layoutHeight - visualHeight - offsetTop);
      setKeyboardOffset(offset);

      // Keep active messages visible
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
  }, [messages, isTyping, showEmojiPicker]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowEmojiPicker(false);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Gracias por comunicarte. Un asesor de GANAMOS te responderá en breve.';
      const lower = text.toLowerCase();

      if (lower.includes('cargar') || lower.includes('carga')) {
        replyText = 'Para cargar fichas, indicá el monto deseado y te brindaremos los datos oficiales.';
      } else if (lower.includes('retirar') || lower.includes('retiro')) {
        replyText = 'Para gestionar un retiro, verificaremos tu saldo disponible y tus datos bancarios.';
      } else if (lower.includes('jugar') || lower.includes('ganamosbet') || lower.includes('entrar')) {
        replyText = 'Podés ingresar al juego directamente pulsando el botón JUGAR en la pantalla principal.';
      } else if (lower.includes('hola') || lower.includes('buenas')) {
        replyText = `¡Hola ${username}! ¿En qué podemos ayudarte en este momento?`;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'support',
        text: replyText,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 700);
  };

  const quickPrompts = [
    'Quiero cargar fichas 💰',
    'Quiero retirar fichas 🪙',
    '¿Cómo ingresar a jugar? 🎰',
    'Horarios de soporte 🕒',
  ];

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

      {/* Compact, clean Header */}
      <header className="relative z-10 flex items-center justify-between px-3.5 py-2.5 bg-[#100522]/95 backdrop-blur-md border-b border-violet-950/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToHome}
            aria-label="Volver a Inicio"
            className="w-9 h-9 flex items-center justify-center text-violet-300 hover:text-white rounded-full hover:bg-violet-900/20 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white border border-violet-400/30 shadow-[0_0_10px_rgba(139,92,246,0.25)]">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#100522]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                Soporte GANAMOS
              </h2>
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <p className="text-[10px] text-violet-300/60 mt-0.5">
              En línea · Cargas, retiros y consultas
            </p>
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3">
        {/* Subtle security notice */}
        <div className="flex justify-center my-0.5">
          <span className="text-[10px] text-violet-300/45 bg-violet-950/30 border border-violet-800/25 px-2.5 py-0.5 rounded-full">
            Canal de atención oficial GANAMOS
          </span>
        </div>

        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs border border-violet-400/25'
                    : 'bg-[#15082a] text-violet-100 rounded-bl-xs border border-violet-500/20'
                }`}
              >
                <p className="break-words font-normal text-[13px] sm:text-[13.5px]">
                  {message.text}
                </p>
                <div
                  className={`flex items-center justify-end gap-1 mt-0.5 text-[9px] ${
                    isUser ? 'text-violet-200/80' : 'text-violet-400/50'
                  }`}
                >
                  <span>{message.timestamp}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-violet-200" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start">
            <div className="px-3.5 py-2 rounded-2xl rounded-bl-xs bg-[#15082a] border border-violet-500/20 text-violet-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-xs text-violet-300/70">Escribiendo</span>
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

      {/* Quick suggestions pills - hide if keyboard is open to conserve vertical space */}
      {keyboardOffset === 0 && (
        <div className="px-3 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-violet-950/50 hover:bg-violet-900/50 active:bg-violet-800 text-violet-300 hover:text-white border border-violet-500/15 transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* EMOJI PICKER DRAWER - Correctly positioned above input */}
      {showEmojiPicker && (
        <div className="relative z-20 border-t border-violet-800/30 bg-[#120524] p-2.5 shadow-2xl shrink-0 transition-all max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-violet-900/30">
            <span className="text-[11px] font-bold text-violet-200">
              Emojis
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 text-violet-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-0.5">
                <span className="text-[9px] font-semibold text-violet-400/60 uppercase tracking-wider block">
                  {category.name}
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="h-8 rounded-lg hover:bg-violet-900/40 active:scale-95 flex items-center justify-center text-base transition-transform cursor-pointer"
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

      {/* Input bar - Stays docked above keyboard */}
      <div className="p-2.5 bg-[#0e041e]/95 backdrop-blur-md border-t border-violet-950/60 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Emoji Trigger */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setTimeout(() => scrollToBottom('smooth'), 100);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer border shrink-0 ${
              showEmojiPicker
                ? 'bg-violet-600 text-white border-violet-400'
                : 'bg-[#15082a] text-violet-300/80 hover:text-white hover:bg-violet-950 border-violet-500/20'
            }`}
            title="Insertar emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onFocus={() => {
              // Scroll to bottom smoothly when keyboard opens
              setTimeout(() => scrollToBottom('smooth'), 150);
            }}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribí tu mensaje..."
            className="flex-1 h-10 px-3.5 bg-[#15082a] text-white placeholder-violet-300/35 text-xs sm:text-sm rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Enviar mensaje"
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-[0_2px_10px_rgba(124,58,237,0.25)] transition-all cursor-pointer border border-violet-400/25 shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
