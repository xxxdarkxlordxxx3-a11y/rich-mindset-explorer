
import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ToolboxIcon, ScaleIcon } from './IconComponents';

const motion = framerMotion as any;

interface HeroProps {
  onTestsClick: () => void;
  onToolsClick: () => void;
  onRulesClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onTestsClick, onToolsClick, onRulesClick }) => {
  const { t } = useLanguage();

  return (
    <section className="py-24 sm:py-32 text-center px-4">
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400"
        >
          {t('heroTitle')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-light-text/80 dark:text-dark-text/80"
        >
          {t('heroSubtitle')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Investment Rules Button - First/Left */}
          <button
            onClick={onRulesClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            <ScaleIcon className="w-6 h-6" />
            {t('investmentRules')}
          </button>

          {/* Test Financial IQ Button - Middle */}
          <button
            onClick={onTestsClick}
            className="w-full sm:w-auto px-8 py-4 bg-light-primary text-light-primary-text dark:bg-dark-primary dark:text-dark-primary-text font-bold rounded-full text-lg shadow-2xl shadow-blue-500/40 dark:shadow-blue-500/20 transform transition-all duration-300 hover:scale-105 hover:bg-light-primary-hover dark:hover:dark-primary-hover"
          >
            {t('testFinancialIQ')}
          </button>

          {/* Financial Tools Button - Right */}
          <button
            onClick={onToolsClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-light-card/80 dark:bg-dark-card/80 border-2 border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-bold rounded-full text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:border-light-primary dark:hover:border-dark-primary"
          >
            <ToolboxIcon className="w-6 h-6" />
            {t('financialTools')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
