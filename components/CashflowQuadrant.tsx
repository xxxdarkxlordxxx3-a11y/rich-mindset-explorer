
import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircleIcon, XCircleIcon, UsersIcon, InfoIcon, RiskIcon } from './IconComponents';
import { translations } from '../localization/translations';
import type { SuccessStory } from '../types';

const motion = framerMotion as any;

type QuadrantKey = 'E' | 'S' | 'B' | 'I';

interface CashflowQuadrantProps {
    onTriggerCashflowInfo: (type: 'active' | 'passive' | 'opt' | 'opm') => void;
    onSelectStory: (story: SuccessStory) => void;
}

const HighlightedDescription: React.FC<{
    text: string;
    highlightWord: string;
    highlightColor: string;
    highlightShadow: string;
    onClick: () => void;
}> = ({ text, highlightWord, highlightColor, highlightShadow, onClick }) => {
    const parts = text.split(highlightWord);

    if (parts.length !== 2) {
        return <p className="text-light-text/80 dark:text-dark-text/80 leading-relaxed">{text}</p>;
    }

    return (
        <p className="text-light-text/80 dark:text-dark-text/80 leading-relaxed">
            {parts[0]}
            <button
                onClick={onClick}
                className={`font-bold ${highlightColor} transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-secondary dark:focus:ring-offset-dark-secondary rounded-md px-1`}
                style={{ textShadow: highlightShadow }}
            >
                {highlightWord}
            </button>
            {parts[1]}
        </p>
    );
};

