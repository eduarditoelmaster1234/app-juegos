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
    name: 'Caras & Gestos',
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // Support automatic reply simulation
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Gracias por escribirnos. Un operador de GANAMOS ya está al tanto de tu mensaje.';
      const lower = text.toLowerCase();

      if (lower.includes('cargar') || lower.includes('carga')) {
        replyText = 'Para cargar fichas, recordá que la acreditación se coordina directamente con nuestros canales oficiales autorizados.';
      } else if (lower.includes('retirar') || lower.includes('retiro')) {
        replyText = 'Para solicitar un retiro, un asesor verificará tu saldo disponible y los datos de destino.';
      } else if (lower.includes('jugar') || lower.includes('ganamosbet') || lower.includes('entrar')) {
        replyText = 'Podés ingresar al juego directamente tocando el botón grande "JUGAR" en la pantalla de Inicio.';
      } else if (lower.includes('hola') || lower.includes('buenas')) {
        replyText = `¡Hola ${username}! ¿En qué te podemos asesorar en este momento?`;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'support',
        text: replyText,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 750);
  };

  const quickPrompts = [
    'Quiero cargar fichas 💰',
    'Quiero retirar fichas 🪙',
    '¿Cómo ingresar a jugar? 🎰',
    'Horarios de atención 🕒',
  ];

  return (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-b from-[#0e0422] via-[#090217] to-[#070112] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Chat Top Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-[#130728]/95 backdrop-blur-md border-b border-violet-900/40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            aria-label="Volver a Inicio"
            className="p-2 -ml-1 text-violet-300 hover:text-white rounded-full hover:bg-violet-900/30 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white border border-violet-400/30 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#130728]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                Soporte GANAMOS
              </h2>
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <p className="text-[11px] text-violet-300/60 mt-0.5">
              En línea · Cargas, retiros y asistencia
            </p>
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Notice badge */}
        <div className="flex justify-center my-1">
          <span className="text-[11px] text-violet-300/50 bg-violet-950/40 border border-violet-800/30 px-3 py-1 rounded-full">
            Canal oficial y seguro de GANAMOS
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
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs shadow-[0_4px_16px_rgba(124,58,237,0.25)] border border-violet-400/20'
                    : 'bg-[#1a0a33] text-violet-100 rounded-bl-xs border border-violet-500/20 shadow-sm'
                }`}
              >
                <p className="break-words font-normal text-[13.5px]">
                  {message.text}
                </p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    isUser ? 'text-violet-200/80' : 'text-violet-400/60'
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
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-xs bg-[#1a0a33] border border-violet-500/20 text-violet-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-xs text-violet-300/80">Escribiendo</span>
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
      <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-violet-950/60 hover:bg-violet-900/60 active:bg-violet-800 text-violet-300 hover:text-white border border-violet-500/20 transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* EMOJI PICKER DRAWER */}
      {showEmojiPicker && (
        <div className="relative z-20 border-t border-violet-800/40 bg-[#14062a] p-3 shadow-2xl shrink-0 transition-all">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-violet-900/40">
            <span className="text-xs font-bold text-violet-200">
              Seleccionar Emoji
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 text-violet-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Cerrar selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-1">
                <span className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-wider block">
                  {category.name}
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="h-9 rounded-lg hover:bg-violet-900/50 active:scale-95 flex items-center justify-center text-lg transition-transform cursor-pointer"
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

      {/* Input bar */}
      <div className="p-3 bg-[#110526]/95 backdrop-blur-md border-t border-violet-900/40 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Emoji Trigger Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer border shrink-0 ${
              showEmojiPicker
                ? 'bg-violet-600 text-white border-violet-400'
                : 'bg-[#1b0c38] text-violet-300 hover:text-white hover:bg-violet-950 border-violet-500/20'
            }`}
            title="Insertar emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribí tu mensaje..."
            className="flex-1 h-11 px-4 bg-[#1b0c38] text-white placeholder-violet-300/40 text-sm rounded-xl border border-violet-500/20 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Enviar mensaje"
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all cursor-pointer border border-violet-400/30 shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
