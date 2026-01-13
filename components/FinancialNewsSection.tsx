import React, { useState, useCallback } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import type { UserContext, NewsData } from '../types';
import { getFinancialNews } from '../services/geminiService';
import { NewspaperIcon, LoadingIcon } from './IconComponents';

const motion = framerMotion as any;

interface FinancialNewsSectionProps {
    userContext: UserContext;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const FinancialNewsSection: React.FC<FinancialNewsSectionProps> = ({ userContext }) => {
    const { language, t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [newsData, setNewsData] = useState<NewsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        { key: 'All', label: t('newsCategoryAll') },
        { key: 'Stocks', label: t('newsCategoryStocks') },
        { key: 'Bonds & Certificates', label: t('newsCategoryBonds') },
        { key: 'Real Estate', label: t('newsCategoryRealEstate') },
        { key: 'Gold', label: t('newsCategoryGold') },
        { key: 'Projects', label: t('newsCategoryProjects') },
    ];

    const fetchNewsForCategory = useCallback(async (category: string) => {
        setIsLoading(true);
        setError(null);
        setNewsData(null);

        const cacheKey = `news_${language}_${category}`;
        const cachedItem = sessionStorage.getItem(cacheKey);

        if (cachedItem) {
            try {
                const { timestamp, data } = JSON.parse(cachedItem);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setNewsData(data);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                // Invalid cache item, proceed to fetch
                sessionStorage.removeItem(cacheKey);
            }
        }

        try {
            const response = await getFinancialNews(language, category, userContext);
            const data: NewsData = {
                text: response.text,
                sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
            };
            setNewsData(data);
            sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
        } catch (e: any) {
            console.error('Failed to fetch news:', e);
            const errorMessage = e.toString();
            if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                setError(t('newsRateLimitError'));
            } else {
                setError(t('newsLoadingError'));
            }
        } finally {
            setIsLoading(false);
        }
    }, [language, userContext, t]);
    
    const handleCategoryClick = (categoryKey: string) => {
        setActiveCategory(categoryKey);
        fetchNewsForCategory(categoryKey);
    };
    
    return (
        <section id="news" className="mt-24 py-20 px-4 bg-light-secondary/50 dark:bg-dark-secondary/50">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                     <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                        <NewspaperIcon className="h-8 w-8 text-cyan-500" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">{t('financialNewsTitle')}</h2>
                    </div>
                    <p className="text-lg text-light-text/80 dark:text-dark-text/80 max-w-3xl mx-auto">{t('financialNewsSubtitle')}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => handleCategoryClick(cat.key)}
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 ${
                                activeCategory === cat.key
                                    ? 'bg-light-primary text-light-primary-text dark:bg-dark-primary dark:text-dark-primary-text shadow-lg shadow-blue-500/30'
                                    : 'bg-light-card/50 dark:bg-dark-card/50 border border-light-border dark:border-dark-border text-light-text/80 dark:text-dark-text/80 hover:bg-light-card dark:hover:bg-dark-card'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto min-h-[300px] flex items-center justify-center bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center text-center"
                            >
                                <LoadingIcon />
                                <p className="mt-2 text-light-text/70 dark:text-dark-text/70">{t('loadingMessagePatience')}</p>
                            </motion.div>
                        ) : error ? (
                             <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center text-red-500"
                            >
                                {error}
                            </motion.div>
                        ) : newsData ? (
                            <motion.div
                                key={`${activeCategory}-${language}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-light-text dark:text-dark-text">
                                    {newsData.text}
                                </div>
                                {newsData.sources.length > 0 && (
                                    <div className="mt-6 border-t border-light-border dark:border-dark-border pt-4">
                                        <h4 className="text-md font-bold mb-2 text-light-text/80 dark:text-dark-text/80">{t('newsSources')}</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {newsData.sources.map((source, index) => (
                                                <li key={index} className="text-sm truncate">
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline" title={source.web.title || source.web.uri}>
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="initial"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-light-text/70 dark:text-dark-text/70"
                            >
                                <NewspaperIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-semibold">{t('selectNewsCategoryPrompt')}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default FinancialNewsSection;