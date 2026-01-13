
import React, { useState, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { generateRiskQuestions, analyzeRiskProfile } from '../services/geminiService';
import type { RiskQuestion, UserRiskAnswer, RiskProfile, UserContext } from '../types';
import { LoadingIcon, RepeatIcon, HomeIcon, HazardIcon, CloseIcon } from './IconComponents';

const motion = framerMotion as any;

interface RiskAnalysisSectionProps {
    onDone: (profile?: RiskProfile) => void;
    userContext: UserContext;
}

const containerVariants = {
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

// ... (RiskGauge and AssetToleranceBar components remain unchanged, keeping for brevity in this update)
const RiskGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const getColor = (p: number) => {
      if (p >= 70) return '#ef4444';
      if (p >= 40) return '#eab308';
      return '#22c55e';
    };
    const color = getColor(percentage);
    return (
      <div className="relative w-36 h-36 sm:w-40 sm:h-40">
        <svg className="w-full h-full" viewBox="0 0 160 160">
          <circle className="text-light-border dark:text-dark-border" strokeWidth="14" stroke="currentColor" fill="transparent" r={radius} cx="80" cy="80" />
          <motion.circle strokeWidth="14" strokeLinecap="round" stroke={color} fill="transparent" r={radius} cx="80" cy="80" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-light-text dark:text-dark-text">{Math.round(percentage)}</span>
          <span className="text-lg font-bold text-light-text/70 dark:text-dark-text/70 mt-1">%</span>
        </div>
      </div>
    );
};

const AssetToleranceBar: React.FC<{ label: string; percentage: number, color: string }> = ({ label, percentage, color }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-light-text dark:text-dark-text">{label}</span>
            <span className={`text-sm font-bold ${color.replace('bg-','text-')}`}>{percentage}%</span>
        </div>
        <div className="w-full bg-light-secondary dark:bg-dark-secondary rounded-full h-2.5">
            <motion.div className={`h-2.5 rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }} />
        </div>
    </div>
);

const RiskAnalysisSection: React.FC<RiskAnalysisSectionProps> = ({ onDone, userContext }) => {
    const { language, t } = useLanguage();
    const [step, setStep] = useState<'age' | 'quiz' | 'analyzing' | 'results'>('age');
    const [age, setAge] = useState<string>('');
    const [questions, setQuestions] = useState<RiskQuestion[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<UserRiskAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState<RiskProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPatienceText, setShowPatienceText] = useState(false);

    // New state for custom answer logic
    const [customAnswerMode, setCustomAnswerMode] = useState(false);
    const [customAnswerText, setCustomAnswerText] = useState('');
    const [customAnswersCount, setCustomAnswersCount] = useState(0);
    const MAX_CUSTOM_ANSWERS = 3;

    useEffect(() => {
        if (step === 'quiz' && questions.length > 0 && questions[currentQuestionIndex]) {
            setShuffledOptions(shuffleArray(questions[currentQuestionIndex].options));
            setCustomAnswerMode(false);
            setCustomAnswerText('');
        }
    }, [currentQuestionIndex, questions, step]);
    
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isLoading) {
            setShowPatienceText(false);
            timer = setTimeout(() => {
                setShowPatienceText(true);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);


    const startQuiz = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedQuestions = await generateRiskQuestions(language, userContext);
            setQuestions(shuffleArray(fetchedQuestions));
            setStep('quiz');
        } catch (err) {
            setError(t('quizGenerationError'));
            setStep('age'); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleAgeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use general valid age check
        if (parseInt(age) > 0) startQuiz();
        else setError('Please enter a valid age.');
    };

    const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...answers];
        const existingAnswerIndex = newAnswers.findIndex(a => a.question === questions[currentQuestionIndex].question);
        if(existingAnswerIndex !== -1) {
             newAnswers[existingAnswerIndex].answer = answer;
        } else {
            newAnswers.push({ question: questions[currentQuestionIndex].question, answer });
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

    const handleCustomAnswerSubmit = () => {
        if (!customAnswerText.trim()) return;
        
        setCustomAnswersCount(prev => prev + 1);
        handleAnswerSelect(customAnswerText);
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
        setCustomAnswersCount(0);
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
                    <motion.div key="age" variants={containerVariants} className="min-h-[200px]">
                        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-light-text dark:text-dark-text">{t('riskAnalysisTitle')}</h2>
                        <p className="text-lg text-light-text/80 dark:text-dark-text/80 text-center mb-8">{t('riskAnalysisSubtitle')}</p>
                         <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center flex flex-col items-center justify-center"
                                >
                                    <LoadingIcon className="w-12 h-12 text-cyan-500 animate-spin" />
                                    <p className="text-light-text/80 dark:text-dark-text/80 mt-6 text-lg font-medium transition-opacity duration-500">
                                        {showPatienceText ? t('patienceIsKey') : t('preparingAnalysis')}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleAgeSubmit} className="max-w-xs mx-auto"
                                >
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
                                    <button type="submit" className="mt-6 w-full px-8 py-3 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary dark:text-dark-primary font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:scale-105">
                                        {t('continue')}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
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
                    <motion.div key="quiz" variants={containerVariants} className="w-full relative overflow-hidden min-h-[450px] flex flex-col">
                        <p className="text-center font-semibold text-light-text/60 dark:text-dark-text/60 mb-4">{t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}</p>
                        <h3 className="text-xl sm:text-2xl font-semibold text-center mb-8 flex items-center justify-center min-h-[8rem] text-light-text dark:text-dark-text px-2">{question.question}</h3>
                        
                        {customAnswerMode ? (
                            <div className="flex flex-col gap-4 flex-grow justify-center max-w-md mx-auto w-full">
                                <textarea
                                    value={customAnswerText}
                                    onChange={(e) => setCustomAnswerText(e.target.value)}
                                    placeholder={language === 'ar' ? 'اكتب إجابتك الخاصة...' : 'Type your answer...'}
                                    className="w-full p-4 rounded-lg border-2 border-cyan-500 bg-light-card dark:bg-dark-card focus:ring-0 text-light-text dark:text-dark-text"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleCustomAnswerSubmit}
                                        className="flex-1 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600"
                                    >
                                        {language === 'ar' ? 'تأكيد' : 'Confirm'}
                                    </button>
                                    <button 
                                        onClick={() => setCustomAnswerMode(false)}
                                        className="px-4 py-3 bg-light-secondary dark:bg-dark-secondary rounded-lg text-light-text dark:text-dark-text"
                                    >
                                        {t('back')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {shuffledOptions.map((opt, i) => (
                                    <button key={i} onClick={() => handleAnswerSelect(opt)} className={`p-4 rounded-lg text-left transition-all duration-200 border-2 text-light-text dark:text-dark-text ${selectedAnswer === opt ? 'bg-cyan-500 border-cyan-500 text-white font-bold' : 'bg-light-secondary dark:bg-dark-secondary border-light-border dark:border-dark-border hover:border-cyan-400'}`}>
                                        {opt}
                                    </button>
                                ))}
                                {customAnswersCount < MAX_CUSTOM_ANSWERS && (
                                    <button 
                                        onClick={() => setCustomAnswerMode(true)}
                                        className="p-4 rounded-lg text-center border-2 border-dashed border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 font-semibold transition-all"
                                    >
                                        {language === 'ar' ? 'أخرى (اكتب إجابتك)' : 'Other (Type answer)'} 
                                        <span className="block text-xs mt-1 font-normal opacity-70">
                                            ({MAX_CUSTOM_ANSWERS - customAnswersCount} {language === 'ar' ? 'محاولات متبقية' : 'left'})
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                );
            case 'analyzing':
            case 'results':
                return (
                    <motion.div key="results" variants={containerVariants} className="w-full">
                        {!result ? (
                            <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
                                <LoadingIcon />
                                <p className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg">{t('analyzingResults')}</p>
                                {error && <p className="text-red-500 mt-4">{error}</p>}
                            </div>
                        ) : (
                            <div>
                                <div className="text-center mb-8">
                                    <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                                        <HazardIcon className="w-8 h-8 text-red-500" />
                                        <h2 className="text-3xl font-extrabold">{t('riskProfileTitle')}</h2>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-10 text-center sm:text-left rtl:sm:text-right border-b border-light-border dark:border-dark-border pb-8">
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">{t('overallRiskProfile')}</h3>
                                        <RiskGauge percentage={result.overallRiskPercentage} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-2xl font-bold text-cyan-500">{result.profile}</p>
                                        <p className="mt-2 max-w-2xl text-light-text/80 dark:text-dark-text/80">{result.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg border border-light-border dark:border-dark-border">
                                        <h3 className="text-xl font-bold text-center mb-4 text-light-text dark:text-dark-text">{t('assetAllocation')}</h3>
                                        
                                        <div className="w-full bg-light-border dark:bg-dark-border/50 rounded-full h-8 flex overflow-hidden">
                                            <motion.div 
                                                className="bg-indigo-500 flex items-center justify-center text-white font-bold" 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.allocation.highRisk}%`}}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            >
                                                {result.allocation.highRisk > 10 && `${result.allocation.highRisk}%`}
                                            </motion.div>
                                            <motion.div 
                                                className="bg-blue-400 flex items-center justify-center text-white font-bold"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.allocation.lowRisk}%`}}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            >
                                                 {result.allocation.lowRisk > 10 && `${result.allocation.lowRisk}%`}
                                            </motion.div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-light-text/80 dark:text-dark-text/80">
                                            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>{t('highRiskAssets')}</div>
                                            <div className="flex items-center gap-2">{t('lowRiskAssets')}<span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span></div>
                                        </div>
                                        <details className="mt-6 text-sm group">
                                            <summary className="cursor-pointer font-semibold text-light-text/90 dark:text-dark-text/90 hover:text-cyan-500 list-none flex justify-between items-center">
                                                <span>{t('whatIsAgeRule')}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </summary>
                                            <p className="mt-2 text-light-text/80 dark:text-dark-text/80 rtl:text-right">
                                                {result.explanation}
                                            </p>
                                        </details>
                                    </div>

                                     <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg border border-light-border dark:border-dark-border">
                                        <h3 className="text-xl font-bold text-center mb-4 text-light-text dark:text-dark-text">{t('riskToleranceByAsset')}</h3>
                                        <div>
                                            <AssetToleranceBar label={t('highRiskAssets')} percentage={result.assetComfort.stocks} color="bg-indigo-500" />
                                            <AssetToleranceBar label={t('lowRiskAssets')} percentage={result.assetComfort.bonds} color="bg-blue-400" />
                                            <AssetToleranceBar label={t('realEstate')} percentage={result.assetComfort.realEstate} color="bg-teal-500" />
                                            <AssetToleranceBar label={t('commodities')} percentage={result.assetComfort.commodities} color="bg-amber-500" />
                                        </div>
                                    </div>
                                </div>

                                 <div className="mt-8 bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg border border-light-border dark:border-dark-border">
                                    <h3 className="text-xl font-bold text-center mb-2 text-light-text dark:text-dark-text">{t('yourInvestmentHorizon')}</h3>
                                    <p className="text-3xl font-bold text-center text-cyan-500 dark:text-cyan-400 mb-4 capitalize">
                                         {t(horizonTranslationMap[result.investmentHorizon as keyof typeof horizonTranslationMap] || result.investmentHorizon)}
                                    </p>
                                    <p className="text-center text-light-text/80 dark:text-dark-text/80 mb-6 max-w-2xl mx-auto">{result.investmentHorizonDescription}</p>
                                    <details className="text-sm group max-w-md mx-auto">
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


                                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={handleReset} className="px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text font-bold rounded-full text-lg transform transition-all duration-300 hover:-translate-y-1 shadow-xl">
                                        <RepeatIcon className="w-5 h-5" />
                                        {t('retakeQuiz')}
                                    </button>
                                     <button onClick={() => onDone(result ?? undefined)} className="px-6 py-3 inline-flex items-center justify-center gap-2 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary dark:text-dark-primary font-bold rounded-full text-lg shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
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
                <div className="w-full max-w-4xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-4 sm:p-6 shadow-2xl relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default RiskAnalysisSection;
