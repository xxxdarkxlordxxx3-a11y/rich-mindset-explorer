import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const motion = framerMotion as any;

export interface PortfolioItemData {
    titleKey: string;
    percentage: number;
    color: string;
    descKey?: string;
    defKey?: string;
}

interface InvestmentPortfolioProps {
    data: PortfolioItemData[];
    onBlockClick?: (item: PortfolioItemData) => void;
}

const PortfolioBlock: React.FC<{ item: PortfolioItemData; onBlockClick?: (item: PortfolioItemData) => void }> = ({ item, onBlockClick }) => {
    const { t } = useLanguage();
    return (
        <motion.div
            className={`relative flex items-center justify-center p-2 text-white font-bold text-lg cursor-pointer overflow-hidden w-full h-full ${item.color}`}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => onBlockClick?.(item)}
        >
            <div className="text-center">
                <p>{t(item.titleKey)}</p>
                <p className="text-sm opacity-80">{item.percentage}%</p>
            </div>
        </motion.div>
    );
};

const InvestmentPortfolio: React.FC<InvestmentPortfolioProps> = ({ data, onBlockClick }) => {
    const [needs, wants, savings] = data;
    const rightSideTotal = wants.percentage + savings.percentage;
    
    // Calculate the vertical flex-basis for wants and savings relative to their container
    const wantsBasis = rightSideTotal > 0 ? (wants.percentage / rightSideTotal) * 100 : 0;
    const savingsBasis = rightSideTotal > 0 ? (savings.percentage / rightSideTotal) * 100 : 0;

    return (
        <div 
            className="w-full max-w-sm h-72 sm:h-80 mx-auto bg-light-card/60 dark:bg-dark-card/60 rounded-2xl shadow-lg border border-light-border dark:border-dark-border"
        >
            <div className="flex w-full h-full rounded-2xl overflow-hidden">
                {/* Left side: Needs */}
                <div className="flex transition-all duration-500 ease-in-out" style={{ flexBasis: `${needs.percentage}%` }}>
                   <PortfolioBlock item={needs} onBlockClick={onBlockClick} />
                </div>
                {/* Right side: container for Wants and Savings */}
                <div className="flex flex-col transition-all duration-500 ease-in-out" style={{ flexBasis: `${rightSideTotal}%` }}>
                    {/* Wants */}
                    <div className="flex transition-all duration-500 ease-in-out" style={{ flexBasis: `${wantsBasis}%` }}>
                         <PortfolioBlock item={wants} onBlockClick={onBlockClick} />
                    </div>
                    {/* Savings */}
                    <div className="flex transition-all duration-500 ease-in-out" style={{ flexBasis: `${savingsBasis}%` }}>
                        <PortfolioBlock item={savings} onBlockClick={onBlockClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentPortfolio;