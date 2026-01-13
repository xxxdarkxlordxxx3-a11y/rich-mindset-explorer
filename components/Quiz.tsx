import React, { useState, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import type { QuizQuestion, UserAnswer, MatchingPair } from '../types';
import { LoadingIcon } from './IconComponents';

const motion = framerMotion as any;

// Fisher-Yates shuffle utility
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface QuizProps {
  questions: QuizQuestion[];
  onSubmit: (answers: UserAnswer[]) => void;
  title: string;
}

interface ProcessedQuestion extends QuizQuestion {
    shuffledOptions?: any[]; // For MC/TF
    shuffledLeftItems?: string[]; // For Matching
    shuffledRightItems?: string[]; // For Matching
}

const Quiz: React.FC<QuizProps> = ({ questions, onSubmit, title }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const { t, language } = useLanguage();
  
  // Store questions with their shuffled state so they don't reshuffle on nav
  const [processedQuestions, setProcessedQuestions] = useState<ProcessedQuestion[]>([]);
  
  // State for Input questions
  const [inputText, setInputText] = useState('');

  // State for Matching questions
  // Selection stores { side: 'left' | 'right', value: string }
  const [selection, setSelection] = useState<{ side: 'left' | 'right', value: string } | null>(null);
  const [matches, setMatches] = useState<MatchingPair[]>([]);

  // Initialize questions with stable shuffling
  useEffect(() => {
      if (questions && questions.length > 0) {
          const processed = questions.map(q => {
              const newQ: ProcessedQuestion = { ...q };
              if (q.type === 'mc' || q.type === 'tf') {
                  if (q.options) {
                      const optionsWithOriginalIndex = q.options.map((opt, index) => ({
                          ...opt,
                          originalIndex: index,
                      }));
                      newQ.shuffledOptions = shuffleArray(optionsWithOriginalIndex);
                  }
              } else if (q.type === 'matching' && q.pairs) {
                  const lefts = q.pairs.map(p => p.left);
                  const rights = q.pairs.map(p => p.right);
                  newQ.shuffledLeftItems = shuffleArray(lefts);
                  newQ.shuffledRightItems = shuffleArray(rights);
              }
              return newQ;
          });
          setProcessedQuestions(processed);
      }
  }, [questions]);

  const currentQuestion = processedQuestions[currentQuestionIndex];

  // Load existing answer into local state when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    const existingAnswer = userAnswers.find(a => a.questionIndex === currentQuestionIndex);

    if (currentQuestion.type === 'input') {
        setInputText(existingAnswer ? existingAnswer.answerContent as string : '');
    } else if (currentQuestion.type === 'matching') {
        setMatches(existingAnswer ? existingAnswer.answerContent as MatchingPair[] : []);
        setSelection(null);
    }
  }, [currentQuestionIndex, processedQuestions, userAnswers]);

  // --- Handlers ---

  const saveAnswer = (content: any) => {
      const existingAnswerIndex = userAnswers.findIndex(a => a.questionIndex === currentQuestionIndex);
      let newAnswers = [...userAnswers];
      if (existingAnswerIndex > -1) {
          newAnswers[existingAnswerIndex] = { questionIndex: currentQuestionIndex, answerContent: content };
      } else {
          newAnswers.push({ questionIndex: currentQuestionIndex, answerContent: content });
      }
      setUserAnswers(newAnswers);
  };

  const handleMCSelect = (originalOptionIndex: number) => {
    saveAnswer(originalOptionIndex);
    setTimeout(handleNext, 300);
  };

  const handleInputSubmit = () => {
      if (inputText.trim()) {
          saveAnswer(inputText);
          handleNext();
      }
  };

  const handleMatchClick = (side: 'left' | 'right', item: string) => {
      // If item is already matched, ignore
      if (matches.some(m => m.left === item || m.right === item)) return;

      if (!selection) {
          // First click: Select item
          setSelection({ side, value: item });
          return;
      }

      if (selection.side === side) {
          // Clicked same side: Change selection or Deselect if same item
          if (selection.value === item) {
              setSelection(null);
          } else {
              setSelection({ side, value: item });
          }
      } else {
          // Clicked opposite side: Form a match
          const term = side === 'left' ? item : selection.value;
          const def = side === 'right' ? item : selection.value;
          
          // Ensure term came from left and def from right logic, or just pair them based on user click
          // Ideally, we store Left as Left and Right as Right for consistent validation
          const finalLeft = side === 'left' ? term : def;
          const finalRight = side === 'right' ? term : def;

          const newMatch = { left: finalLeft, right: finalRight };
          const newMatches = [...matches, newMatch];
          setMatches(newMatches);
          setSelection(null);

          // If all matched, auto save
          if (newMatches.length === (currentQuestion.pairs?.length || 0)) {
              saveAnswer(newMatches);
              setTimeout(handleNext, 1000); // Longer delay to see the full puzzle
          }
      }
  };

  const handleNext = () => {
    if (currentQuestionIndex < processedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentAnswer = userAnswers.find(a => a.questionIndex === currentQuestionIndex);

  // --- Renderers ---

  const renderMC_TF = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuestion.shuffledOptions?.map((option: any) => {
          const isSelected = currentAnswer?.answerContent === option.originalIndex;
          return (
            <motion.button
              key={option.originalIndex}
              onClick={() => handleMCSelect(option.originalIndex)}
              className={`relative w-full p-4 rounded-xl text-left transition-all duration-200 border-2 text-light-text dark:text-dark-text text-sm sm:text-base h-full flex items-center ${
                isSelected
                  ? 'bg-light-primary/10 dark:bg-dark-primary/10 border-light-primary dark:border-dark-primary font-semibold shadow-lg'
                  : 'bg-light-secondary/50 dark:bg-dark-secondary/50 border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50 hover:bg-light-secondary dark:hover:bg-dark-secondary'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.text}
            </motion.button>
          )
        })}
      </div>
  );

  const renderInput = () => (
      <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
          <textarea 
            className="w-full p-4 rounded-xl bg-light-secondary dark:bg-dark-secondary border-2 border-light-border dark:border-dark-border focus:border-cyan-500 focus:ring-0 text-light-text dark:text-dark-text min-h-[120px]"
            placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            onClick={handleInputSubmit}
            disabled={!inputText.trim()}
            className="self-end px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {language === 'ar' ? 'تأكيد الإجابة' : 'Confirm Answer'}
          </button>
      </div>
  );

  const renderMatching = () => {
      // Check if item is already in a match
      const isMatched = (item: string) => matches.some(m => m.left === item || m.right === item);
      
      const availableLeft = currentQuestion.shuffledLeftItems?.filter(item => !isMatched(item)) || [];
      const availableRight = currentQuestion.shuffledRightItems?.filter(item => !isMatched(item)) || [];

      return (
          <div className="w-full space-y-8">
              
              {/* Matched Area (The Puzzle Board) */}
              {matches.length > 0 && (
                  <div className="w-full p-4 bg-light-secondary/30 dark:bg-dark-secondary/30 rounded-xl border border-light-border/50 dark:border-dark-border/50">
                      <h4 className="text-center font-semibold text-green-600 dark:text-green-400 mb-4 text-sm">{language === 'ar' ? 'قطع البازل المكتملة' : 'Solved Puzzle Pieces'}</h4>
                      <div className="grid grid-cols-1 gap-3">
                          {matches.map((match, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-stretch justify-center"
                              >
                                  <div className="flex-1 p-3 bg-green-500 text-white text-sm font-medium rounded-s-lg border-r border-white/20 flex items-center justify-center text-center shadow-md">
                                      {match.left}
                                  </div>
                                  <div className="w-4 bg-green-600 relative overflow-hidden">
                                       {/* Visual Puzzle Connector */}
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full transform scale-75"></div>
                                  </div>
                                  <div className="flex-1 p-3 bg-green-500 text-white text-sm font-medium rounded-e-lg border-l border-white/20 flex items-center justify-center text-center shadow-md">
                                      {match.right}
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Selection Area */}
              <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full">
                  <div className="flex flex-col gap-3">
                      <h4 className="text-center font-semibold text-light-text/70 dark:text-dark-text/70 mb-2">{language === 'ar' ? 'المصطلح' : 'Term'}</h4>
                      <AnimatePresence>
                      {availableLeft.map((item, idx) => {
                          const isSelected = selection?.side === 'left' && selection.value === item;
                          return (
                              <motion.button
                                key={item}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                onClick={() => handleMatchClick('left', item)}
                                className={`p-3 rounded-lg border-2 text-sm text-light-text dark:text-dark-text min-h-[3rem] flex items-center justify-center transition-all shadow-sm relative ${isSelected ? 'border-cyan-500 bg-cyan-500/10 z-10 ring-2 ring-cyan-500/50' : 'border-light-border dark:border-dark-border bg-light-secondary dark:bg-dark-secondary hover:border-cyan-400'}`}
                                whileHover={{ scale: 1.02 }}
                              >
                                  {item}
                                  {/* Puzzle Notch Hint */}
                                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-light-card dark:bg-dark-card rounded-l-full opacity-50"></div>
                              </motion.button>
                          )
                      })}
                      </AnimatePresence>
                  </div>
                  <div className="flex flex-col gap-3">
                      <h4 className="text-center font-semibold text-light-text/70 dark:text-dark-text/70 mb-2">{language === 'ar' ? 'التعريف' : 'Definition'}</h4>
                      <AnimatePresence>
                      {availableRight.map((item, idx) => {
                          const isSelected = selection?.side === 'right' && selection.value === item;
                          return (
                              <motion.button
                                key={item}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                onClick={() => handleMatchClick('right', item)}
                                className={`p-3 rounded-lg border-2 text-sm text-light-text dark:text-dark-text min-h-[3rem] flex items-center justify-center transition-all shadow-sm relative ${isSelected ? 'border-cyan-500 bg-cyan-500/10 z-10 ring-2 ring-cyan-500/50' : 'border-light-border dark:border-dark-border bg-light-secondary dark:bg-dark-secondary hover:border-cyan-400'}`}
                                whileHover={{ scale: 1.02 }}
                              >
                                  {item}
                                  {/* Puzzle Notch Hint */}
                                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-light-card dark:bg-dark-card rounded-r-full opacity-50"></div>
                              </motion.button>
                          )
                      })}
                      </AnimatePresence>
                  </div>
              </div>
          </div>
      );
  };

  if (!processedQuestions || processedQuestions.length === 0 || !currentQuestion) {
    return (
        <div className="p-4 sm:p-6 w-full flex justify-center items-center min-h-[400px]">
            <LoadingIcon />
        </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / processedQuestions.length) * 100;

  return (
    <div className="p-4 sm:p-6 w-full relative overflow-hidden">
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 text-light-text/80 dark:text-dark-text/80">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">{title}</h2>
          <p className="font-semibold text-sm">{t('question')} {currentQuestionIndex + 1} {t('of')} {processedQuestions.length}</p>
        </div>
        <div className="w-full bg-light-secondary dark:bg-dark-secondary rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="relative min-h-[8rem] flex flex-col items-center justify-center mb-8 space-y-2">
        <AnimatePresence mode="wait">
          <motion.h3
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text text-center px-4"
          >
            {currentQuestion.question}
          </motion.h3>
        </AnimatePresence>
        {/* Hint for question type */}
        <span className="text-xs uppercase tracking-widest text-light-text/50 dark:text-dark-text/50 font-bold border border-light-border dark:border-dark-border px-2 py-1 rounded">
            {currentQuestion.type === 'mc' && (language === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice')}
            {currentQuestion.type === 'tf' && (language === 'ar' ? 'صح أم خطأ' : 'True / False')}
            {currentQuestion.type === 'input' && (language === 'ar' ? 'كتابة الإجابة' : 'Short Answer')}
            {currentQuestion.type === 'matching' && (language === 'ar' ? 'لغز التوصيل' : 'Puzzle Match')}
        </span>
      </div>

      <motion.div 
        key={currentQuestionIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        { (currentQuestion.type === 'mc' || currentQuestion.type === 'tf') && renderMC_TF() }
        { currentQuestion.type === 'input' && renderInput() }
        { currentQuestion.type === 'matching' && renderMatching() }
      </motion.div>

      <div className={`mt-10 flex ${currentQuestionIndex === 0 ? 'justify-end' : 'justify-between'} items-center`}>
        {currentQuestionIndex > 0 && (
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text font-bold rounded-full hover:bg-light-border dark:hover:bg-dark-border/60 transition-colors transform hover:-translate-y-0.5"
          >
            {t('back')}
          </button>
        )}
        
        {currentQuestionIndex < processedQuestions.length - 1 ? (
          <button
            onClick={handleNext}
            // For Matching, disable next if not fully answered
            disabled={currentQuestion.type === 'matching' && matches.length < (currentQuestion.pairs?.length || 0)}
            className="px-8 py-3 bg-light-primary dark:bg-dark-primary text-light-primary-text dark:text-dark-primary-text font-bold rounded-full hover:bg-light-primary-hover dark:hover:dark-primary-hover transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            {t('next')}
          </button>
        ) : (
          <button
            onClick={() => onSubmit(userAnswers)}
            disabled={userAnswers.length !== processedQuestions.length}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity transform hover:-translate-y-0.5 shadow-lg shadow-purple-500/40 disabled:opacity-50 disabled:from-slate-500 disabled:to-slate-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            {t('finish')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;