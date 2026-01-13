
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { UserAnswer, QuizQuestion, UserContext, QuizAnalysis } from '../types';
import Quiz from './Quiz';
import QuizResults from './QuizResults';
import { generateQuizQuestions, generateBudgetingQuizQuestions, generateInvestmentQuizQuestions, analyzeQuizAnswers } from '../services/geminiService';
import { LoadingIcon, CloseIcon } from './IconComponents';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';

const motion = framerMotion as any;

interface QuizSectionProps {
    onDone: () => void;
    quizType: 'mindset' | 'budgeting' | 'investment';
    userContext: UserContext;
}

const QuizSection: React.FC<QuizSectionProps> = ({ onDone, quizType, userContext }) => {
    const [quizState, setQuizState] = useState<'generating' | 'active' | 'analyzing' | 'finished'>('generating');
    const [answers, setAnswers] = useState<UserAnswer[]>([]);
    const { language, t } = useLanguage();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [analysisResult, setAnalysisResult] = useState<QuizAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPatienceText, setShowPatienceText] = useState(false);

    const quizDetails = {
        mindset: {
            title: t('mindsetQuizTitle'),
            generator: () => generateQuizQuestions(language, userContext)
        },
        budgeting: {
            title: t('budgetingQuizTitle'),
            generator: () => generateBudgetingQuizQuestions(language, userContext)
        },
        investment: {
            title: t('investmentQuizTitle'),
            generator: () => generateInvestmentQuizQuestions(language, userContext)
        }
    }[quizType];

    const handleStart = async () => {
        setQuizState('generating');
        setError(null);
        setAnswers([]);
        setAnalysisResult(null);

        try {
            const generatedQuestions = await quizDetails.generator();
            setQuestions(generatedQuestions);
            setQuizState('active');
        } catch (e) {
            console.error(e);
            setError(t('quizGenerationError'));
        }
    };

    const handleSubmit = async (finalAnswers: UserAnswer[]) => {
        setAnswers(finalAnswers);
        setQuizState('analyzing');
        setError(null);
        try {
            // Ensure answers are in a format the analyzer expects (mostly strings/indices)
            // Complex objects like Matching pairs are handled in the service
            const result = await analyzeQuizAnswers(questions, finalAnswers, language);
            setAnalysisResult(result);
            setQuizState('finished');
        } catch (e) {
            console.error("Analysis failed:", e);
            setError(t('errorOccurred'));
            // Optionally revert to a state where user can retry analysis
        }
    };

    const handleRetake = () => {
        handleStart();
    };

    useEffect(() => {
        handleStart();
    }, [quizType, language]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (quizState === 'generating') {
            setShowPatienceText(false);
            timer = setTimeout(() => {
                setShowPatienceText(true);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [quizState]);


    const renderContent = () => {
        if (quizState === 'generating') {
            return (
                <div className="text-center flex flex-col items-center justify-center min-h-[200px]">
                    <LoadingIcon />
                    <AnimatePresence>
                        {showPatienceText && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg"
                            >
                                {t('patienceIsKey')}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            );
        }
        if (quizState === 'analyzing') {
            return (
                <div className="text-center flex flex-col items-center justify-center min-h-[200px]">
                    <LoadingIcon />
                    <p className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg">{t('analyzingQuiz')}</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center min-h-[200px] flex flex-col justify-center items-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={handleStart} className="px-6 py-2 bg-light-primary text-light-primary-text rounded-lg">Try Again</button>
                </div>
            );
        }
        if (quizState === 'active' && questions.length > 0) {
            return <Quiz questions={questions} onSubmit={handleSubmit} title={quizDetails.title} />;
        }
        if (quizState === 'finished' && analysisResult) {
            return <QuizResults analysis={analysisResult} onRetake={handleRetake} onDone={onDone} />;
        }
        return null;
    }

    return (
        <section id="quiz" className="py-4 px-2 flex justify-center">
            <div className="container mx-auto max-w-4xl bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl shadow-2xl relative">
                {renderContent()}
            </div>
        </section>
    );
};

export default QuizSection;
