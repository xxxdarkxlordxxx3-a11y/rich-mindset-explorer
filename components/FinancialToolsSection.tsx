
import React, { useState, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../localization/translations';
import { CalculatorIcon, PlanIcon, LoadingIcon, CloseIcon, InfoIcon, CheckCircleIcon, XCircleIcon, BankIcon, DocumentIcon, GoldBarIcon, StockChartUpIcon, LaptopIcon, HazardIcon, LearnIcon, BrainIcon, TimeIcon } from './IconComponents';
import type { BudgetItem, InvestmentPlan, BudgetAnalysis, UserContext, RiskProfile, ExpenseBreakdown } from '../types';
import { createInvestmentPlan, getBudgetSuggestions } from '../services/geminiService';
import { logUserAction } from '../utils/logger';
import InvestmentPortfolio, { PortfolioItemData } from './InvestmentPortfolio';
import Modal from './Modal';
import RiskAnalysisSection from './RiskAnalysisSection';

const motion = framerMotion as any;

interface FinancialToolsSectionProps {
    onDone: () => void;
    userContext: UserContext;
    activeSubTool: string | null;
    setActiveSubTool: (tool: 'budget' | 'investment' | 'strategy' | 'risk' | 'youthGuide' | null) => void;
}

const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.5, ease: 'easeInOut' }
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: 'easeInOut' } }
};
  
const MetricCard: React.FC<{ title: string; value: string; delay: number }> = ({ title, value, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + delay * 0.1 }}
      className="bg-light-card/50 dark:bg-dark-card/50 p-4 rounded-xl text-center shadow"
    >
      <p className="text-sm text-light-text/70 dark:text-dark-text/70">{title}</p>
      <p className="text-xl font-bold text-light-text dark:text-dark-text">{value}</p>
    </motion.div>
);
  
