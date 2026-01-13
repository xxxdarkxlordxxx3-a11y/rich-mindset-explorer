
import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import type { UserContext, SuccessStory, ToolType } from './types';
import { logUserAction } from './utils/logger';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import HomePage from './components/HomePage';
import TestsPage from './components/TestsPage';
import QuizSection from './components/QuizSection';
import FinancialToolsSection from './components/FinancialToolsSection';
import RecommendedReadingPage from './components/RecommendedReadingPage';
import FinancialRulesPage from './components/FinancialRulesPage';
import EasterEggPage from './components/EasterEggPage';
import { ChatIcon } from './components/IconComponents';
import ChatWindow from './components/ChatWindow';

const motion = framerMotion as any;

const App: React.FC = () => {
  const { language } = useLanguage();
  
  const [userContext, setUserContext] = useState<UserContext>({
    activity: 'Initializing App',
  });
  
  const [activity, setActivity] = useState('Initializing App');
  const [view, setView] = useState<'home' | 'testsPage' | 'activeTool' | 'readingPage' | 'rulesPage'>('home');
  const [activeToolProps, setActiveToolProps] = useState<{ toolType: ToolType } | null>(null);
  const [isChatOpen, setChatOpen] = useState(false);
  const [easterEgg, setEasterEgg] = useState<{ type: 'time' | 'myth', story: SuccessStory | null } | null>(null);
  const [activeSubTool, setActiveSubTool] = useState<string | null>(null);


  useEffect(() => {
    setUserContext(prev => ({...prev, activity}));
  }, [activity]);

  useEffect(() => {
      let currentActivity = 'Browsing Homepage';
      if(view === 'testsPage') currentActivity = 'Selecting a financial test';
      if(view === 'activeTool') currentActivity = `Taking the ${activeToolProps?.toolType} test`;
      if(view === 'readingPage') currentActivity = 'Browsing recommended books';
      if(view === 'rulesPage') currentActivity = 'Learning Investment Rules';
      if(isChatOpen) currentActivity = 'Chatting with Gemini AI Assistant';
      if(easterEgg) currentActivity = `Learning about ${easterEgg.type === 'time' ? 'Compound Interest' : 'the Get Rich Quick Myth'}`;
      setActivity(currentActivity);
  }, [view, activeToolProps, isChatOpen, easterEgg]);
  
  const handleTriggerEasterEgg = (type: 'time' | 'myth', story: SuccessStory | null) => {
      logUserAction(`Triggered Easter Egg: ${type}`);
      setEasterEgg({ type, story });
  };

  const handleEasterEggDone = () => {
      setEasterEgg(null);
  };


  const handleStartTool = (tool: ToolType) => {
    logUserAction(`Starting tool: ${tool}`);
    if (tool === 'reading') {
        setView('readingPage');
        return;
    }
    
    if (tool === 'rules') {
        setView('rulesPage');
        return;
    }

    if (tool === 'risk') {
        setActiveSubTool('risk');
        setActiveToolProps({ toolType: 'tools' }); 
    } else {
        setActiveToolProps({ toolType: tool });
    }
    setView('activeTool');
  };

  const handleToolDone = () => {
      setView('home');
      setActiveSubTool(null);
      setActiveToolProps(null);
  };

  const renderActiveTool = () => {
      if (!activeToolProps) return null;
      switch (activeToolProps.toolType) {
          case 'mindset':
          case 'budgeting':
          case 'investment':
              return <QuizSection onDone={handleToolDone} userContext={userContext} quizType={activeToolProps.toolType} />;
          case 'tools':
              return <FinancialToolsSection 
                onDone={handleToolDone} 
                userContext={userContext} 
                activeSubTool={activeSubTool}
                setActiveSubTool={setActiveSubTool}
              />;
          default:
              // Fallback to home if tool type is unknown
              setView('home');
              return null;
      }
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <HomePage
                userContext={userContext}
                setActivity={setActivity}
                onTestsClick={() => setView('testsPage')}
                onToolsClick={() => handleStartTool('tools')}
                onRulesClick={() => handleStartTool('rules')}
                onTriggerEasterEgg={handleTriggerEasterEgg}
            />
          </motion.div>
        );
      case 'testsPage':
        return (
          <motion.div key="testsPage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TestsPage onStartQuiz={handleStartTool} />
          </motion.div>
        );
      case 'readingPage':
        return (
          <motion.div key="readingPage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <RecommendedReadingPage onDone={handleToolDone} />
          </motion.div>
        );
      case 'rulesPage':
        return (
            <motion.div key="rulesPage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <FinancialRulesPage onDone={handleToolDone} />
            </motion.div>
        );
      case 'activeTool':
        return (
          <motion.div key="activeTool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {renderActiveTool()}
          </motion.div>
        );
      default:
        return null;
    }
  }

  const isCenteredView = ['testsPage', 'activeTool', 'readingPage', 'rulesPage'].includes(view);
  const showHomeIcon = view !== 'home';
  
  // Check if a quiz is active to hide header icons
  const isQuizActive = view === 'activeTool' && ['mindset', 'budgeting', 'investment'].includes(activeToolProps?.toolType || '');
  // Risk tool is handled within FinancialToolsSection but acts like a quiz
  const shouldHideHeader = activeSubTool === 'risk' || isQuizActive;

  if (easterEgg) {
    return (
        <div className="w-full min-h-screen text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg transition-colors duration-500 flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
             <div className="absolute inset-0 -z-10 h-full w-full">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#a8bbf755,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f633,transparent)]"></div>
            </div>
            <EasterEggPage onDone={handleEasterEggDone} type={easterEgg.type} story={easterEgg.story} />
        </div>
    );
  }


  return (
    <div className="w-full min-h-screen text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg transition-colors duration-500 flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 -z-10 h-full w-full">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#a8bbf755,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f633,transparent)]"></div>
      </div>
      
      <Header onHomeClick={() => setView('home')} showHomeIcon={showHomeIcon} hideAllIcons={shouldHideHeader} />
      
      <main className={`flex-grow flex flex-col overflow-y-auto ${isCenteredView ? 'justify-center pb-16' : ''}`}>
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {!isChatOpen && (
           <motion.button
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 ltr:right-6 rtl:left-6 w-16 h-16 bg-light-primary dark:bg-dark-primary text-light-primary-text dark:text-dark-primary-text rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-light-primary-hover dark:hover:dark-primary-hover transform transition-all hover:scale-110"
            aria-label="Open AI Assistant"
           >
             <ChatIcon />
           </motion.button>
        )}
      </AnimatePresence>
      
      <ChatWindow isOpen={isChatOpen} onClose={() => setChatOpen(false)} userContext={userContext} />
    </div>
  );
};

export default App;
