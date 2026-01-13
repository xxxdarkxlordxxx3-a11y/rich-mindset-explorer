
import React, { useState } from 'react';
import Hero from './Hero';
import EducationalContentSection from './EducationalContentSection';
import CashflowQuadrant from './CashflowQuadrant';
import InspirationSection from './InspirationSection';
import Footer from './Footer';
import Modal from './Modal';
import CashflowInfoPage from './CashflowInfoPage';
import { Story, SuccessStory, UserContext } from '../types';
import { motion } from 'framer-motion';
import { TimeIcon, MoneyIcon, AssetIcon, HazardIcon } from './IconComponents';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
    userContext: UserContext;
    setActivity: (activity: string) => void;
    onTestsClick: () => void;
    onToolsClick: () => void;
    onRulesClick: () => void;
    onTriggerEasterEgg: (type: 'time' | 'myth', story: SuccessStory | null) => void;
}

const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    onClick?: () => void;
    isButton?: boolean;
    colorClass?: string;
}> = ({ label, value, icon, onClick, isButton, colorClass }) => {
    const { t } = useLanguage();
    const isSecret = label === t('age') || label === t('timeToWealth');

    const Component = isButton ? 'button' : 'div';
    const componentProps = isButton ? { onClick } : {};

    const interactiveClasses = (isButton && !isSecret)
        ? 'cursor-pointer hover:bg-light-border dark:hover:bg-dark-border hover:shadow-lg hover:-translate-y-1'
        : '';
    
    return (
        <Component
            {...componentProps}
            className={`bg-light-secondary/50 dark:bg-dark-secondary/50 p-3 rounded-xl text-center transition-all duration-300 ${interactiveClasses} ${colorClass || ''}`}
        >
            <div className="flex justify-center text-light-text/80 dark:text-dark-text/80 mb-1">
                {icon}
            </div>
            <p className="text-xs font-semibold text-light-text/70 dark:text-dark-text/70">{label}</p>
            <p className="text-sm font-bold text-light-text dark:text-dark-text">{value}</p>
        </Component>
    );
};


