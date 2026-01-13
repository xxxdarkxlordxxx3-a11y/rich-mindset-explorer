import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { generateRiskQuestions, analyzeRiskProfile } from '../services/geminiService';
import type { RiskQuestion, UserRiskAnswer, RiskProfile, UserContext } from '../types';
import { LoadingIcon, RepeatIcon, HomeIcon, PersonIcon } from './IconComponents';

interface InvestorProfileSectionProps {
    onDone: () => void;
    userContext: UserContext;
}

const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.5, ease: 'easeInOut' }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: 'easeInOut' } }
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const AlignmentBar: React.FC<{ label: string; percentage: number, text: string, color: string }> = ({ label, percentage, text, color }) => (
    <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-lg font-bold text-light-text dark:text-dark-text">{label}</span>
            <span className={`text-lg font-bold ${color.replace('bg-','text-')}`}>{percentage}%</span>
        </div>
        <div className="w-full bg-light-secondary dark:bg-dark-secondary rounded-full h-4 shadow-inner">
            <motion.div 
                className={`h-4 rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            />
        </div>
        <p className="text-sm text-light-text/80 dark:text-dark-text/80 mt-2 text-center">{text}</p>
    </div>
);

const InvestorProfileSection: React.FC<InvestorProfileSectionProps> = ({ onDone, userContext }) => {
    const { language, t } = useLanguage();
    const [step, setStep] = useState<'age' | 'generating' | 'quiz' | 'analyzing' | 'results'>('age');
    const [age, setAge] = useState<string>('');
    const [questions, setQuestions] = useState<RiskQuestion[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<UserRiskAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState<RiskProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startQuiz = async () => {
        setStep('generating');
        setError(null);
        setAnswers([]);
        try {
            const fetchedQuestions = await generateRiskQuestions(language, userContext);
            setQuestions(shuffleArray(fetchedQuestions));
            setStep('quiz');
        } catch (err) {
            setError(t('quizGenerationError'));
        }
    };
    
    useEffect(() => {
        if (step === 'quiz' && questions.length > 0 && questions[currentQuestionIndex]) {
            setShuffledOptions(shuffleArray(questions[currentQuestionIndex].options));
        }
    }, [currentQuestionIndex, questions, step]);

    const handleAgeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parseInt(age) > 10 && parseInt(age) < 100) {
            startQuiz();
        } else {
            setError('Please enter a valid age between 11 and 99.');
        }
    };

    const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...answers];
        const questionText = questions[currentQuestionIndex].question;
        const existingAnswerIndex = newAnswers.findIndex(a => a.question === questionText);
        
        if(existingAnswerIndex !== -1) {
             newAnswers[existingAnswerIndex].answer = answer;
        } else {
            newAnswers.push({ question: questionText, answer });
        }
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(i => i + 1);
            } else {
                analyzeAnswers(newAnswers);
            }
        }, 300);
    };
    
    const analyzeAnswers = async (finalAnswers: UserRiskAnswer[]) => {
        setStep('analyzing');
        setError(null);
        try {
            const analysisResult = await analyzeRiskProfile(finalAnswers, parseInt(age), language, userContext);
            setResult(analysisResult);
            setStep('results');
        } catch (err) {
            setError(t('errorOccurred'));
        }
    }
    
    const handleReset = () => {
        setStep('age');
        setAge('');
        setQuestions([]);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setResult(null);
        setError(null);
    }
    
    const horizonTranslationMap = {
        'short-term': 'shortTerm',
        'medium-term': 'mediumTerm',
        'long-term': 'longTerm',
    };
    
    const renderContent = () => {
        switch(step) {
            case 'age':
                return (
                     <motion.div key="age" variants={containerVariants}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-light-text dark:text-dark-text">{t('yourInvestorProfile')}</h2>
                        <form onSubmit={handleAgeSubmit} className="max-w-xs mx-auto">
                            <label htmlFor="age" className="block text-center text-lg font-medium text-light-text dark:text-dark-text mb-2">{t('enterYourAge')}</label>
                            <input
                                type="number"
                                id="age"
                                value={age}
                                onChange={(e) => { setError(null); setAge(e.target.value); }}
                                className="w-full px-4 py-2 text-center text-lg border-light-border dark:border-dark-border bg-light-card/80 dark:bg-dark-card/80 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition"
                                placeholder={t('age')}
                                required
                            />
                            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                            <button type="submit" className="mt-6 w-full px-8 py-3 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary-text dark:text-dark-primary-text font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:scale-105">
                                {t('continue')}
                            </button>
                        </form>
                    </motion.div>
                );
            case 'generating':
                return (
                    <motion.div key="generating" variants={containerVariants} className="text-center flex flex-col items-center justify-center min-h-[300px]">
                        <LoadingIcon />
                        <p className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg">{t('generatingProfileQuiz')}</p>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                    </motion.div>
                );
            case 'quiz':
                const question = questions[currentQuestionIndex];
                if (!question) {
                    return (
                        <motion.div key="quiz-loading" className="text-center flex flex-col items-center justify-center min-h-[300px]">
                            <LoadingIcon />
                        </motion.div>
                    );
                }
                const selectedAnswer = answers.find(a => a.question === question.question)?.answer;
                return (
                    <motion.div key="quiz" variants={containerVariants} className="w-full relative overflow-hidden">
                        <p className="text-center font-semibold text-light-text/60 dark:text-dark-text/60 mb-4">{t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}</p>
                        <h3 className="text-xl sm:text-2xl font-semibold text-center mb-8 flex items-center justify-center min-h-[12rem] sm:min-h-[8rem] text-light-text dark:text-dark-text px-2">{question.question}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {shuffledOptions.map((opt, i) => (
                                <button key={i} onClick={() => handleAnswerSelect(opt)} className={`p-4 rounded-lg text-left transition-all duration-200 border-2 text-light-text dark:text-dark-text ${selectedAnswer === opt ? 'bg-purple-500 border-purple-500 text-white font-bold' : 'bg-light-secondary dark:bg-dark-secondary border-light-border dark:border-dark-border hover:border-purple-400'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'analyzing':
            case 'results':
                return (
                    <motion.div key="results" variants={containerVariants} className="w-full">
                        {!result ? (
                            <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
                                <LoadingIcon />
                                <p className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg">{t('analyzingProfile')}</p>
                                {error && <p className="text-red-500 mt-4">{error}</p>}
                            </div>
                        ) : (
                            <div>
                                <div className="text-center mb-8">
                                    <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                                        <PersonIcon className="w-8 h-8 text-purple-400" />
                                        <h2 className="text-3xl font-extrabold">{t('yourInvestorProfile')}</h2>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-500 dark:text-purple-400">{result.profile}</p>
                                    <p className="mt-2 max-w-2xl mx-auto text-light-text/80 dark:text-dark-text/80">{result.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-light-border dark:border-dark-border pt-8">
                                    <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg border border-light-border dark:border-dark-border">
                                        <AlignmentBar label={t('tradingAlignment')} percentage={result.overallRiskPercentage} text={result.description} color="bg-red-500" />
                                        <AlignmentBar label={t('longTermAlignment')} percentage={result.lossAversionPercentage} text={result.lossAversionExplanation} color="bg-green-500" />
                                    </div>

                                    <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg border border-light-border dark:border-dark-border flex flex-col justify-center">
                                        <h3 className="text-xl font-bold text-center mb-2 text-light-text dark:text-dark-text">{t('yourInvestmentHorizon')}</h3>
                                        <p className="text-3xl font-bold text-center text-cyan-500 dark:text-cyan-400 mb-4 capitalize">{t(horizonTranslationMap[result.investmentHorizon as keyof typeof horizonTranslationMap] || result.investmentHorizon)}</p>
                                        <p className="text-center text-light-text/80 dark:text-dark-text/80 mb-6">{result.investmentHorizonDescription}</p>
                                        <details className="text-sm group">
                                            <summary className="cursor-pointer font-semibold text-center text-light-text/90 dark:text-dark-text/90 hover:text-cyan-500 list-none flex justify-center items-center gap-2">
                                                <span>{t('definitions')}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </summary>
                                            <div className="mt-4 text-light-text/80 dark:text-dark-text/80 rtl:text-right bg-light-card/50 dark:bg-dark-card/50 p-3 rounded-md">
                                                <p><strong>{t('shortTerm')}:</strong> {result.definitions.shortTerm}</p>
                                                <p><strong>{t('mediumTerm')}:</strong> {result.definitions.mediumTerm}</p>
                                                <p><strong>{t('longTerm')}:</strong> {result.definitions.longTerm}</p>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={handleReset} className="px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text font-bold rounded-full text-lg transform transition-all duration-300 hover:-translate-y-1 shadow-xl">
                                        <RepeatIcon className="w-5 h-5" />
                                        {t('retakeQuiz')}
                                    </button>
                                     <button onClick={onDone} className="px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary dark:text-dark-primary font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                                        <HomeIcon className="w-5 h-5" />
                                        {t('goBackHome')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
        }
    }

    return (
        <section className="py-4 px-2 flex justify-center">
            <div className="container mx-auto">
                <div className="w-full max-w-4xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-4 sm:p-6 shadow-2xl relative">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default InvestorProfileSection;