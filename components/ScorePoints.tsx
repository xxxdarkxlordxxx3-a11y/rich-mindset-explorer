import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { BrainIcon, CheckCircleIcon } from './IconComponents';

const motion = framerMotion as any;

const StatCard: React.FC<{
    icon: React.ReactNode,
    title: string,
    value: string,
    subtitle: string,
    delay: number
}> = ({ icon, title, value, subtitle, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-light-card dark:bg-dark-card border border-light-border/80 dark:border-dark-border/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-md dark:shadow-2xl dark:shadow-black/20"
        >
            <div className="mb-3">{icon}</div>
            <p className="text-lg font-semibold text-light-text/90 dark:text-dark-text/90">{title}</p>
            <p className="text-4xl font-bold text-light-text dark:text-dark-text my-1">{value}</p>
            <p className="text-sm text-light-text/60 dark:text-dark-text/60">{subtitle}</p>
        </motion.div>
    );
};


const ScorePoints: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section className="py-16 px-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <StatCard 
                        icon={<BrainIcon className="w-8 h-8 text-slate-700 dark:text-slate-300" />}
                        title={t('financialIQScore')}
                        value="128"
                        subtitle={t('basedOnQuizzes')}
                        delay={0.1}
                    />
                     <StatCard 
                        icon={<CheckCircleIcon className="w-8 h-8 text-green-500" />}
                        title={t('mindsetPoints')}
                        value="850+"
                        subtitle={t('fromDailyHabits')}
                        delay={0.2}
                    />
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-8">
                    <button className="px-8 py-3 bg-light-card dark:bg-dark-card border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full text-base hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors shadow-sm">
                        {t('viewDashboard')}
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default ScorePoints;