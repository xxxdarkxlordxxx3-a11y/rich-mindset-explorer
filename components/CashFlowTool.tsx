import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import type { UserContext, CashFlowItem, CashFlowStatement } from '../types';
import { generateCashFlowStatement } from '../services/geminiService';
import { logUserAction } from '../utils/logger';
import { LoadingIcon, CloseIcon } from './IconComponents';

const motion = framerMotion as any;

interface CashFlowToolProps {
    userContext: UserContext;
}

const ItemList: React.FC<{
    items: CashFlowItem[];
    setItems: React.Dispatch<React.SetStateAction<CashFlowItem[]>>;
    title: string;
}> = ({ items, setItems, title }) => {
    const { t } = useLanguage();
    const handleItemChange = (index: number, field: 'item' | 'amount', value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { item: '', amount: 0 }]);
    };
    
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">{title}</h4>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                        <input type="text" value={item.item} onChange={e => handleItemChange(index, 'item', e.target.value)} placeholder={t('itemName')} className="w-full p-2 rounded-md bg-light-card/80 dark:bg-dark-card/80 border border-light-border dark:border-dark-border text-sm" />
                        <input type="number" value={item.amount || ''} onChange={e => handleItemChange(index, 'amount', Number(e.target.value))} placeholder={t('amount')} className="w-full p-2 rounded-md bg-light-card/80 dark:bg-dark-card/80 border border-light-border dark:border-dark-border text-sm" />
                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length === 1}>
                             <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 text-sm font-semibold text-cyan-600 hover:text-cyan-800">{t('addItem')}</button>
        </div>
    );
};

const CashFlowTool: React.FC<CashFlowToolProps> = ({ userContext }) => {
    const { language, t } = useLanguage();
    const [balance, setBalance] = useState<number | ''>('');
    const [opInflows, setOpInflows] = useState<CashFlowItem[]>([{ item: '', amount: 0 }]);
    const [opOutflows, setOpOutflows] = useState<CashFlowItem[]>([{ item: '', amount: 0 }]);
    const [invInflows, setInvInflows] = useState<CashFlowItem[]>([{ item: '', amount: 0 }]);
    const [invOutflows, setInvOutflows] = useState<CashFlowItem[]>([{ item: '', amount: 0 }]);
    const [finInflows, setFinInflows] = useState<CashFlowItem[]>([{ item: '', amount: 0 }]);
    const [finOutflows, setFinOutflows] = useState<CashFlowItem[]>([{ item: '', amount: 0 }]);

    const [statement, setStatement] = useState<CashFlowStatement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const filterEmpty = (items: CashFlowItem[]) => items.filter(i => i.item && i.amount > 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logUserAction('Cash Flow Statement Requested');
        setIsLoading(true);
        setError(null);
        setStatement(null);

        try {
            const result = await generateCashFlowStatement({
                beginningBalance: balance as number,
                opInflows: filterEmpty(opInflows),
                opOutflows: filterEmpty(opOutflows),
                invInflows: filterEmpty(invInflows),
                invOutflows: filterEmpty(invOutflows),
                finInflows: filterEmpty(finInflows),
                finOutflows: filterEmpty(finOutflows),
            }, language, userContext);
            setStatement(result);
        } catch(err) {
            setError(t('errorOccurred'));
            logUserAction('Cash Flow Statement Failed', { error: err });
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatCurrency = (num: number) => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'USD' }).format(num);

    const renderTableSection = (title: string, inflows: CashFlowItem[], outflows: CashFlowItem[], net: number) => (
        <div className="mb-4">
            <h4 className="text-lg font-bold p-2 bg-light-card dark:bg-dark-card rounded-t-lg">{title}</h4>
            <table className="w-full text-sm text-left rtl:text-right">
                 <tbody>
                    {inflows.map((i, idx) => <tr key={`in-${idx}`} className="border-b dark:border-dark-border"><td className="p-2">{i.item}</td><td className="p-2 text-right">{formatCurrency(i.amount)}</td></tr>)}
                    {outflows.map((o, idx) => <tr key={`out-${idx}`} className="border-b dark:border-dark-border"><td className="p-2">{o.item}</td><td className="p-2 text-right text-red-500">({formatCurrency(Math.abs(o.amount))})</td></tr>)}
                    <tr className="font-bold bg-light-secondary/50 dark:bg-dark-secondary/50"><td className="p-2">{t('netCashFlow')}</td><td className={`p-2 text-right ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(net)}</td></tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="mt-6">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t('beginningCashBalance')}</label>
                    <input type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} className="w-full p-2 rounded-md bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-light-secondary/50 dark:bg-dark-secondary/50 rounded-lg">
                    <ItemList items={opInflows} setItems={setOpInflows} title={`${t('operatingActivities')} - ${t('inflows')}`} />
                    <ItemList items={opOutflows} setItems={setOpOutflows} title={`${t('operatingActivities')} - ${t('outflows')}`} />
                    <ItemList items={invInflows} setItems={setInvInflows} title={`${t('investingActivities')} - ${t('inflows')}`} />
                    <ItemList items={invOutflows} setItems={setInvOutflows} title={`${t('investingActivities')} - ${t('outflows')}`} />
                    <ItemList items={finInflows} setItems={setFinInflows} title={`${t('financingActivities')} - ${t('inflows')}`} />
                    <ItemList items={finOutflows} setItems={setFinOutflows} title={`${t('financingActivities')} - ${t('outflows')}`} />
                </div>
                 <button type="submit" disabled={isLoading} className="mt-6 w-full flex justify-center items-center px-6 py-3 bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:dark-primary-hover text-light-primary-text dark:text-dark-primary-text font-bold rounded-2xl text-lg shadow-xl">
                    {isLoading ? <LoadingIcon /> : t('generateStatement')}
                </button>
            </form>
            
            {isLoading && <div className="mt-8 text-center"><LoadingIcon /></div>}

            {!isLoading && (statement || error) && (
                 <div className="mt-8">
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {statement && (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border">
                            {renderTableSection(t('operatingActivities'), statement.operatingActivities.inflows, statement.operatingActivities.outflows, statement.operatingActivities.netCashFlow)}
                            {renderTableSection(t('investingActivities'), statement.investingActivities.inflows, statement.investingActivities.outflows, statement.investingActivities.netCashFlow)}
                            {renderTableSection(t('financingActivities'), statement.financingActivities.inflows, statement.financingActivities.outflows, statement.financingActivities.netCashFlow)}
                            
                             <div className="mt-4">
                                <h4 className="text-lg font-bold p-2 bg-light-card dark:bg-dark-card rounded-t-lg">{t('summary')}</h4>
                                <table className="w-full text-sm text-left rtl:text-right">
                                    <tbody>
                                        <tr className="border-b dark:border-dark-border"><td className="p-2">{t('netIncreaseInCash')}</td><td className="p-2 text-right">{formatCurrency(statement.summary.netIncreaseInCash)}</td></tr>
                                        <tr className="border-b dark:border-dark-border"><td className="p-2">{t('beginningCashBalance')}</td><td className="p-2 text-right">{formatCurrency(statement.summary.beginningCashBalance)}</td></tr>
                                        <tr className="font-bold bg-light-secondary/50 dark:bg-dark-secondary/50"><td className="p-2">{t('endingCashBalance')}</td><td className="p-2 text-right">{formatCurrency(statement.summary.endingCashBalance)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-lg font-bold mb-2">{t('aiAnalysis')}</h4>
                                <p className="text-sm italic">{statement.analysis}</p>
                            </div>

                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CashFlowTool;