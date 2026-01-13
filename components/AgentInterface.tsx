import React, { useState, useRef } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { UserContext, NewsData, Book, GeneratedContent as GeneratedContentType, ToolType } from '../types';
import { getFinancialNews, generateBookRecommendations, generateContentForTopic, generateWebsiteIdeas, interpretAgentRequest } from '../services/geminiService';
import { LoadingIcon, SendIcon, CloseIcon } from './IconComponents';
import FinancialToolsSection from './FinancialToolsSection';
import QuizSection from './QuizSection';
import RiskAnalysisSection from './RiskAnalysisSection';

import GeneratedContent from './GeneratedContent';
import NewsComponent from './NewsComponent';
import BookRecommendations from './BookRecommendations';
import FeatureIdeas from './FeatureIdeas';

const motion = framerMotion as any;

interface AgentInterfaceProps {
    userContext: UserContext;
    setActivity: (activity: string) => void;
    onClose: () => void;
    onLaunchTool: (tool: ToolType) => void;
}

interface ActiveComponent {
    name: string;
    props?: any;
    data?: any;
}

const AgentInterface: React.FC<AgentInterfaceProps> = ({ userContext, setActivity, onClose, onLaunchTool }) => {
    const { t, language } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeComponent, setActiveComponent] = useState<ActiveComponent | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handlePromptSubmit = async (query: string) => {
        if (!query || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setActiveComponent(null);
        setActivity(`Asking Manus: "${query}"`);
        setPrompt('');

        try {
            const result = await interpretAgentRequest(query, userContext, language);
            
            if (result.command === 'show_component') {
                let toolType: ToolType;
                if (result.component_name === 'QuizSection' && result.component_props?.quizType) {
                    toolType = result.component_props.quizType as ToolType;
                } else if (result.component_name === 'RiskAnalysisSection') {
                    toolType = 'risk';
                } else {
                    toolType = 'tools';
                }
                onLaunchTool(toolType);
                return; // Exit after launching tool
            }

            switch(result.command) {
                case 'generate_content':
                    const content = await generateContentForTopic(result.content_topic, language, userContext);
                    setActiveComponent({ name: 'GeneratedContent', data: content });
                    setActivity(`Learning about ${result.content_topic}.`);
                    break;
                case 'fetch_news':
                    const newsResponse = await getFinancialNews(language, result.news_category || 'All', userContext);
                    const newsData: NewsData = {
                        text: newsResponse.text,
                        sources: newsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
                    };
                    setActiveComponent({ name: 'NewsComponent', data: newsData });
                    setActivity(`Viewing news for ${result.news_category || 'All'}.`);
                    break;
                case 'recommend_books':
                    const books = await generateBookRecommendations(language, userContext);
                    setActiveComponent({ name: 'BookRecommendations', data: books });
                    setActivity('Browsing book recommendations.');
                    break;
                case 'suggest_ideas':
                    const ideas = await generateWebsiteIdeas(language, userContext);
                    setActiveComponent({ name: 'FeatureIdeas', data: ideas });
                    setActivity('Brainstorming new website features.');
                    break;
                case 'show_help':
                case 'unknown':
                    setActiveComponent({ name: 'GeneratedContent', data: { title: "Manus AI", explanation: result.response_to_user, keyPoints: [] } });
                    setActivity(`Chatting with Manus.`);
                    break;
                default:
                    throw new Error("Unknown command from agent.");
            }

        } catch (e) {
            console.error("Error processing agent request:", e);
            setError(t('errorOccurred'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCloseComponent = () => {
        setActiveComponent(null);
        setActivity('Interacting with Manus Interface');
    };
    
    const renderActiveComponent = () => {
        if (!activeComponent) return null;

        // These components are now launched fullscreen via onLaunchTool
        // Keeping this for non-tool content
        switch(activeComponent.name) {
            case 'GeneratedContent':
                 return <GeneratedContent content={activeComponent.data} onDone={handleCloseComponent} />;
            case 'NewsComponent':
                return <NewsComponent newsData={activeComponent.data} onDone={handleCloseComponent} />;
            case 'BookRecommendations':
                 return <BookRecommendations books={activeComponent.data} onDone={handleCloseComponent} />;
            case 'FeatureIdeas':
                return <FeatureIdeas ideas={activeComponent.data} onDone={handleCloseComponent} />;
            default:
                return null;
        }
    };

    const suggestions = [t('manusSuggestion1'), t('manusSuggestion2'), t('manusSuggestion3'), t('manusSuggestion4')];

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{t('chatTitle')}</h3>
                <button onClick={onClose} className="text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text transition-colors">
                    <CloseIcon />
                </button>
            </header>

            <main className="flex-grow flex flex-col overflow-y-auto">
                <div className="flex-grow flex items-center justify-center p-4">
                     <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center"
                            >
                                <LoadingIcon />
                                <p className="mt-4 text-lg text-light-text/80 dark:text-dark-text/80">{t('loadingMessagePatience')}</p>
                            </motion.div>
                        ) : activeComponent ? (
                            <motion.div
                                key="component"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full"
                            >
                                {renderActiveComponent()}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center max-w-2xl mx-auto"
                            >
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                                    {t('appLogoName')}
                                </h1>
                                <p className="mt-4 text-lg sm:text-xl text-light-text/80 dark:text-dark-text/80">
                                    {t('manusWelcome')}
                                </p>
                                {error && <p className="mt-4 text-red-500">{error}</p>}
                                <div className="mt-8 flex flex-wrap justify-center gap-2">
                                    {suggestions.map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => handlePromptSubmit(s)}
                                            className="px-4 py-1.5 text-sm bg-light-card/40 dark:bg-dark-card/40 border border-light-border dark:border-dark-border rounded-full hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            
            <footer className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handlePromptSubmit(prompt); }}
                    className="relative"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('manusPromptPlaceholder')}
                        className="w-full p-4 ltr:pr-14 rtl:pl-14 text-lg bg-light-secondary dark:bg-dark-secondary backdrop-blur-xl border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                    <button type="submit" disabled={isLoading || !prompt} className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 p-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default AgentInterface;