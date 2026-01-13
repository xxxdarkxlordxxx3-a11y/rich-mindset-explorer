import React, { ReactNode } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { CloseIcon } from './IconComponents';

const motion = framerMotion as any;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  bodyClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, bodyClassName = "p-6" }) => {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      x: isDesktop ? '-50%' : '0%',
      y: isDesktop ? '-50%' : '0%',
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: isDesktop ? '-50%' : '0%',
      y: isDesktop ? '-50%' : '0%',
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: isDesktop ? '-50%' : '0%',
      y: isDesktop ? '-50%' : '0%',
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 w-full h-full sm:w-[90vw] sm:max-w-3xl sm:h-auto sm:max-h-[90vh] bg-light-card/40 dark:bg-dark-card/40 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-none sm:rounded-2xl shadow-2xl flex flex-col z-[70] overflow-hidden"
          >
            <header className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
              {title && <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{title}</h3>}
              <button onClick={onClose} className="text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text transition-colors ltr:ml-auto rtl:mr-auto">
                <CloseIcon />
              </button>
            </header>
            <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;