const StoryModalContent: React.FC<{ 
    story: Story; 
    onClose: () => void;
    onTriggerEasterEgg: (type: 'time' | 'myth', story: SuccessStory) => void;
}> = ({ story, onClose, onTriggerEasterEgg }) => {
    const { t } = useLanguage();
    
    if (story.type === 'failure') {
        return (
            <div className="text-light-text dark:text-dark-text">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                    <StatCard label={t('peakNetWorth')} value={story.peakNetWorth} icon={<MoneyIcon className="w-5 h-5 text-green-500" />} />
                    <StatCard label={t('lossAmount')} value={story.lossAmount} icon={<MoneyIcon className="w-5 h-5 text-red-500" />} />
                    <StatCard label={t('causeOfFailure')} value={story.causeOfFailure} icon={<HazardIcon className="w-5 h-5 text-red-600" />} />
                </div>

                <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-4 font-medium">{story.bio}</p>
                <div className="prose dark:prose-invert max-w-none text-light-text/90 dark:text-dark-text/90">
                    <p className="leading-relaxed">{story.story}</p>
                    
                    <div className="mt-6 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                            <HazardIcon className="w-5 h-5" /> {t('keyMistakes')}
                        </h4>
                        <ul className="list-disc list-inside space-y-1 marker:text-red-500">
                            {story.mistakes.map((mistake, index) => <li key={index}>{mistake}</li>)}
                        </ul>
                    </div>

                    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{t('consequences')}</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {story.consequences.map((c, index) => <li key={index}>{c}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Success Story View
    return (
        <div className="text-light-text dark:text-dark-text">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-light-secondary/30 dark:bg-dark-secondary/30 rounded-xl border border-light-border/50 dark:border-dark-border/50">
                <StatCard label={t('netWorth')} value={story.netWorth} icon={<MoneyIcon className="w-5 h-5 text-green-500" />} />
                <StatCard 
                    label={t('age')} 
                    value={story.age} 
                    icon={<TimeIcon className="w-5 h-5 text-yellow-500" />}
                    isButton 
                    onClick={() => {
                        onClose();
                        onTriggerEasterEgg('time', story);
                    }} 
                />
                 <StatCard 
                    label={t('timeToWealth')} 
                    value={story.timeToWealth} 
                    icon={<TimeIcon className="w-5 h-5 text-cyan-500" />}
                    isButton 
                    onClick={() => {
                        onClose();
                        onTriggerEasterEgg('myth', story);
                    }} 
                />
                <StatCard label={t('sourceOfWealth')} value={story.sourceOfWealth} icon={<AssetIcon className="w-5 h-5 text-indigo-500" />} />
            </div>

            <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-4">{story.bio}</p>
            <div className="prose dark:prose-invert max-w-none text-light-text/90 dark:text-dark-text/90">
                <p>{story.story}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    <div className="p-3 bg-light-secondary/50 dark:bg-dark-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 font-semibold"><TimeIcon className="w-5 h-5 text-cyan-500" />{t('investmentTimeline')}</div>
                        <p className="text-sm mt-1">{story.timeline}</p>
                    </div>
                     <div className="p-3 bg-light-secondary/50 dark:bg-dark-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 font-semibold"><MoneyIcon className="w-5 h-5 text-green-500" />{t('netWorth')}</div>
                        <p className="text-sm mt-1">{story.netWorth}</p>
                    </div>
                </div>
                
                <div className="bg-light-secondary/30 dark:bg-dark-secondary/30 p-4 rounded-xl border border-light-border/50 dark:border-dark-border/50 mt-6">
                    <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <AssetIcon className="w-5 h-5 text-indigo-500" />
                        Key Holdings & Investments
                    </h4>
                    
                    {story.otherInvestments.length > 0 && (
                        <div className="mb-4">
                            <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 border-b border-indigo-200 dark:border-indigo-800 pb-1 inline-block">
                                {story.otherInvestments[0]} 
                            </h5>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                {story.otherInvestments.slice(1).map((item, index) => {
                                    if (item.includes("Other Investments") || item.includes("استثمارات أخرى")) return null;
                                    return <li key={index} className="text-sm">{item}</li>;
                                })}
                            </ul>
                        </div>
                    )}

                    {story.otherInvestments.findIndex(i => i.includes("Other Investments") || i.includes("استثمارات أخرى")) !== -1 && (
                        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                            <h5 className="font-bold text-slate-600 dark:text-slate-400 mb-2">
                                {story.otherInvestments.find(i => i.includes("Other Investments") || i.includes("استثمارات أخرى"))}
                            </h5>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                {story.otherInvestments.slice(story.otherInvestments.findIndex(i => i.includes("Other Investments") || i.includes("استثمارات أخرى")) + 1).map((item, index) => (
                                    <li key={index} className="text-sm">{item.replace('- ', '')}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <h4 className="font-bold mb-2">Key Lessons:</h4>
                    <ul className="list-disc list-inside">
                        {story.lessons.map((lesson, index) => <li key={index}>{lesson}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ userContext, setActivity, onTestsClick, onToolsClick, onRulesClick, onTriggerEasterEgg }) => {
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [infoPageType, setInfoPageType] = useState<'active' | 'passive' | 'opt' | 'opm' | null>(null);

    const handleSelectStory = (story: Story) => {
        setActivity(`Reading about ${story.name}`);
        setSelectedStory(story);
    };

    const handleTriggerInfo = (type: 'active' | 'passive' | 'opt' | 'opm') => {
        setActivity(`Learning about ${type.toUpperCase()}`);
        setInfoPageType(type);
    };

    if (infoPageType) {
        return (
            <motion.div key="infoPage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CashflowInfoPage type={infoPageType} onDone={() => setInfoPageType(null)} />
            </motion.div>
        );
    }
    
    return (
        <>
            <Hero onTestsClick={onTestsClick} onToolsClick={onToolsClick} onRulesClick={onRulesClick} />
            <CashflowQuadrant onSelectStory={handleSelectStory} onTriggerCashflowInfo={handleTriggerInfo} />
            <EducationalContentSection userContext={userContext} />
            <InspirationSection onSelectStory={handleSelectStory} />
            <Footer />

            <Modal isOpen={!!selectedStory} onClose={() => setSelectedStory(null)} title={selectedStory?.name}>
                {selectedStory && <StoryModalContent story={selectedStory} onClose={() => setSelectedStory(null)} onTriggerEasterEgg={onTriggerEasterEgg} />}
            </Modal>
        </>
    );
};

export default HomePage;
