import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { HomeIcon, WorkIcon, AssetIcon, TimeIcon, MoneyIcon } from './IconComponents';

const motion = framerMotion as any;

interface CashflowInfoPageProps {
    onDone: () => void;
    type: 'active' | 'passive' | 'opt' | 'opm';
}

const CashflowInfoPage: React.FC<CashflowInfoPageProps> = ({ onDone, type }) => {
    const { t } = useLanguage();
    
    const content = {
        active: {
            title: t('activeIncomeTitle'),
            text: t('activeIncomeContent'),
            icon: <WorkIcon className="w-20 h-20 text-blue-500" />,
            gradient: "from-blue-500 to-cyan-500",
        },
        passive: {
            title: t('passiveIncomeTitle'),
            text: t('passiveIncomeContent'),
            icon: <AssetIcon className="w-20 h-20 text-green-500" />,
            gradient: "from-green-500 to-emerald-500",
        },
        opt: {
            title: t('optTitle'),
            text: t('optContent'),
            icon: <TimeIcon className="w-20 h-20 text-purple-500" />,
            gradient: "from-purple-500 to-violet-500",
        },
        opm: {
            title: t('opmTitle'),
            text: t('opmContent'),
            icon: <MoneyIcon className="w-20 h-20 text-emerald-500" />,
            gradient: "from-emerald-500 to-green-500",
        },
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
                
                <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text mb-8 bg-clip-text text-transparent bg-gradient-to-r ${content.gradient}`}>
                    {content.title}
                </h2>
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg text-light-text/80 dark:text-dark-text/80 leading-relaxed text-left rtl:text-right"
                >
                    <p>{content.text}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <button onClick={onDone} className="mt-10 px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary-text dark:text-dark-primary-text font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <HomeIcon className="w-5 h-5" />
                        {t('backToQuadrant')}
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default CashflowInfoPage;