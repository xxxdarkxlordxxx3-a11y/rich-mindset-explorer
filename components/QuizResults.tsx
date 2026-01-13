import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import type { QuizAnalysis } from '../types';
import { BrainIcon, CheckCircleIcon, XCircleIcon, InfoIcon, RepeatIcon, HomeIcon } from './IconComponents';

const motion = framerMotion as any;

interface QuizResultsProps {
    analysis: QuizAnalysis;
    onRetake: () => void;
    onDone: () => void;
}

interface MindsetGaugeProps {
    percentage: number;
}
  
const MindsetGauge: React.FC<MindsetGaugeProps> = ({ percentage }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
    const getColor = (p: number) => {
      if (p >= 75) return '#22c55e'; // text-green-500
      if (p >= 40) return '#eab308'; // text-yellow-500
      return '#ef4444'; // text-red-500
    };
  
    const color = getColor(percentage);
  
    return (
      <div className="relative w-44 h-44 sm:w-48 sm:h-48">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          <circle
            className="text-light-border dark:text-dark-border"
            strokeWidth="16"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="90"
            cy="90"
          />
          <motion.circle
            strokeWidth="16"
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx="90"
            cy="90"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-light-text dark:text-dark-text">{Math.round(percentage)}</span>
          <span className="text-xl font-bold text-light-text/70 dark:text-dark-text/70 mt-1">%</span>
        </div>
      </div>
    );
};

const QuizResults: React.FC<QuizResultsProps> = ({ analysis, onRetake, onDone }) => {
    const { t } = useLanguage();
    
    const { scorePercentage, overallFeedback, growthOpportunities } = analysis;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl w-full"
        >
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                    <BrainIcon />
                    <h2 className="text-3xl font-extrabold">{t('resultsTitle')}</h2>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-10 text-center sm:text-left rtl:sm:text-right">
                <MindsetGauge percentage={scorePercentage} />
                <div className="flex-1">
                    <p className="text-light-text/80 dark:text-dark-text/80 text-lg">{t('resultsIntro')}</p>
                    <p className="text-2xl font-bold my-2 text-light-text dark:text-dark-text">{Math.round(scorePercentage)}%</p>
                </div>
            </div>

            <div className="mt-10 p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border">
                <h3 className="text-2xl font-bold text-center mb-2 text-light-text dark:text-dark-text">{t('overallAssessment')}</h3>
                <p className="text-light-text/80 dark:text-dark-text/80 text-center mb-6 max-w-2xl mx-auto">{overallFeedback}</p>
            </div>


            {growthOpportunities.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-center mb-2 text-light-text dark:text-dark-text">{t('growthOpportunities')}</h3>
                    <p className="text-light-text/70 dark:text-dark-text/70 text-center mb-6 max-w-2xl mx-auto">{t('resultsExplanation')}</p>
                    <div className="space-y-4">
                        {growthOpportunities.map((item, index) => {
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg border border-light-border dark:border-dark-border"
                                >
                                    <p className="font-semibold text-light-text dark:text-dark-text mb-4">{item.question}</p>
                                    <div className="mb-3">
                                        <div className="flex items-start gap-2">
                                            <XCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className={`font-semibold text-red-500 text-sm`}>{t('yourAnswer')}</p>
                                                <p className="text-light-text/80 dark:text-dark-text/80 text-sm">{item.yourAnswer}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="flex items-start gap-2">
                                            <CheckCircleIcon className="mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-green-500 text-sm">{t('richDadAlternative')}</p>
                                                <p className="text-light-text/80 dark:text-dark-text/80 text-sm">{item.richMindsetAnswer}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-light-card dark:bg-dark-card/50 rounded-md border border-light-border dark:border-dark-border/50">
                                        <div className="flex items-start gap-2">
                                            <InfoIcon className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-cyan-600 dark:text-cyan-400 text-sm">{item.explanation}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onRetake}
                    className="px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text font-bold rounded-full text-lg transform transition-all duration-300 hover:-translate-y-1 shadow-lg"
                >
                    <RepeatIcon className="w-5 h-5" />
                    {t('retakeQuiz')}
                </button>
                 <button onClick={onDone} className="px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-primary hover:bg-light-primary-hover text-light-primary-text font-bold rounded-full text-lg shadow-xl shadow-blue-500/40 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <HomeIcon className="w-5 h-5" />
                    {t('goBackHome')}
                </button>
            </div>
        </motion.div>
    );
};

export default QuizResults;