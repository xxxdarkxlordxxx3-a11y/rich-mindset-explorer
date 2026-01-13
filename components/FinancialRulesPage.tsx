
import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../localization/translations';
import { ScaleIcon, HomeIcon, InfoIcon, CheckCircleIcon } from './IconComponents';

const motion = framerMotion as any;

interface FinancialRulesPageProps {
    onDone: () => void;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

const FinancialRulesPage: React.FC<FinancialRulesPageProps> = ({ onDone }) => {
    const { language, t } = useLanguage();
    const rules = translations[language].financialRules;

    return (
        <div className="w-full py-20 px-4 bg-light-secondary/30 dark:bg-dark-secondary/30">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                        <ScaleIcon className="h-10 w-10 text-indigo-500" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">{t('rulesPageTitle')}</h2>
                    </div>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {rules.map((rule, index) => (
                        <motion.div
                            key={index}
                            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={index}
                        >
                            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                <InfoIcon className="w-6 h-6" />
                                {t(rule.titleKey)}
                            </h3>
                            <p className="text-light-text/90 dark:text-dark-text/90 mb-4 leading-relaxed">
                                {t(rule.explanationKey)}
                            </p>
                            <div className="bg-light-secondary/50 dark:bg-dark-secondary/50 p-4 rounded-xl border-l-4 border-green-500">
                                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1 flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {t('example')}
                                </h4>
                                <p className="text-sm text-light-text/80 dark:text-dark-text/80 italic">
                                    {t(rule.exampleKey)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-center mt-16">
                    <button onClick={onDone} className="px-8 py-3 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-white font-bold rounded-full text-base transition-colors shadow-lg inline-flex items-center gap-2 transform hover:-translate-y-1">
                        <HomeIcon className="w-5 h-5" />
                        {t('goBackHome')}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default FinancialRulesPage;
