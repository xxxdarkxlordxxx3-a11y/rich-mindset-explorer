import React from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './IconComponents';

const motion = framerMotion as any;

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="bg-light-secondary dark:bg-dark-secondary hover:bg-light-border dark:hover:bg-dark-border/50 text-light-text dark:text-dark-text font-bold p-2 rounded-full transition-colors duration-300 flex items-center justify-center w-10 h-10"
      aria-label="Toggle theme"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'light' ? <SunIcon className="w-5 h-5 text-yellow-500" /> : <MoonIcon className="w-5 h-5 text-dark-text" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;