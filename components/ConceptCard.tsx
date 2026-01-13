import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const motion = framerMotion as any;

interface ConceptCardProps {
  icon: React.ReactNode;
  title: string;
  poorMindset: string;
  richMindset: string;
  index: number;
}

const cardVariants = {
  hidden: (i: number) => {
    const isMobile = window.innerWidth < 768;
    const isRTL = document.documentElement.dir === 'rtl';

    let x = 0;
    if (!isMobile) {
      if(isRTL) {
        x = i % 2 === 0 ? 100 : -100;
      } else {
        x = i % 2 === 0 ? -100 : 100;
      }
    }
    
    return {
      opacity: 0,
      y: isMobile ? 50 : 0,
      x: x,
    };
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const ConceptCard: React.FC<ConceptCardProps> = ({ icon, title, poorMindset, richMindset, index }) => {
  const { t } = useLanguage();
  const missionNumber = (index + 1).toString().padStart(2, '0');

  return (
    <motion.div
      className="w-full bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-xl border border-light-border/50 dark:border-dark-border/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      custom={index}
      whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(37, 99, 235, 0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
        <div className="absolute -top-10 ltr:-left-10 rtl:-right-10 text-8xl font-black text-light-secondary dark:text-dark-secondary opacity-50 z-0 select-none">
            {missionNumber}
        </div>
        <div className="relative z-10">
            <div className="flex items-center mb-6 rtl:flex-row-reverse">
                <div className="bg-light-secondary dark:bg-dark-secondary border border-light-border dark:border-dark-border p-3 rounded-lg ltr:mr-4 rtl:ml-4">{icon}</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 rtl:text-right">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 text-lg">{t('poorMindset')}</h4>
                <p className="text-light-text/90 dark:text-dark-text/90 ">{poorMindset}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/5 dark:bg-green-500/10 border border-green-500/10 dark:border-green-500/20 rtl:text-right">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-lg">{t('richMindset')}</h4>
                <p className="text-light-text/90 dark:text-dark-text/90 ">{richMindset}</p>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default ConceptCard;