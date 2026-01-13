import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    return (
        <footer className="w-full border-t border-light-border dark:border-dark-border bg-light-secondary dark:bg-dark-secondary">
            <div className="container mx-auto py-6 text-center text-sm text-light-text/70 dark:text-dark-text/70 px-4">
                <p>
                    &copy; {new Date().getFullYear()} {t('appLogoName')}. All Rights Reserved.
                    <span className="mx-2">|</span>
                    <a 
                        href="https://www.facebook.com/hamzaDXE" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-light-text/90 dark:text-dark-text/90"
                    >
                        {t('foundersPage')}
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;