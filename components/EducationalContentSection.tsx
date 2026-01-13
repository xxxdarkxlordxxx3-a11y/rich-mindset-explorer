
import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../localization/translations';
import { LearnIcon, PlayIcon, LoadingIcon, GlobeIcon } from './IconComponents';
import ConceptCard from './ConceptCard';
import FinancialNewsSection from './FinancialNewsSection';
import type { UserContext, VideoData } from '../types';
import Modal from './Modal';

const motion = framerMotion as any;

interface EducationalContentSectionProps {
    userContext: UserContext;
}

const EducationalContentSection: React.FC<EducationalContentSectionProps> = ({ userContext }) => {
    const { language, t } = useLanguage();
    const concepts = translations[language].concepts;
    const videos = translations[language].videos;
    const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
    const [isIframeLoading, setIframeLoading] = useState(true);

    const handleSelectVideo = (video: VideoData) => {
        setIframeLoading(true);
        setSelectedVideo(video);
    };

    return (
        <>
            <section id="education" className="py-20 px-4">
                 <div className="container mx-auto">
                    {/* Core Concepts Section */}
                    <div className="text-center mb-12">
                         <div className="flex justify-center items-center gap-4 mb-4 text-light-text dark:text-dark-text">
                            <LearnIcon className="h-8 w-8 text-yellow-500" />
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">{t('coreConcepts')}</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {concepts.map((concept, index) => {
                            const IconComponent = concept.icon;
                            return (
                                <ConceptCard
                                    key={index}
                                    index={index}
                                    icon={<IconComponent />}
                                    title={concept.title}
                                    poorMindset={concept.poorMindset}
                                    richMindset={concept.richMindset}
                                />
                            );
                        })}
                    </div>

                    {/* Financial News Section */}
                    <FinancialNewsSection userContext={userContext} />

                    {/* Curated Content (Videos) Section */}
                    <div className="max-w-5xl mx-auto mt-24">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {videos.map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    onClick={() => handleSelectVideo(video)}
                                    className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-cyan-500/30 hover:scale-105"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: 0.05 * index }}
                                >
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayIcon className="w-16 h-16 text-white/80 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                 </div>
            </section>
            
            {/* Modal for Video Player */}
            <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} bodyClassName="p-0 bg-black flex flex-col justify-center items-center h-full relative">
                {selectedVideo && (
                    <>
                        <div className="aspect-video w-full relative bg-black max-h-[80vh]">
                            <AnimatePresence>
                                {isIframeLoading && (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center bg-black z-10"
                                    >
                                        <LoadingIcon />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <iframe
                                key={selectedVideo.id}
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                onLoad={() => setIframeLoading(false)}
                            ></iframe>
                        </div>
                        <div className="w-full p-4 bg-zinc-900 flex justify-center">
                            <a 
                                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                            >
                                <GlobeIcon className="w-5 h-5" />
                                {language === 'ar' ? 'شاهد على يوتيوب' : 'Watch on YouTube'}
                            </a>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
};

export default EducationalContentSection;
