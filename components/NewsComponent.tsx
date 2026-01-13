import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { CloseIcon, NewspaperIcon } from './IconComponents';
import type { NewsData } from '../types';

const motion = framerMotion as any;

interface NewsComponentProps {
    newsData: NewsData | null;
    onDone: () => void;
}

const NewsComponent: React.FC<NewsComponentProps> = ({ newsData, onDone }) => {
    const { t } = useLanguage();

    return (
        <section className="py-10 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
            >
                <button onClick={onDone} className="absolute top-4 ltr:right-4 rtl:left-4 text-light-text/70 hover:text-light-text dark:text-dark-text/70 dark:hover:text-dark-text">
                    <CloseIcon />
                </button>
                 <div className="text-center mb-6">
                    <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                        <NewspaperIcon className="h-8 w-8 text-cyan-500" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">{t('financialNewsTitle')}</h2>
                    </div>
                </div>
                {newsData ? (
                    <>
                        <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-light-text dark:text-dark-text">
                            {newsData.text}
                        </div>
                        {newsData.sources.length > 0 && (
                            <div className="mt-6 border-t border-light-border dark:border-dark-border pt-4">
                                <h4 className="text-md font-bold mb-2 text-light-text/80 dark:text-dark-text/80">{t('newsSources')}</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {newsData.sources.map((source, index) => (
                                        <li key={index} className="text-sm">
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <p>{t('errorOccurred')}</p>
                )}
            </motion.div>
        </section>
    );
};

export default NewsComponent;