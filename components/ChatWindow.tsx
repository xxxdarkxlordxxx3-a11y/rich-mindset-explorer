import React, { useState, useRef, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, UserContext } from '../types';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import { CloseIcon, SendIcon } from './IconComponents';
import ChatBubble from './ChatBubble';
import { useLanguage } from '../context/LanguageContext';

const motion = framerMotion as any;

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  userContext: UserContext;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, userContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();
  const chatRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-flash-lite-latest',
        config: {
          systemInstruction: `You are a financial independence mentor. Your primary goal is to empower the user to become self-reliant and break free from the traditional employee mindset. Never give direct financial advice. Instead, provide frameworks, ask empowering questions, and explain concepts that lead them to their own conclusions. Emphasize that a job is a temporary tool for capital, not a long-term career. Your tone is firm, motivating, and that of a seasoned mentor who has achieved financial freedom. The user is currently: ${userContext.activity}. Your responses must be in ${language === 'ar' ? 'Egyptian Arabic' : 'English'}. Be concise and empowering.`,
        },
      });
      setMessages([{
          id: 'initial',
          role: 'model',
          text: t('chatGreeting')
      }]);
    } else {
      setMessages([]);
      chatRef.current = null;
    }
  }, [isOpen, language, t, userContext.activity]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatRef.current) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: input });
      
      let modelResponse = '';
      const modelMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: modelResponse } : msg
        ));
      }

    } catch (e) {
      console.error('Error sending message:', e);
      setMessages(prev => [...prev, { id: 'error', role: 'model', text: t('errorOccurred') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AnimatePresence>
          {isOpen && (
              <>
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 z-40"
                      onClick={onClose}
                  />
                  <motion.div
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="fixed bottom-0 ltr:right-0 rtl:left-0 m-4 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-2xl border border-light-border dark:border-dark-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                  >
                      <header className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
                          <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{t('chatTitle')}</h3>
                          <button onClick={onClose} className="text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text transition-colors">
                              <CloseIcon />
                          </button>
                      </header>
                      
                      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                          {messages.map((msg) => (
                              <ChatBubble key={msg.id} message={msg} />
                          ))}
                          <div ref={messagesEndRef} />
                      </main>

                      <footer className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
                          <form 
                              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                              className="relative"
                          >
                              <input
                                  type="text"
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  placeholder={t('manusPromptPlaceholder')}
                                  className="w-full p-3 ltr:pr-14 rtl:pl-14 bg-light-secondary dark:bg-dark-secondary rounded-xl border-2 border-transparent focus:border-cyan-500 focus:ring-0 outline-none transition-colors"
                                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                              />
                              <button type="submit" disabled={isLoading || !input.trim()} className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                                  <SendIcon />
                              </button>
                          </form>
                      </footer>
                  </motion.div>
              </>
          )}
      </AnimatePresence>
  );
};

export default ChatWindow;