import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HomeIcon, CloseIcon, CheckCircleIcon } from './IconComponents';
import type { GeneratedContent as GeneratedContentType } from '../types';

const motion = framerMotion as any;

interface GeneratedContentProps {
    onDone: () => void;
    content: GeneratedContentType;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ onDone, content }) => {
    const { t } = useLanguage();

    if (!content) return null;

    return (
        <section className="py-10 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full max-w-3xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-8 shadow-2xl relative"
            >
                <button onClick={onDone} className="absolute top-4 ltr:right-4 rtl:left-4 text-light-text/70 hover:text-light-text dark:text-dark-text/70 dark:hover:text-dark-text">
                    <CloseIcon />
                </button>

                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500">
                        {content.title}
                    </h2>
                </div>
                
                <div className="mt-6 space-y-6 text-lg text-light-text/80 dark:text-dark-text/80 leading-relaxed text-left rtl:text-right">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {content.explanation}
                    </motion.p>
                    
                    {content.example && (
                         <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="p-4 bg-light-secondary/50 dark:bg-dark-secondary/50 border-l-4 border-cyan-500 italic"
                        >
                           <strong>{t('example')} </strong>{content.example}
                        </motion.div>
                    )}
                    
                    {content.keyPoints && content.keyPoints.length > 0 && (
                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }} 
                            className="space-y-3"
                        >
                            {content.keyPoints.map((point, index) => (
                                <motion.li 
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircleIcon className="w-6 h-6 text-teal-500 mt-1 flex-shrink-0" />
                                    <span>{point}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center"
                >
                    <button onClick={onDone} className="mt-10 px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:-translate-y-1">
                        {t('goBackHome')}
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default GeneratedContent;