const CashflowQuadrant: React.FC<CashflowQuadrantProps> = ({ onTriggerCashflowInfo, onSelectStory }) => {
    const { language, t } = useLanguage();
    const [activeQuadrant, setActiveQuadrant] = useState<QuadrantKey | null>(null);

    const isRTL = language === 'ar';

    const quadrantData: { [key in QuadrantKey]: { activeColorHex: string, activeColorClass: string, fontClass: string } } = {
      E: { activeColorHex: '#38bdf8', activeColorClass: 'text-sky-400', fontClass: 'font-bold' },
      S: { activeColorHex: '#fbbd23', activeColorClass: 'text-amber-400', fontClass: 'font-bold' },
      B: { activeColorHex: '#c084fc', activeColorClass: 'text-purple-400', fontClass: 'font-black' },
      I: { activeColorHex: '#34d399', activeColorClass: 'text-emerald-400', fontClass: 'font-black' },
    };
    
    const quadrantPositions: { [key in QuadrantKey]: string } = {
      E: `row-start-1 ${isRTL ? 'col-start-2' : 'col-start-1'}`, 
      S: `row-start-2 ${isRTL ? 'col-start-2' : 'col-start-1'}`, 
      B: `row-start-1 ${isRTL ? 'col-start-1' : 'col-start-2'}`, 
      I: `row-start-2 ${isRTL ? 'col-start-1' : 'col-start-2'}`, 
    };


    const renderInfo = () => {
        if (!activeQuadrant) {
            return (
                 <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-8 flex flex-col justify-center items-center h-full">
                    <p className="text-lg text-light-text/70 dark:text-dark-text/70">{t('quadrantDefaultMessage')}</p>
                 </motion.div>
            );
        }
        
        const quadrantInfo = quadrantData[activeQuadrant];
        const advantages = t(`quadrant${activeQuadrant}_advantagesList`).split('|');
        const disadvantages = t(`quadrant${activeQuadrant}_disadvantagesList`).split('|');
        const examples = t(`quadrant${activeQuadrant}_examplesList`).split('|');
        const requirements = (activeQuadrant === 'B' && t('quadrantB_requirementsList')) ? t('quadrantB_requirementsList').split('|') : [];

        const isE = activeQuadrant === 'E';
        const isI = activeQuadrant === 'I';
        const advantagesTitle = isE ? t('beliefsTitle') : t('advantagesTitle');
        const disadvantagesTitle = isE ? t('realityTitle') : isI ? t('requirementsTitle') : t('disadvantagesTitle');

        const AdvantageIcon = isE ? InfoIcon : CheckCircleIcon;
        const advantageIconClass = isE ? "w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" : "w-5 h-5 text-green-500 mt-0.5 flex-shrink-0";
        
        const DisadvantageIcon = isI ? InfoIcon : XCircleIcon;
        const disadvantageIconClass = isI ? "w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" : "w-5 h-5 text-red-500 mt-0.5 flex-shrink-0";


        const advantageBlock = (
            <div>
                <h4 className="font-bold text-lg mb-2 text-light-text dark:text-dark-text">{advantagesTitle}</h4>
                <ul className="space-y-2">
                   {advantages.map((item, index) => {
                       const optKeyword = '(OPT)';
                       if (activeQuadrant === 'B' && item.includes(optKeyword)) {
                           const parts = item.split(optKeyword);
                           return (
                               <li key={index} className="flex items-start gap-2">
                                   <AdvantageIcon className={advantageIconClass} />
                                   <span className="text-light-text/90 dark:text-dark-text/90">
                                       {parts[0]}
                                       <button
                                           onClick={() => onTriggerCashflowInfo('opt')}
                                           className="font-semibold text-purple-500 dark:text-purple-400 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-sm px-1"
                                       >
                                           {optKeyword}
                                       </button>
                                       {parts[1]}
                                   </span>
                               </li>
                           );
                       }
                       return (
                           <li key={index} className="flex items-start gap-2">
                               <AdvantageIcon className={advantageIconClass} />
                               <span className="text-light-text/90 dark:text-dark-text/90">{item}</span>
                           </li>
                       );
                   })}
                </ul>
            </div>
        );

        const requirementBlock = activeQuadrant === 'B' && requirements.length > 0 && (
            <div>
                <h4 className="font-bold text-lg mb-2 text-light-text dark:text-dark-text">{t('requirementsTitle')}</h4>
                <ul className="space-y-2">
                    {requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <InfoIcon className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                            <span className="text-light-text/90 dark:text-dark-text/90">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );


        const disadvantageBlock = (
             <div>
                <h4 className="font-bold text-lg mb-2 text-light-text dark:text-dark-text">{disadvantagesTitle}</h4>
                <ul className="space-y-2">
                   {disadvantages.map((item, index) => (
                       <li key={index} className="flex items-start gap-2">
                           <DisadvantageIcon className={disadvantageIconClass} />
                           <span className="text-light-text/90 dark:text-dark-text/90">{item}</span>
                       </li>
                   ))}
                </ul>
            </div>
        );


        return (
            <motion.div 
                key={activeQuadrant} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{duration: 0.3}}
                className="p-4 sm:p-6"
            >
                <h3 className={`text-3xl font-bold mb-1 ${quadrantInfo.activeColorClass}`}>{t(`quadrant${activeQuadrant}_title`)}</h3>
                <p className="text-light-text/80 dark:text-dark-text/80 mb-6">{t(`quadrant${activeQuadrant}_desc`)}</p>

                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-light-text dark:text-dark-text">{t('examplesTitle')}</h4>
                        <ul className="space-y-2">
                            {examples.map((item, index) => {
                                const buffettNameEn = 'Warren Buffett';
                                const buffettNameAr = 'وارن بافيت';
                                const isBuffett = item.includes(buffettNameEn) || item.includes(buffettNameAr);
                                
                                let content;

                                if (isBuffett) {
                                    const buffettName = language === 'ar' ? buffettNameAr : buffettNameEn;
                                    const parts = item.split(buffettName);
                                    const buffettStory = translations[language].successStories.find(s => s.name.includes(buffettNameEn) || s.name.includes(buffettNameAr));

                                    content = (
                                        <span className="text-light-text/90 dark:text-dark-text/90">
                                            {parts[0]}
                                            <button
                                                onClick={() => {
                                                    if (buffettStory) {
                                                        onSelectStory(buffettStory);
                                                    }
                                                }}
                                                className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-sm"
                                            >
                                                {buffettName}
                                            </button>
                                            {parts[1]}
                                        </span>
                                    );
                                } else {
                                    content = (
                                        <span className="text-light-text/90 dark:text-dark-text/90">{item}</span>
                                    );
                                }

                                return (
                                    <li key={index} className="flex items-start gap-2">
                                        <UsersIcon className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                        {content}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    
                    <div className="pt-6 border-t border-light-border/50 dark:border-dark-border/50 space-y-6">
                        {requirementBlock}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {language === 'ar' ? (
                                <>{advantageBlock}{disadvantageBlock}</>
                            ) : (
                                <>{disadvantageBlock}{advantageBlock}</>
                            )}
                        </div>
                    </div>

                    {isE && (
                        <div className="mt-8 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg">
                            <h4 className="font-bold text-lg text-yellow-600 dark:text-yellow-500 mb-2 flex items-center gap-2">
                                <InfoIcon className="w-5 h-5" />
                                {t('solutionTitle')}
                            </h4>
                            <p className="text-light-text/90 dark:text-dark-text/90">
                                {t('quadrantE_solution')}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };
    
    const LeftSideBox = (
        <div className="bg-light-secondary/50 dark:bg-dark-secondary/50 p-6 rounded-2xl border border-light-border dark:border-dark-border">
            <h3 className="text-2xl font-bold mb-3 text-light-text dark:text-dark-text">{t('leftSideTitle')}</h3>
            <HighlightedDescription
                text={t('leftSideDesc')}
                highlightWord={language === 'ar' ? 'الدخل النشط' : 'Active Income'}
                highlightColor="text-blue-400"
                highlightShadow="0 0 8px rgba(96, 165, 250, 0.8)"
                onClick={() => onTriggerCashflowInfo('active')}
            />
        </div>
    );
    const RightSideBox = (
        <div className="bg-light-secondary/50 dark:bg-dark-secondary/50 p-6 rounded-2xl border border-light-border dark:border-dark-border">
            <h3 className="text-2xl font-bold mb-3 text-light-text dark:text-dark-text">{t('rightSideTitle')}</h3>
             <HighlightedDescription
                text={t('rightSideDesc')}
                highlightWord={language === 'ar' ? 'الدخل السلبي' : 'Passive Income'}
                highlightColor="text-green-400"
                highlightShadow="0 0 8px rgba(52, 211, 153, 0.8)"
                onClick={() => onTriggerCashflowInfo('passive')}
            />
        </div>
    );


    return (
        <section id="cashflow-quadrant" className="py-20 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                     <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">{t('cashflowQuadrantTitle')}</h2>
                     <p className="text-lg text-light-text/80 dark:text-dark-text/80 max-w-3xl mx-auto mt-4">{t('cashflowQuadrantSubtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="pt-12 sm:pt-16">
                        <div className="relative w-full max-w-md mx-auto aspect-square">
                            {/* Yellow Cross Background */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-yellow-400 rounded-full shadow-[0_0_15px_5px_rgba(250,204,21,0.5)] z-0"></div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-full bg-yellow-400 rounded-full shadow-[0_0_15px_5px_rgba(250,204,21,0.5)] z-0"></div>

                            {/* Active/Passive Labels */}
                            <div className="absolute top-0 -translate-y-full text-center w-1/2 left-0">
                                <button
                                    onClick={() => onTriggerCashflowInfo('active')}
                                    className="inline-block -translate-x-2 sm:-translate-x-4 text-4xl sm:text-5xl font-bold text-blue-400 transition-transform hover:scale-105"
                                    style={{ textShadow: '0 0 8px rgba(96, 165, 250, 0.8), 0 0 12px rgba(96, 165, 250, 0.6)' }}
                                >
                                    {t('activeIncomeLabel')}
                                </button>
                            </div>
                            <div className="absolute top-0 -translate-y-full text-center w-1/2 right-0">
                                 <button
                                    onClick={() => onTriggerCashflowInfo('passive')}
                                    className="inline-block translate-x-0 sm:translate-x-2 text-4xl sm:text-5xl font-bold text-green-400 transition-transform hover:scale-105"
                                    style={{ textShadow: '0 0 8px rgba(52, 211, 153, 0.8), 0 0 12px rgba(52, 211, 153, 0.6)' }}
                                >
                                    {t('passiveIncomeLabel')}
                                </button>
                            </div>
                            
                            {/* OPT Button on Vertical Line */}
                            <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 z-20">
                                <button
                                    onClick={() => onTriggerCashflowInfo('opt')}
                                    className="px-5 py-2 backdrop-blur-lg rounded-full border text-2xl font-bold transition-all duration-300 shadow-2xl bg-light-card/20 dark:bg-dark-card/20 border-white/30 text-light-text dark:text-dark-text hover:bg-light-card/30 dark:hover:bg-dark-card/30 hover:shadow-cyan-500/20 dark:hover:shadow-cyan-400/20 hover:scale-105"
                                    aria-label={t('optTitle')}
                                >
                                    OPT
                                </button>
                            </div>

                            {/* OPM Button on Horizontal Line */}
                            <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 z-20">
                                <button
                                    onClick={() => onTriggerCashflowInfo('opm')}
                                    className="px-5 py-2 backdrop-blur-lg rounded-full border text-2xl font-bold transition-all duration-300 shadow-2xl bg-light-card/20 dark:bg-dark-card/20 border-white/30 text-light-text dark:text-dark-text hover:bg-light-card/30 dark:hover:bg-dark-card/30 hover:shadow-cyan-500/20 dark:hover:shadow-cyan-400/20 hover:scale-105 rotate-90"
                                    aria-label={t('opmTitle')}
                                >
                                    OPM
                                </button>
                            </div>
                            
                            {/* Grid for Quadrant Letters */}
                            <div className={`relative grid grid-cols-2 grid-rows-2 w-full h-full gap-4 z-10`}>
                                 { (['E', 'S', 'B', 'I'] as QuadrantKey[]).map(qKey => {
                                    const isActive = activeQuadrant === qKey;
                                    const quadrantInfo = quadrantData[qKey];
                                    return (
                                        <motion.div
                                            key={qKey}
                                            onClick={() => setActiveQuadrant(qKey)}
                                            className={`relative flex items-center justify-center w-full h-full cursor-pointer group ${quadrantPositions[qKey]}`}
                                            whileHover={{ scale: 1.1, zIndex: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span 
                                                className={`text-8xl sm:text-9xl ${quadrantInfo.fontClass} transition-all duration-300 ${isActive ? quadrantInfo.activeColorClass : 'text-slate-800 dark:text-slate-200 opacity-90 group-hover:opacity-100'}`}
                                                style={{
                                                    textShadow: isActive 
                                                        ? `0 0 10px ${quadrantInfo.activeColorHex}cc, 0 0 25px ${quadrantInfo.activeColorHex}77`
                                                        : `2px 2px 5px rgba(0,0,0,0.2)`,
                                                }}
                                            >
                                                {qKey}
                                            </span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="min-h-[450px] bg-light-card/20 dark:bg-dark-card/20 backdrop-blur-sm border border-light-border/50 dark:border-dark-border/50 rounded-2xl overflow-hidden">
                        <AnimatePresence mode="wait">
                            {renderInfo()}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Render order is determined by language direction to maintain visual layout */}
                    {isRTL ? (
                        <>
                            {RightSideBox}
                            {LeftSideBox}
                        </>
                    ) : (
                        <>
                            {LeftSideBox}
                            {RightSideBox}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CashflowQuadrant;
