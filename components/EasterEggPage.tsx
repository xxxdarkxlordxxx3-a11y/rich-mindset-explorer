import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HomeIcon, AssetIcon } from './IconComponents';
import type { SuccessStory } from '../types';

const motion = framerMotion as any;

interface EasterEggPageProps {
    onDone: () => void;
    type: 'time' | 'myth';
    story: SuccessStory | null; // story is nullable for 'time' type
}

const EasterEggPage: React.FC<EasterEggPageProps> = ({ onDone, type, story }) => {
    const { t } = useLanguage();

    // Safeguard for the 'myth' type which requires story data
    if (type === 'myth' && !story) {
        return (
            <section className="min-h-screen py-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">{t('errorStoryMissing')}</p>
                    <button onClick={onDone} className="mt-4 px-4 py-2 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                        {t('goBackHome')}
                    </button>
                </div>
            </section>
        );
    }
    
    const content = {
        time: {
            title: t('easterEggTimeTitle'),
            icon: <AssetIcon className="w-20 h-20 text-teal-500" />,
            sections: [
                {
                    title: t('easterEggCompoundTitle'),
                    text: t('easterEggCompoundContent'),
                },
                {
                    title: t('easterEggStartEarlyTitle'),
                    text: t('easterEggStartEarlyContent'),
                }
            ]
        },
        myth: {
            title: t('easterEggMythTitle'),
            icon: <AssetIcon className="w-20 h-20 text-amber-500" />,
            sections: [
                 {
                    title: t('easterEggMythSubtitle'),
                    text: story ? t('easterEggMythContent').replace('{name}', story.name).replace('{timeToWealth}', story.timeToWealth) : '',
                }
            ]
        }
    }[type];

    return (
        <section className="min-h-screen py-20 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full max-w-3xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-8 shadow-2xl text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                    className="flex justify-center mb-6"
                >
                    {content.icon}
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500">
                    {content.title}
                </h2>
                
                <div className="space-y-8 text-lg text-light-text/80 dark:text-dark-text/80 leading-relaxed text-left rtl:text-right">
                    {content.sections.map((section, index) => (
                         <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.2, duration: 0.5 }}
                        >
                            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">{section.title}</h3>
                            <p>{section.text}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <button onClick={onDone} className="mt-10 px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary-text dark:text-dark-primary-text font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <HomeIcon className="w-5 h-5" />
                        {t('goBackHome')}
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default EasterEggPage;