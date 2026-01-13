import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import Modal from './Modal';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../localization/translations';
import { Book } from '../types';

const motion = framerMotion as any;

interface BookRecommendationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

const BookCard: React.FC<{ book: Book, index: number }> = ({ book, index }) => {
    return (
        <motion.a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
        >
            <div 
                className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3] bg-light-secondary dark:bg-dark-secondary bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${book.coverImage})` }}
                aria-label={book.title}
            >
                {/* This div now serves as the image container via background-image */}
            </div>
            <h4 className="mt-2 text-sm font-semibold text-center text-light-text dark:text-dark-text group-hover:text-cyan-500 transition-colors">{book.title}</h4>
        </motion.a>
    );
};


const BookRecommendationsModal: React.FC<BookRecommendationsModalProps> = ({ isOpen, onClose }) => {
    const { language, t } = useLanguage();
    const books = translations[language].books;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('bookRecommendationsTitle')}>
            <div className="text-center mb-6">
                <p className="text-light-text/80 dark:text-dark-text/80">{t('bookRecommendationsSubtitle')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {books.map((book, index) => (
                    <BookCard key={index} book={book} index={index} />
                ))}
            </div>
        </Modal>
    );
};

export default BookRecommendationsModal;