
import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import type { Story, SuccessStory } from '../types';
import { LearnIcon, AssetIcon } from './IconComponents';
import { translations } from '../localization/translations';

const motion = framerMotion as any;

interface InspirationSectionProps {
    onSelectStory: (story: Story) => void;
}

const InspirationSection: React.FC<InspirationSectionProps> = ({ onSelectStory }) => {
    const { language, t } = useLanguage();
    
    // Always use success stories (Legends)
    const stories = translations[language].successStories;

    const title = t('inspirationTitleSuccess');
    const subtitle = t('inspirationSubtitleSuccess');

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };
    
    const createStoryId = (name: string) => {
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-');
        return `story-${sanitizedName}`;
    };

    return (
        <section id="inspiration" className="py-20 px-4 transition-colors duration-500 bg-light-secondary/50 dark:bg-dark-secondary/50">
            <div className="container mx-auto">
                <div className="text-center mb-10 relative">
                    <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                        <LearnIcon className="h-8 w-8 text-indigo-500" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">{title}</h2>
                    </div>
                    <p className="text-lg text-light-text/80 dark:text-dark-text/80 max-w-3xl mx-auto">{subtitle}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {stories.map((story, index) => {
                        return (
                            <motion.div
                                key={`${story.name}-${language}`}
                                id={createStoryId(story.name)}
                                className="backdrop-blur-xl border-2 rounded-2xl shadow-xl flex flex-col overflow-hidden bg-light-card/30 dark:bg-dark-card/30 border-slate-300 dark:border-slate-700 shadow-slate-500/30 dark:shadow-black/40"
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                                custom={index}
                                layout
                            >
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{story.name}</h3>
                                        <span className="text-xs font-semibold bg-light-secondary/20 dark:bg-dark-secondary/20 backdrop-blur-xl border border-light-border/20 dark:border-dark-border/20 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                            {t('age')}: {story.age}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm font-semibold mb-2 text-indigo-500">
                                        {(story as SuccessStory).sourceOfWealth}
                                    </p>
                                    
                                    <div className="text-sm text-light-text/70 dark:text-dark-text/70 mb-3">
                                        <p><span className="font-semibold">{t('netWorth')}:</span> {(story as SuccessStory).netWorth}</p>
                                    </div>
                                    
                                    <p className="text-light-text/80 dark:text-dark-text/80 text-sm flex-grow mb-4 leading-relaxed line-clamp-3">
                                        {story.bio}
                                    </p>
                                    
                                    <button
                                        onClick={() => onSelectStory(story)}
                                        className="mt-auto w-full text-center px-4 py-2 font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl border-2 backdrop-blur-xl bg-light-secondary/20 dark:bg-dark-secondary/20 border-slate-300/80 dark:border-slate-600/80 text-light-text dark:text-dark-text hover:bg-light-border/40 dark:hover:bg-dark-border/40"
                                    >
                                        {t('readStory')}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default InspirationSection;