const BreakdownBar: React.FC<{ breakdown: ExpenseBreakdown[], total: number }> = ({ breakdown, total }) => {
    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500'];
    if (!breakdown || breakdown.length === 0) return null;
  
    return (
      <div>
        <div className="w-full bg-light-border dark:bg-dark-border/50 rounded-full h-4 flex overflow-hidden my-2">
          {breakdown.map((item, i) => (
            <div
              key={item.category}
              className={`${colors[i % colors.length]}`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.category}: ${item.percentage.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {breakdown.map((item, i) => (
            <div key={item.category} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></span>
              <span>{item.category}</span>
              <span className="text-light-text/70 dark:text-dark-text/70">({item.percentage.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
};

type Situation = 'normal' | 'crisis' | 'shortage' | 'aggressive' | 'debt' | 'foundation' | 'acceleration';

const SITUATIONS: { key: Situation, titleKey: string }[] = [
    { key: 'normal', titleKey: 'situationProsperity' },
    { key: 'foundation', titleKey: 'situationBuildingFoundation' },
    { key: 'debt', titleKey: 'situationDebtPaydown' },
    { key: 'aggressive', titleKey: 'situationAggressiveSavings' },
    { key: 'acceleration', titleKey: 'situationWealthAcceleration' },
    { key: 'crisis', titleKey: 'situationCrisis' },
    { key: 'shortage', titleKey: 'situationShortage' },
];

const ALLOCATION_DATA: { [key in Situation]: { needs: number, wants: number, savings: number } } = {
    normal: { needs: 50, wants: 30, savings: 20 },
    foundation: { needs: 50, wants: 20, savings: 30 },
    debt: { needs: 50, wants: 10, savings: 40 },
    aggressive: { needs: 45, wants: 10, savings: 45 },
    acceleration: { needs: 40, wants: 20, savings: 40 },
    crisis: { needs: 60, wants: 15, savings: 25 },
    shortage: { needs: 70, wants: 5, savings: 25 },
};


const BudgetCalculator: React.FC<{userContext: UserContext}> = ({userContext}) => {
    const { language, t } = useLanguage();
    const [income, setIncome] = useState<number | ''>('');
    const [expenses, setExpenses] = useState<BudgetItem[]>([{ id: Date.now().toString(), category: '', amount: '', type: 'variable' }]);
    const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currency, setCurrency] = useState('EGP');
    const [selectedSituation, setSelectedSituation] = useState<Situation>('normal');
    const currencies = ['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED'];

    const formatCurrency = (num: number, currencyCode: string) => {
        try {
            return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(num);
        } catch (e) {
            // Fallback for unsupported currency codes
            return `${num} ${currencyCode}`;
        }
    };
    
    const handleExpenseChange = (id: string, field: 'category' | 'amount' | 'type', value: string) => {
        setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
    };

    const addExpense = () => {
        setExpenses([...expenses, { id: Date.now().toString(), category: '', amount: '', type: 'variable' }]);
    };
    
    const removeExpense = (id: string) => {
        if (expenses.length > 1) {
            setExpenses(expenses.filter(exp => exp.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logUserAction('Budget Analysis Requested', { income, numExpenses: expenses.length, currency });
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        const validExpenses = expenses
            .filter(e => e.category && parseFloat(e.amount as string) > 0)
            .map(e => ({...e, amount: parseFloat(e.amount as string), id: e.id, category: e.category, type: e.type as 'variable' | 'fixed'}));

        if (!income || validExpenses.length === 0) {
            setError(t('errorInvalidInput'));
            setIsLoading(false);
            return;
        }

        try {
            const analysisResult = await getBudgetSuggestions(income as number, validExpenses, currency, language, userContext);
            setAnalysis(analysisResult);
            logUserAction('Budget Analysis Succeeded');
        } catch (err) {
            setError(t('errorOccurred'));
            logUserAction('Budget Analysis Failed', { error: err });
        } finally {
            setIsLoading(false);
        }
    };

    const renderTargetAllocations = () => {
        if (!income || income === 0) return null;
        const alloc = ALLOCATION_DATA[selectedSituation];
        
        return (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 bg-light-secondary/30 dark:bg-dark-secondary/30 rounded-xl border border-light-border/50 dark:border-dark-border/50"
            >
                <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-light-text dark:text-dark-text text-sm sm:text-base">{t('targetAllocations')}</h4>
                     <span className="text-xs bg-light-card dark:bg-dark-card px-2 py-1 rounded text-light-text/70 dark:text-dark-text/70">{t('basedOnStrategy')}: {t(SITUATIONS.find(s => s.key === selectedSituation)?.titleKey || '')}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col gap-1">
                         <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{t('portfolioNeedsTitle')} ({alloc.needs}%)</span>
                         <span className="text-lg font-bold text-light-text dark:text-dark-text">{formatCurrency(Number(income) * (alloc.needs / 100), currency)}</span>
                         <div className="w-full h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-500" style={{width: '100%'}}></div>
                         </div>
                    </div>
                    <div className="flex flex-col gap-1">
                         <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t('portfolioWantsTitle')} ({alloc.wants}%)</span>
                         <span className="text-lg font-bold text-light-text dark:text-dark-text">{formatCurrency(Number(income) * (alloc.wants / 100), currency)}</span>
                         <div className="w-full h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{width: '100%'}}></div>
                         </div>
                    </div>
                    <div className="flex flex-col gap-1">
                         <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{t('portfolioSavingsTitle')} ({alloc.savings}%)</span>
                         <span className="text-lg font-bold text-light-text dark:text-dark-text">{formatCurrency(Number(income) * (alloc.savings / 100), currency)}</span>
                         <div className="w-full h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500" style={{width: '100%'}}></div>
                         </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="mt-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{t('monthlyIncome')}</label>
                            <div className="flex gap-2">
                            <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} placeholder="20000" className="w-full p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                            <select value={currency} onChange={e => setCurrency(e.target.value)} className="p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border font-semibold">
                                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">{t('financialSituation')}</label>
                             <div className="relative">
                                 <select
                                    value={selectedSituation}
                                    onChange={(e) => setSelectedSituation(e.target.value as Situation)}
                                    className="w-full appearance-none p-3 ltr:pr-10 rtl:pl-10 rounded-xl bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow cursor-pointer shadow-sm"
                                 >
                                    {SITUATIONS.map(sit => (
                                        <option key={sit.key} value={sit.key}>
                                            {t(sit.titleKey)}
                                        </option>
                                    ))}
                                 </select>
                                 <div className="pointer-events-none absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center px-3 text-light-text/60 dark:text-dark-text/60">
                                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                     </svg>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        {renderTargetAllocations()}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">{t('monthlyExpenses')}</label>
                        <div className="space-y-2">
                        {expenses.map((exp) => (
                            <div key={exp.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                                <input type="text" value={exp.category} onChange={e => handleExpenseChange(exp.id, 'category', e.target.value)} placeholder={t('expenseCategory')} className="w-full p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                                <input type="number" value={exp.amount} onChange={e => handleExpenseChange(exp.id, 'amount', e.target.value)} placeholder={t('amount')} className="w-40 p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                                <select value={exp.type} onChange={e => handleExpenseChange(exp.id, 'type', e.target.value)} className="p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border text-sm">
                                    <option value="variable">{t('variable')}</option>
                                    <option value="fixed">{t('fixed')}</option>
                                </select>
                                <button type="button" onClick={() => removeExpense(exp.id)} disabled={expenses.length <= 1} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full disabled:opacity-50 disabled:hover:bg-transparent">
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addExpense} className="mt-3 text-sm font-semibold text-cyan-600 hover:text-cyan-800">{t('addExpense')}</button>
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="mt-6 w-full flex justify-center items-center px-6 py-3 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary dark:text-dark-primary font-bold rounded-2xl text-lg shadow-xl shadow-blue-500/50 dark:shadow-xl dark:shadow-sky-500/50 disabled:opacity-50 border-2 border-light-primary-hover dark:border-dark-primary-hover">
                    {isLoading ? <LoadingIcon /> : t('getSuggestions')}
                </button>
            </form>
            <AnimatePresence>
            {isLoading && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-8 py-4 text-center flex flex-col items-center justify-center">
                    <LoadingIcon />
                    <p className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg">{t('loadingMessagePatience')}</p>
                </motion.div>
            )}
            {!isLoading && (analysis || error) && (
                 <motion.div 
                    initial={{opacity:0, y:10}} 
                    animate={{opacity:1, y:0}} 
                    exit={{opacity:0}}
                    className="mt-8"
                 >
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {analysis && (
                        <div className="p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border space-y-6">
                            <h3 className="text-xl font-bold text-center text-light-text dark:text-dark-text">{t('fixedVsVariableTitle')}</h3>
                            <p className="text-center text-light-text/80 dark:text-dark-text/80 italic">{analysis.summary}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard title={t('monthlyIncome')} value={formatCurrency(analysis.keyMetrics.totalIncome, currency)} delay={0} />
                                <MetricCard title={t('monthlyExpenses')} value={formatCurrency(analysis.keyMetrics.totalExpenses, currency)} delay={1} />
                                <MetricCard title={t('netSavings')} value={formatCurrency(analysis.keyMetrics.netSavings, currency)} delay={2} />
                                <MetricCard title={t('savingsRate')} value={`${analysis.keyMetrics.savingsRate.toFixed(1)}%`} delay={3} />
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">{t('expenseBreakdown')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="text-sm font-bold">{t('fixed')} ({formatCurrency(analysis.expenseBreakdown.totalFixed, currency)})</h5>
                                        <BreakdownBar breakdown={analysis.expenseBreakdown.fixed} total={analysis.expenseBreakdown.totalFixed} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold">{t('variable')} ({formatCurrency(analysis.expenseBreakdown.totalVariable, currency)})</h5>
                                        <BreakdownBar breakdown={analysis.expenseBreakdown.variable} total={analysis.expenseBreakdown.totalVariable} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-3">{t('positivePoints')}</h4>
                                    <ul className="space-y-2">
                                    {analysis.positivePoints.map((s,i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-light-text/90 dark:text-dark-text/90">{s}</span>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">{t('areasForImprovement')}</h4>
                                    <ul className="space-y-2">
                                    {analysis.areasForImprovement.map((s,i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <InfoIcon className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-light-text/90 dark:text-dark-text/90">
                                                <strong>{s.area}:</strong> {s.suggestion}
                                            </span>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

const InvestmentPlanner: React.FC<{onLaunchRiskQuiz: () => void, userContext: UserContext, determinedRisk: string | null}> = ({ onLaunchRiskQuiz, userContext, determinedRisk }) => {
    const { language, t } = useLanguage();
    const [details, setDetails] = useState({ goal: '', target: '', timeline: '', initial: '', monthly: '', risk: 'Medium' });
    const [plan, setPlan] = useState<InvestmentPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (determinedRisk) {
            setDetails(prev => ({ ...prev, risk: determinedRisk }));
        }
    }, [determinedRisk]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logUserAction('Investment Plan Requested', details);
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            const numericDetails = {
                goal: details.goal,
                target: Number(details.target),
                timeline: Number(details.timeline),
                initial: Number(details.initial),
                monthly: Number(details.monthly),
                risk: details.risk
            };
            const result = await createInvestmentPlan(numericDetails, language, userContext);
            setPlan(result);
            logUserAction('Investment Plan Succeeded');
        } catch (err) {
            setError(t('errorInvestmentPlan'));
            logUserAction('Investment Plan Failed', { error: err });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="goal" value={details.goal} onChange={handleChange} placeholder={t('investmentGoal')} className="md:col-span-2 p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                    <input name="target" type="number" value={details.target} onChange={handleChange} placeholder={t('targetAmount')} className="p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                    <input name="timeline" type="number" value={details.timeline} onChange={handleChange} placeholder={t('investmentTimeline')} className="p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                    <input name="initial" type="number" value={details.initial} onChange={handleChange} placeholder={t('initialInvestment')} className="p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                    <input name="monthly" type="number" value={details.monthly} onChange={handleChange} placeholder={t('monthlyContribution')} className="p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{t('riskTolerance')}</label>
                        <select name="risk" value={details.risk} onChange={handleChange} className="w-full p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border">
                            <option value="Low">{t('low')}</option>
                            <option value="Medium">{t('medium')}</option>
                            <option value="High">{t('high')}</option>
                        </select>
                        <p className="text-xs text-light-text/70 dark:text-dark-text/70 mt-2 text-center">
                            {t('notSureRisk')}{' '}
                            <button type="button" onClick={onLaunchRiskQuiz} className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                                {t('takeInvestorQuiz')}
                            </button>
                        </p>
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="mt-6 w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-lg shadow-xl shadow-purple-500/50 disabled:opacity-50 border-2 border-purple-600 dark:border-pink-400">
                     {isLoading ? <LoadingIcon /> : t('generatePlan')}
                </button>
            </form>
            {isLoading && (
                <div className="mt-8 py-4 text-center flex flex-col items-center justify-center">
                    <LoadingIcon />
                    <p className="text-light-text/80 dark:text-dark-text/80 mt-4 text-lg">{t('loadingMessagePatience')}</p>
                </div>
            )}
            {!isLoading && (plan || error) && (
                 <div className="mt-8 p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border">
                    <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">{plan?.planName || t('yourInvestmentPlan')}</h3>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {plan && <>
                    <p className="text-light-text/80 dark:text-dark-text/80 mb-4">{plan.summary}</p>
                    <h4 className="font-semibold mb-2 text-light-text dark:text-dark-text">{t('assetAllocation')}</h4>
                    <div className="w-full bg-light-border dark:bg-dark-border/50 rounded-full h-6 flex overflow-hidden mb-2">
                        {Object.keys(plan.assetAllocation).map((key, i) => {
                            const value = plan.assetAllocation[key];
                            return value > 0 ? (
                                <div key={key} className={`flex items-center justify-center text-white text-xs font-bold ${['bg-indigo-500', 'bg-blue-400', 'bg-teal-500', 'bg-amber-500'][i % 4]}`} style={{width: `${value}%`}}>
                                    {value > 10 ? `${value}%` : ''}
                                </div>
                            ) : null;
                        })}
                    </div>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-light-text/80 dark:text-dark-text/80 mb-4">
                         {Object.keys(plan.assetAllocation).map((key, i) => (
                              <div key={key} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${['bg-indigo-500', 'bg-blue-400', 'bg-teal-500', 'bg-amber-500'][i % 4]}`}></span>{key}</div>
                         ))}
                     </div>
                     <h4 className="font-semibold mb-2 text-light-text dark:text-dark-text">{t('strategies')}</h4>
                     <ul className="space-y-2 list-disc list-inside text-light-text/90 dark:text-dark-text/90 mb-4">
                        {plan.strategies.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                    <p className="text-xs text-light-text/60 dark:text-dark-text/60"><strong>{t('disclaimer')}:</strong> {plan.disclaimer}</p>
                    </>}
                 </div>
            )}
        </div>
    );
};

const BudgetStrategy: React.FC = () => {
    const { t } = useLanguage();
    const [activeSituation, setActiveSituation] = useState<Situation>('normal');
    const [selectedDetail, setSelectedDetail] = useState<PortfolioItemData | null>(null);


    const portfolioDataSets: { [key in Situation]: PortfolioItemData[] } = {
        normal: [
            { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 50, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 30, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 20, color: 'bg-indigo-500' },
        ],
        foundation: [
            { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 50, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 20, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 30, color: 'bg-indigo-500' },
        ],
        debt: [
            { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 50, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 10, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 40, color: 'bg-indigo-500' },
        ],
        aggressive: [
             { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 45, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 10, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 45, color: 'bg-indigo-500' },
        ],
        acceleration: [
            { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 40, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 20, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 40, color: 'bg-indigo-500' },
        ],
        crisis: [
            { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 60, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 15, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 25, color: 'bg-indigo-500' },
        ],
        shortage: [
            { titleKey: 'portfolioNeedsTitle', defKey: 'portfolioNeedsDef', descKey: 'portfolioNeedsItems', percentage: 70, color: 'bg-cyan-500' },
            { titleKey: 'portfolioWantsTitle', defKey: 'portfolioWantsDef', descKey: 'portfolioWantsItems', percentage: 5, color: 'bg-blue-500' },
            { titleKey: 'portfolioSavingsTitle', defKey: 'portfolioSavingsDef', descKey: 'portfolioSavingsItems', percentage: 25, color: 'bg-indigo-500' },
        ],
    };
    
    const portfolioData = portfolioDataSets[activeSituation];

    return (
        <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">{t('investmentStrategyTitle')}</h3>
            <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-8 max-w-3xl mx-auto">{t('investmentStrategySubtitle')}</p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
                {SITUATIONS.map(sit => (
                    <button
                        key={sit.key}
                        onClick={() => setActiveSituation(sit.key)}
                        className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 ${
                            activeSituation === sit.key
                                ? 'bg-light-primary text-light-primary-text dark:bg-dark-primary dark:text-dark-primary-text shadow-lg shadow-blue-500/30'
                                : 'bg-light-card/50 dark:bg-dark-card/50 border border-light-border dark:border-dark-border text-light-text/80 dark:text-dark-text/80 hover:bg-light-card dark:hover:bg-dark-card'
                        }`}
                    >
                        {t(sit.titleKey)}
                    </button>
                ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-8 lg:gap-12">
               <InvestmentPortfolio data={portfolioData} onBlockClick={setSelectedDetail} />
            </div>

            <Modal 
                isOpen={!!selectedDetail} 
                onClose={() => setSelectedDetail(null)}
                title={selectedDetail ? `${t('about')} ${t(selectedDetail.titleKey)}` : ''}
            >
                {selectedDetail && (
                    <div>
                        <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-6">
                            {selectedDetail.defKey ? t(selectedDetail.defKey) : 'No definition available.'}
                        </p>
                        <h4 className="font-bold text-xl mb-3 text-light-text dark:text-dark-text">{t('includesItems')}</h4>
                        <ul className="space-y-2">
                            {selectedDetail.descKey && t(selectedDetail.descKey).split('|').map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 rtl:ml-2 ltr:mr-2 flex-shrink-0 mt-1" />
                                    <span className="text-light-text/90 dark:text-dark-text/90">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="px-6 py-2 bg-light-primary text-light-primary-text rounded-lg font-semibold hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover"
                            >
                                {t('backToTools')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const YouthInvestmentGuide: React.FC = () => {
    const { t, language } = useLanguage();
    const [showHardSkills, setShowHardSkills] = useState(false);

    const steps = [
        { titleKey: 'youthGuideStep1Title', contentKey: 'youthGuideStep1Content', icon: <BankIcon className="w-8 h-8 text-green-500" /> },
        { titleKey: 'youthGuideStep2Title', contentKey: 'youthGuideStep2Content', icon: <HazardIcon className="w-8 h-8 text-red-500" /> },
        { titleKey: 'youthGuideStep3Title', contentKey: 'youthGuideStep3Content', icon: <LaptopIcon className="w-8 h-8 text-purple-500" /> },
        { titleKey: 'youthGuideStep4Title', contentKey: 'youthGuideStep4Content', icon: <DocumentIcon className="w-8 h-8 text-blue-500" /> },
        { titleKey: 'youthGuideStep5Title', contentKey: 'youthGuideStep5Content', icon: <GoldBarIcon className="w-8 h-8 text-yellow-500" /> },
        { titleKey: 'youthGuideStep6Title', contentKey: 'youthGuideStep6Content', icon: <StockChartUpIcon className="w-8 h-8 text-indigo-500" /> },
        { titleKey: 'youthGuideStep7Title', contentKey: 'youthGuideStep7Content', icon: <BrainIcon className="w-8 h-8 text-cyan-500" /> },
        { titleKey: 'youthGuideStep8Title', contentKey: 'youthGuideStep8Content', icon: <TimeIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" /> },
    ];

    const hardSkillsData = translations[language].hardSkills;

    const renderContentWithLink = (text: string, linkText: string, onClick: () => void) => {
        const parts = text.split('{link}');
        if (parts.length === 1) return text;
        return (
            <>
                {parts[0]}
                <button 
                    onClick={onClick}
                    className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline underline-offset-4 mx-1 transition-colors"
                >
                    {linkText}
                </button>
                {parts[1]}
            </>
        );
    };

    return (
         <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">{t('youthInvestmentGuideTitle')}</h3>
            <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-8 max-w-3xl mx-auto">{t('youthInvestmentGuideSubtitle')}</p>
            <div className="space-y-6 text-left rtl:text-right">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.titleKey}
                        className="bg-light-secondary/50 dark:bg-dark-secondary/50 p-4 rounded-xl border border-light-border dark:border-dark-border flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="flex-shrink-0">{step.icon}</div>
                        <div>
                            <h4 className="font-bold text-light-text dark:text-dark-text">{t(step.titleKey)}</h4>
                            <p className="text-sm text-light-text/80 dark:text-dark-text/80 leading-relaxed">
                                {step.titleKey === 'youthGuideStep3Title' 
                                    ? renderContentWithLink(t(step.contentKey), hardSkillsData?.title || 'Hard Skills', () => setShowHardSkills(true))
                                    : t(step.contentKey)
                                }
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

             <Modal isOpen={showHardSkills} onClose={() => setShowHardSkills(false)} title={hardSkillsData?.title}>
                {hardSkillsData && (
                    <div className="text-light-text dark:text-dark-text">
                        <p className="mb-6 text-light-text/80 dark:text-dark-text/80">{hardSkillsData.intro}</p>
                        <div className="space-y-6">
                            {hardSkillsData.categories.map((cat, idx) => (
                                <div key={idx} className="bg-light-secondary/30 dark:bg-dark-secondary/30 p-4 rounded-lg border border-light-border/50 dark:border-dark-border/50">
                                    <h4 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-400">{cat.name}</h4>
                                    <ul className="list-disc list-inside space-y-1 text-light-text/90 dark:text-dark-text/90">
                                        {cat.skills.map((skill, sIdx) => (
                                            <li key={sIdx}>{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};


const FinancialToolsSection: React.FC<FinancialToolsSectionProps> = ({ onDone, userContext, activeSubTool, setActiveSubTool }) => {
    const { t } = useLanguage();
    const [riskResult, setRiskResult] = useState<string | null>(null);

    useEffect(() => {
        if (!activeSubTool) {
            setActiveSubTool('budget');
        }
    }, [activeSubTool, setActiveSubTool]);

    const mapRiskProfile = (profile: string): string => {
        const lowerProfile = profile.toLowerCase();
        if (lowerProfile.includes('aggressive') || lowerProfile.includes('جريء')) return 'High';
        if (lowerProfile.includes('moderate') || lowerProfile.includes('معتدل')) return 'Medium';
        return 'Low'; // Conservative, متحفظ, etc.
    };

    const handleRiskAnalysisDone = (profile?: RiskProfile) => {
        if (profile) {
            const mappedRisk = mapRiskProfile(profile.profile);
            setRiskResult(mappedRisk);
        }
        setActiveSubTool('investment');
    };

    return (
        <section className="py-4 px-2 flex justify-center">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-4xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border-2 border-slate-300 dark:border-slate-600 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-slate-500/30 dark:shadow-2xl dark:shadow-black/50 relative"
            >
                <AnimatePresence mode="wait">
                    {activeSubTool === 'risk' ? (
                         <motion.div
                            key="risk"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                           <RiskAnalysisSection onDone={handleRiskAnalysisDone} userContext={userContext} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tools"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text">{t('financialTools')}</h2>
                            </div>
                            
                            <div className="flex justify-center bg-light-secondary dark:bg-dark-secondary p-1.5 rounded-2xl mb-6">
                                <TabButton 
                                    title={t('budgetCalculator')} 
                                    isActive={activeSubTool === 'budget'} 
                                    onClick={() => setActiveSubTool('budget')}
                                    icon={<CalculatorIcon className="w-5 h-5" />}
                                />
                                <TabButton 
                                    title={t('budgetStrategy')}
                                    isActive={activeSubTool === 'strategy'} 
                                    onClick={() => setActiveSubTool('strategy')}
                                    icon={<InfoIcon className="w-5 h-5" />}
                                />
                                <TabButton 
                                    title={t('investmentPlanner')}
                                    isActive={activeSubTool === 'investment'} 
                                    onClick={() => setActiveSubTool('investment')}
                                    icon={<PlanIcon className="w-5 h-5" />}
                                />
                                <TabButton 
                                    title={t('youthInvestmentGuide')}
                                    isActive={activeSubTool === 'youthGuide'} 
                                    onClick={() => setActiveSubTool('youthGuide')}
                                    icon={<LearnIcon className="w-5 h-5" />}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSubTool}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeSubTool === 'youthGuide' && <YouthInvestmentGuide />}
                                    {activeSubTool === 'budget' && <BudgetCalculator userContext={userContext} />}
                                    {activeSubTool === 'investment' && <InvestmentPlanner onLaunchRiskQuiz={() => setActiveSubTool('risk')} userContext={userContext} determinedRisk={riskResult} />}
                                    {activeSubTool === 'strategy' && <BudgetStrategy />}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

const TabButton = ({ title, isActive, onClick, icon }: { title: string, isActive: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button 
        onClick={onClick}
        className={`flex-1 justify-center flex items-center gap-2 px-3 py-2 text-xs sm:text-base font-semibold transition-colors rounded-xl ${isActive ? 'bg-light-card dark:bg-dark-card shadow-lg text-cyan-600 dark:text-cyan-400' : 'text-light-text/60 dark:text-dark-text/60 hover:bg-light-card/50 dark:hover:bg-dark-card/50'}`}
    >
        {icon}
        <span className="hidden sm:inline">{title}</span>
    </button>
);


export default FinancialToolsSection;
