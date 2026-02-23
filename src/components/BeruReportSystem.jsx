// 🐍 SYSTÈME RAPPORT CAROUSEL KAISEL - MOBILE GENIUS
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 📜 COMPOSANT PAPYRUS DORÉ
const GoldenPapyrusIcon = ({ onClick, isVisible }) => {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.5
            }}
            onClick={onClick}
            className="fixed bottom-6 right-6 z-[9999] cursor-pointer"
        >
            <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
            >
                {/* Effet de lueur dorée */}
                <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
                
                {/* Papyrus doré - CHEF-D'ŒUVRE BÉRU */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <img loading="lazy" 
                        src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750507370/papyrusBeru_slxiki.png"
                        alt="Papyrus Béru"
                        className="w-full h-full object-contain drop-shadow-2xl filter brightness-110"
                    />
                    
                    {/* Badge fermeture ou notification */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-red-600 cursor-pointer transition-colors"
                         onClick={(e) => {
                             e.stopPropagation();
                             // Si déjà vu, fermer définitivement
                             setIsVisible(false);
                         }}>
                        ✕
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// 📊 COMPOSANT RAPPORT PRINCIPAL
const BeruReportSystem = ({ 
    isOpen, 
    onClose, 
    currentReport, 
    reportHistory = [],
    onSaveReport 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const carouselRef = useRef(null);

    // 📚 Tous les rapports (actuel + historique)
    const allReports = [currentReport, ...reportHistory].filter(Boolean);

    // 📱 Détection mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 🎯 Navigation carousel
    const goToSlide = (index) => {
        setCurrentIndex(Math.max(0, Math.min(index, allReports.length - 1)));
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    // 📊 Couleur selon score
    const getScoreColor = (score) => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        if (score >= 40) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-red-700';
    };

    // 💾 Sauvegarder le rapport actuel
    const handleSaveReport = () => {
        if (currentReport && onSaveReport) {
            onSaveReport(currentReport);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-6xl h-[80vh] bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl shadow-2xl border border-slate-600/50 overflow-hidden"
                >
                    {/* Header avec fermeture */}
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Titre dynamique */}
                    <div className="absolute top-6 left-6 z-50">
                        <h2 className="text-2xl font-bold text-white">
                            📊 Rapport Béru #{allReports.length > 0 ? currentIndex + 1 : 1}
                        </h2>
                        <p className="text-slate-300 text-sm">
                            {allReports.length > 1 ? `${currentIndex + 1} sur ${allReports.length}` : 'Rapport unique'}
                        </p>
                    </div>

                    {/* Carousel Container */}
                    <div className="h-full pt-20 pb-6">
                        {allReports.length > 0 ? (
                            <div className="relative h-full">
                                {/* Navigation arrows (desktop) */}
                                {!isMobile && allReports.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevSlide}
                                            disabled={currentIndex === 0}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            disabled={currentIndex === allReports.length - 1}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
                                        >
                                            →
                                        </button>
                                    </>
                                )}

                                {/* Carousel de rapports */}
                                <motion.div
                                    ref={carouselRef}
                                    className="flex h-full transition-transform duration-300 ease-out"
                                    style={{
                                        transform: `translateX(-${currentIndex * 100}%)`
                                    }}
                                    drag={isMobile ? "x" : false}
                                    dragConstraints={{ left: -((allReports.length - 1) * 100), right: 0 }}
                                    dragElastic={0.1}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={(e, info) => {
                                        setIsDragging(false);
                                        const threshold = 50;
                                        if (info.offset.x > threshold && currentIndex > 0) {
                                            prevSlide();
                                        } else if (info.offset.x < -threshold && currentIndex < allReports.length - 1) {
                                            nextSlide();
                                        }
                                    }}
                                >
                                    {allReports.map((report, index) => (
                                        <div
                                            key={index}
                                            className="w-full flex-shrink-0 px-6"
                                        >
                                            <ReportCard 
                                                report={report} 
                                                isActive={index === currentIndex}
                                                scoreColor={getScoreColor(report.globalScore)}
                                            />
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Indicateurs */}
                                {allReports.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {allReports.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => goToSlide(index)}
                                                className={`w-3 h-3 rounded-full transition-all ${
                                                    index === currentIndex 
                                                        ? 'bg-yellow-400 scale-125' 
                                                        : 'bg-white/30 hover:bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                <p className="text-xl">Aucun rapport disponible</p>
                            </div>
                        )}
                    </div>

                    {/* Actions footer */}
                    <div className="absolute bottom-16 right-6 flex gap-3">
                        <button
                            onClick={handleSaveReport}
                            className="px-4 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg transition-colors"
                        >
                            💾 Sauvegarder
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// 📊 CARTE DE RAPPORT INDIVIDUELLE
const ReportCard = ({ report, isActive, scoreColor }) => {
    if (!report) return null;

    return (
        <div className="h-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 overflow-y-auto border border-slate-600/30">
            {/* Header du rapport */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                        {report.hunterName} - Analyse Complète
                    </h3>
                    <div className={`px-4 py-2 bg-gradient-to-r ${scoreColor} text-white rounded-full font-bold`}>
                        {report.globalScore}/100
                    </div>
                </div>
                <p className="text-slate-300 text-sm">
                    📅 {report.timestamp} • 🎯 {report.artifactCount}/8 artefacts
                </p>
            </div>

            {/* Contenu du rapport */}
            <div className="space-y-6">
                {/* Section Sets */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-3">🎯 Analyse des Sets</h4>
                    <div className="text-slate-200">
                        <p><strong>Set principal:</strong> {report.setAnalysis.dominantSet}</p>
                        <p><strong>Cohérence:</strong> {report.setAnalysis.optimalSetCount}/8 pièces optimales</p>
                    </div>
                </div>

                {/* Section Artefacts problématiques */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-red-400 mb-3">⚠️ Artefacts à améliorer</h4>
                    <div className="space-y-2">
                        {report.weakArtifacts.map((artifact, index) => (
                            <div key={index} className="bg-red-900/20 rounded p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-white">{artifact.slot}</span>
                                    <span className="text-red-400 font-bold">{artifact.score}/100</span>
                                </div>
                                <div className="text-sm text-slate-300">
                                    {artifact.issues.join(' • ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Priorité critique */}
                {report.criticalPriority && (
                    <div className="bg-slate-800/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-orange-400 mb-3">
                            {report.criticalPriority.missingCount > 0 ? '🚨 PRIORITÉ ABSOLUE - ARTEFACTS MANQUANTS' : '🚨 Priorité Absolue'}
                        </h4>
                        <div className="bg-orange-900/20 rounded p-3">
                            {report.criticalPriority.missingCount > 0 ? (
                                <>
                                    <p className="font-semibold text-white text-lg">
                                        {report.criticalPriority.missingCount} ARTEFACTS MANQUANTS
                                    </p>
                                    <p className="text-orange-400 mb-2">
                                        Slots vides : {report.criticalPriority.missingSlots?.join(', ')}
                                    </p>
                                    <div className="text-sm text-slate-300 mt-2 bg-red-900/30 p-2 rounded">
                                        <strong>⚠️ BÉRU RECOMMANDE :</strong><br/>
                                        Équipe ces {report.criticalPriority.missingCount} slots AVANT toute optimisation !<br/>
                                        Un Hunter incomplet ne peut pas révéler son potentiel !
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-white">{report.criticalPriority.slot}</p>
                                    <p className="text-orange-400">Score: {report.criticalPriority.score}/100</p>
                                    <div className="text-sm text-slate-300 mt-2">
                                        {report.criticalPriority.issues?.join(' • ')}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Section Substats */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-blue-400 mb-3">📊 Analyse Substats</h4>
                    <div className="space-y-3">
                        {report.substatAnalysis.criticalMissing.length > 0 && (
                            <div>
                                <p className="text-red-400 font-semibold">❌ Substats manquantes:</p>
                                <p className="text-slate-300">{report.substatAnalysis.criticalMissing.join(', ')}</p>
                            </div>
                        )}
                        {report.substatAnalysis.wastedStats.length > 0 && (
                            <div>
                                <p className="text-yellow-400 font-semibold">⚠️ Substat non-optimal:</p>
                                <p className="text-slate-300">{report.substatAnalysis.wastedStats.join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan d'action */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">🎯 Plan d'Action Béru</h4>
                    <div className="text-slate-200 whitespace-pre-line">
                        {report.actionPlan}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { BeruReportSystem, GoldenPapyrusIcon };