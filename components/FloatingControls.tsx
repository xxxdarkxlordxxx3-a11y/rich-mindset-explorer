import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

const FloatingControls: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    };

    return (
        <div className="fixed top-4 ltr:right-4 rtl:left-4 z-50 flex items-center gap-2 p-1.5 bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/80 dark:border-dark-border/80 rounded-full shadow-xl shadow-slate-400/60 dark:shadow-xl dark:shadow-black/30">
            <ThemeToggle />
            <button
                onClick={toggleLanguage}
                className="bg-light-secondary dark:bg-dark-secondary hover:bg-light-border dark:hover:bg-dark-border/50 text-light-text dark:text-dark-text font-bold w-10 h-10 rounded-full transition-colors duration-300 flex items-center justify-center text-lg"
                aria-label="Toggle Language"
            >
                {language === 'en' ? 'ع' : 'E'}
            </button>
        </div>
    );
};

export default FloatingControls;