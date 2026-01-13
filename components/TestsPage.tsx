
import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { FinancialBrainIcon, CalculatorIcon, AssetIcon, PersonIcon, HazardIcon } from './IconComponents';
import type { ToolType } from '../types';

const motion = framerMotion as any;

interface TestsPageProps {
  onStartQuiz: (quizType: ToolType) => void;
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


const ToolCard: React.FC<{icon: React.ReactNode, title: string, desc: string, onClick: () => void, index: number}> = ({icon, title, desc, onClick, index}) => {
    const { t } = useLanguage();
    return (
        <motion.div 
            className="bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center flex flex-col items-center shadow-xl shadow-slate-500/30 dark:shadow-xl dark:shadow-black/40 hover:shadow-2xl hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
            onClick={onClick}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={index}
            whileHover={{ y: -5 }}
        >
            <div className="mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">{title}</h3>
            <p className="text-light-text/80 dark:text-dark-text/80 text-sm mb-6 flex-grow">{desc}</p>
            <button className="mt-auto w-full px-4 py-2 bg-light-primary/10 dark:bg-dark-primary/10 border-2 border-light-primary/20 dark:border-dark-primary/20 text-light-primary dark:text-dark-primary font-bold rounded-xl shadow-lg group-hover:shadow-xl group-hover:shadow-cyan-500/30 group-hover:bg-light-primary dark:group-hover:bg-dark-primary group-hover:text-light-primary-text dark:group-hover:text-dark-primary-text transition-all duration-300">
                {t('startTest')}
            </button>
        </motion.div>
    );
}

const TestsPage: React.FC<TestsPageProps> = ({ onStartQuiz }) => {
    const { t } = useLanguage();

    const quizzes = [
        { type: 'mindset', title: t('mindsetQuizTitle'), desc: t('mindsetQuizDesc'), icon: <FinancialBrainIcon className="w-12 h-12 text-green-500" /> },
        { type: 'risk', title: t('riskAnalysisTitle'), desc: t('riskAnalysisDesc'), icon: <HazardIcon className="w-12 h-12 text-red-400" /> },
        { type: 'budgeting', title: t('budgetingQuizTitle'), desc: t('budgetingQuizDesc'), icon: <CalculatorIcon className="w-12 h-12 text-blue-400" /> },
        { type: 'investment', title: t('investmentQuizTitle'), desc: t('investmentQuizDesc'), icon: <AssetIcon className="w-12 h-12 text-yellow-500" /> },
    ];
    
    return (
        <div className="w-full py-20 px-4 bg-light-secondary/30 dark:bg-dark-secondary/30">
            <div className="container mx-auto max-w-7xl text-center">
                 <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text mb-4"
                >
                    {t('discoverWealthTitle')}
                </motion.h2>
                <motion.p
                     initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-lg text-light-text/80 dark:text-dark-text/80"
                >
                    {t('quizSelectionSubtitle')}
                </motion.p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                   {quizzes.map((quiz, index) => (
                       <ToolCard 
                           key={quiz.type}
                           icon={quiz.icon}
                           title={quiz.title}
                           desc={quiz.desc}
                           onClick={() => onStartQuiz(quiz.type as ToolType)}
                           index={index}
                       />
                   ))}
                </div>
            </div>
        </div>
    );
};

export default TestsPage;
