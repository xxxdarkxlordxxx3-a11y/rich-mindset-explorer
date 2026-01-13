import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { CloseIcon } from './IconComponents';
import { Book } from '../types';

const motion = framerMotion as any;

interface BookRecommendationsProps {
    books: Book[] | null;
    onDone: () => void;
}

const BookRecommendations: React.FC<BookRecommendationsProps> = ({ books, onDone }) => {
    const { t } = useLanguage();

    if (!books) {
        return (
            <div className="text-center p-8">
                <p>{t('errorOccurred')}</p>
                 <button onClick={onDone} className="mt-4 px-4 py-2 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                    {t('goBackHome')}
                </button>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        >
            <button onClick={onDone} className="absolute top-4 ltr:right-4 rtl:left-4 text-light-text/70 hover:text-light-text dark:text-dark-text/70 dark:hover:text-dark-text"><CloseIcon /></button>
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold">{t('bookRecommendationsTitle')}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {books.map((book, index) => (
                    <motion.a
                        key={index}
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div 
                            className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3] bg-light-secondary dark:bg-dark-secondary bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundImage: `url(${book.coverImage})` }}
                            aria-label={book.title}
                        />
                        <h4 className="mt-2 text-sm font-semibold text-center text-light-text dark:text-dark-text group-hover:text-cyan-500 transition-colors">{book.title}</h4>
                         <p className="text-xs text-center text-light-text/70 dark:text-dark-text/70">{book.author}</p>
                    </motion.a>
                ))}
            </div>
        </motion.div>
    );
};

export default BookRecommendations;