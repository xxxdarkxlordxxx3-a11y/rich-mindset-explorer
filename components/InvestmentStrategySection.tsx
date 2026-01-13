import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import InvestmentPortfolio, { PortfolioItemData } from './InvestmentPortfolio';
import { motion as framerMotion } from 'framer-motion';

const motion = framerMotion as any;

interface InvestmentStrategySectionProps {
    onSetView: (view: 'riskQuiz') => void;
}

type Situation = 'normal' | 'crisis' | 'shortage' | 'aggressive';

const DetailCard: React.FC<{ titleKey: string, itemsKey: string, color: string }> = ({ titleKey, itemsKey, color }) => {
    const { t } = useLanguage();
    const items = t(itemsKey).split('|');
    return (
        <div className={`bg-light-card/40 dark:bg-dark-card/40 p-6 rounded-2xl border-t-4 ${color} shadow-lg`}>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">{t(titleKey)}</h3>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 rtl:ml-2 ltr:mr-2 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        <span className="text-light-text/80 dark:text-dark-text/80">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const InvestmentStrategySection: React.FC<InvestmentStrategySectionProps> = ({ onSetView }) => {
    const { t } = useLanguage();
    const [activeSituation, setActiveSituation] = useState<Situation>('normal');

    const portfolioDataSets: { [key in Situation]: PortfolioItemData[] } = {
        normal: [
            { titleKey: 'portfolioNeedsTitle', percentage: 50, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', percentage: 30, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', percentage: 20, color: 'bg-indigo-500' },
        ],
        crisis: [
            { titleKey: 'portfolioNeedsTitle', percentage: 60, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', percentage: 15, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', percentage: 25, color: 'bg-indigo-500' },
        ],
        shortage: [
            { titleKey: 'portfolioNeedsTitle', percentage: 70, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', percentage: 5, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', percentage: 25, color: 'bg-indigo-500' },
        ],
        aggressive: [
             { titleKey: 'portfolioNeedsTitle', percentage: 45, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', percentage: 10, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', percentage: 45, color: 'bg-indigo-500' },
        ]
    };
    
    const situationButtons: { key: Situation, titleKey: string }[] = [
        { key: 'normal', titleKey: 'situationProsperity' },
        { key: 'crisis', titleKey: 'situationCrisis' },
        { key: 'shortage', titleKey: 'situationShortage' },
        { key: 'aggressive', titleKey: 'situationAggressiveSavings' },
    ];

    const portfolioData = portfolioDataSets[activeSituation];

    return (
        <section id="portfolio" className="py-20 px-4">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text mb-4">{t('investmentStrategyTitle')}</h2>
                <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-8 max-w-3xl mx-auto">{t('investmentStrategySubtitle')}</p>
                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
                    {situationButtons.map(button => (
                        <button
                            key={button.key}
                            onClick={() => setActiveSituation(button.key)}
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 ${
                                activeSituation === button.key
                                    ? 'bg-light-primary text-light-primary-text dark:bg-dark-primary dark:text-dark-primary-text shadow-lg shadow-blue-500/30'
                                    : 'bg-light-card/50 dark:bg-dark-card/50 border border-light-border dark:border-dark-border text-light-text/80 dark:text-dark-text/80 hover:bg-light-card dark:hover:bg-dark-card'
                            }`}
                        >
                            {t(button.titleKey)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col items-center justify-center gap-8 lg:gap-12">
                   <InvestmentPortfolio data={portfolioData} />
                </div>
                
                <motion.div 
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left rtl:text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <DetailCard titleKey="portfolioNeedsTitle" itemsKey="portfolioNeedsItems" color="border-cyan-500" />
                    <DetailCard titleKey="portfolioWantsTitle" itemsKey="portfolioWantsItems" color="border-blue-500" />
                    <DetailCard titleKey="portfolioSavingsTitle" itemsKey="portfolioSavingsItems" color="border-indigo-500" />
                </motion.div>


                 <div className="mt-16">
                     <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text mb-4">{t('riskAnalysisTitle')}</h2>
                     <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-8 max-w-2xl mx-auto">{t('riskAnalysisSubtitle')}</p>
                     <button
                        onClick={() => onSetView('riskQuiz')}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full text-lg shadow-lg shadow-indigo-500/30 transform transition-all duration-300 hover:scale-105"
                    >
                        {t('startRiskAnalysis')}
                    </button>
                 </div>
            </div>
        </section>
    );
};

export default InvestmentStrategySection;