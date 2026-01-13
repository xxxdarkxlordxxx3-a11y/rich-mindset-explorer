import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import GeneratedContent from './GeneratedContent';
import type { GeneratedContent as GeneratedContentType } from '../types';


interface FeatureIdeasProps {
    ideas: string[];
    onDone: () => void;
}

const FeatureIdeas: React.FC<FeatureIdeasProps> = ({ ideas, onDone }) => {
    const {t} = useLanguage();

    const content: GeneratedContentType = {
        title: t('featureIdeasTitle'),
        explanation: t('featureIdeasExplanation'),
        keyPoints: ideas,
    }

    return (
         <GeneratedContent content={content} onDone={onDone} />
    )
}

export default FeatureIdeas;