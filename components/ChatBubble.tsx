import React from 'react';
import type { ChatMessage } from '../types';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const motion = framerMotion as any;

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { language } = useLanguage();
  const isUser = message.role === 'user';

  const userBubbleClasses = language === 'ar' 
    ? 'rounded-e-xl rounded-es-xl' 
    : 'rounded-s-xl rounded-ee-xl';
  const modelBubbleClasses = language === 'ar' 
    ? 'rounded-s-xl rounded-ee-xl' 
    : 'rounded-e-xl rounded-es-xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex flex-col w-full max-w-[320px] leading-1.5 p-3 ${
          isUser
            ? `bg-light-primary dark:bg-dark-primary text-light-primary-text dark:text-dark-primary-text ${userBubbleClasses}`
            : `bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text ${modelBubbleClasses}`
        }`}
      >
        <p className={`text-sm font-normal whitespace-pre-wrap ${language === 'ar' ? 'text-right' : 'text-left'}`}>{message.text}</p>
      </div>
    </motion.div>
  );
};

export default ChatBubble;