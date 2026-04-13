import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, MessageCircle, AlertTriangle, Minimize2, Maximize2 } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { cn } from '../lib/utils';

export const GlobalAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: "Hello! I'm Swasthya AI, your clinical intelligence assistant. How can I help you with your patients today?", answer_found: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'doctor', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // For global chat, we pass null for patient data or generic context
      const result = await geminiService.chatWithDoctor(null, messages, input);
      setMessages(prev => [...prev, { role: 'ai', text: result.text, answer_found: result.answer_found }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "No, I don't have much data to answer your question. Sorry, is there anything else you want to ask?", answer_found: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "bg-white rounded-[32px] shadow-2xl border border-brand-primary/10 overflow-hidden flex flex-col mb-4 transition-all duration-300",
              isMinimized ? "h-16 w-64" : "h-[600px] w-[400px]"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm">Swasthya AI</h3>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Clinical Intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === 'doctor' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.role === 'doctor' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === 'doctor'
                          ? "bg-brand-primary text-white rounded-tr-none"
                          : msg.answer_found === false
                            ? "bg-white border-2 border-yellow-200 text-text-primary rounded-tl-none"
                            : "bg-white border border-gray-100 text-text-primary rounded-tl-none"
                      )}>
                        {msg.answer_found === false && (
                          <div className="flex items-center gap-2 mb-2 text-yellow-700 font-bold text-xs bg-yellow-50 p-2 rounded-lg">
                            <AlertTriangle size={14} />
                            Limited Data
                          </div>
                        )}
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-text-muted mt-2 uppercase font-black tracking-widest px-1">
                        {msg.role === 'doctor' ? 'Clinical Lead' : 'Swasthya Intelligence'}
                      </span>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-5 border-t border-gray-100 bg-white">
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="p-3.5 bg-brand-primary text-white rounded-2xl hover:bg-brand-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-4 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 group relative",
          isOpen ? "bg-white text-brand-primary rotate-90" : "bg-brand-primary text-white"
        )}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-20" />
        )}
        {isOpen ? <X size={24} /> : (
          <>
            <MessageCircle size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black uppercase tracking-widest text-xs whitespace-nowrap">
              Ask Swasthya AI
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
};
