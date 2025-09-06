import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t, i18n } = useTranslation();

  // 🎯 SEO DYNAMIQUE AMÉLIORÉ
  useEffect(() => {
    const currentLang = i18n.language || 'fr';
    
    // 📝 TITLES ET DESCRIPTIONS PAR LANGUE - OPTIMISÉS SEO
    const seoData = {
      fr: {
        title: "Solo Leveling Arise Calculator - BuilderBeru Gratuit",
        description: "Calculateur Solo Leveling Arise gratuit - Optimiseur builds Jinah, Lennart, Emma, Cha Hae-In. DPS Calculator, OCR, artefacts. 5 langues disponibles.",
        h1: "Solo Leveling Arise Calculator",
        h2: "Optimiseur de Builds Gratuit pour Tous les Hunters"
      },
      en: {
        title: "Solo Leveling Arise Calculator - Free BuilderBeru",
        description: "Free Solo Leveling Arise build calculator - Optimize Jinah, Lennart, Emma builds. DPS calculator, OCR scanner, artifact analyzer. 5 languages supported.",
        h1: "Solo Leveling Arise Calculator",
        h2: "Free Build Optimizer for All Hunters"
      },
      ko: {
        title: "솔로 레벨링 어라이즈 계산기 - BuilderBeru 무료",
        description: "무료 솔로 레벨링 어라이즈 빌드 계산기 - 진아, 레나르트, 엠마 빌드 최적화. DPS 계산기, OCR 스캐너, 아티팩트 분석. 한국어 지원.",
        h1: "솔로 레벨링 어라이즈 계산기",
        h2: "모든 헌터를 위한 무료 빌드 최적화"
      },
      ja: {
        title: "俺だけレベルアップ計算機 - BuilderBeru無料",
        description: "無料俺だけレベルアップビルド計算機 - ジナ、レナート、エマのビルド最適化。DPS計算機、OCRスキャナー、アーティファクト解析。日本語対応。",
        h1: "俺だけレベルアップ計算機",
        h2: "全ハンター対応無料ビルド最適化ツール"
      },
      zh: {
        title: "我独自升级计算器 - BuilderBeru免费",
        description: "免费我独自升级构建计算器 - 振娜、伦纳特、艾玛构建优化。DPS计算器、OCR扫描、神器分析。中文支持。",
        h1: "我独自升级计算器",
        h2: "全猎人免费构建优化工具"
      }
    };

    const currentSEO = seoData[currentLang] || seoData.fr;

    // 🎯 UPDATE TITLE
    document.title = currentSEO.title;

    // 🎯 UPDATE META DESCRIPTION
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = currentSEO.description;
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = currentSEO.description;
      document.head.appendChild(metaDescription);
    }

    // 🎯 UPDATE OG TAGS
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = currentSEO.title;

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = currentSEO.description;

    // 🎯 UPDATE TWITTER TAGS
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = currentSEO.title;

    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.content = currentSEO.description;

    // 🎯 SCHEMA MARKUP JSON-LD
    const addSchemaMarkup = () => {
      // Supprime ancien schema s'il existe
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }

      // Ajoute nouveau schema
      const schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "BuilderBeru",
        "description": currentSEO.description,
        "url": "https://builderberu.com",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127"
        },
        "inLanguage": ["fr", "en", "ko", "ja", "zh"],
        "about": {
          "@type": "VideoGame",
          "name": "Solo Leveling: Arise"
        }
      };

      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    };

    addSchemaMarkup();

  }, [i18n.language]);

  const activeItems = [
    { label: t('home.menu.build'), path: "/build" },
    { label: t('home.menu.training'), path: "/trainingCenter", special: true, new: true },
    { label: t('home.menu.dpsCalculator'), path: "/damage-calculator", special: true, new: true },
    { label: t('home.menu.bdg'), path: "bdg" },
    { label: t('home.menu.pod'), path: "/pod" },
    { label: t('home.menu.hallOfFlame'), path: "/hall-of-flame", special: true },
    // { label: t('home.menu.guideEditor'), path: "/guide-editor" },
  ];

  const inactiveItems = [
    // { label: t('home.menu.bot'), disabled: true },
    
  ];

  // 🎯 SEO DATA POUR AFFICHAGE DYNAMIQUE
  const currentLang = i18n.language || 'fr';
  const seoDisplayData = {
    fr: {
      h1: "Solo Leveling Arise Calculator",
      h2: "Optimiseur de Builds Gratuit pour Tous les Hunters",
      h3: "Jinah, Lennart, Emma Laurent, Cha Hae-In et Plus"
    },
    en: {
      h1: "Solo Leveling Arise Calculator", 
      h2: "Free Build Optimizer for All Hunters",
      h3: "Jinah, Lennart, Emma Laurent, Cha Hae-In & More"
    },
    ko: {
      h1: "솔로 레벨링 어라이즈 계산기",
      h2: "모든 헌터를 위한 무료 빌드 최적화",
      h3: "진아, 레나르트, 엠마 로랑, 차혜인 등"
    },
    ja: {
      h1: "俺だけレベルアップ計算機",
      h2: "全ハンター対応無料ビルド最適化ツール", 
      h3: "ジナ、レナート、エマ・ローラン、車海仁など"
    },
    zh: {
      h1: "我独自升级计算器",
      h2: "全猎人免费构建优化工具",
      h3: "振娜、伦纳特、艾玛·洛朗、车惠仁等"
    }
  };

  const currentSEODisplay = seoDisplayData[currentLang] || seoDisplayData.fr;

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col items-center justify-center py-4 md:py-10 px-4">
      {/* 🌐 LANGUAGE SELECTOR */}
      <div className="absolute top-4 right-4">
        <div className="flex gap-2 items-center">
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/Francia_sboce9.png"
            alt="Français"
            onClick={() => i18n.changeLanguage('fr')}
            className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
          />
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/BritishAirLine_s681io.png"
            alt="English"
            onClick={() => i18n.changeLanguage('en')}
            className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
          />
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754778825/ko_flag_zdbhiz.png"
            alt="한국어"
            onClick={() => i18n.changeLanguage('ko')}
            className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
          />
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754814859/jap_flag_bet2ob.png"
            alt="日本語"
            onClick={() => i18n.changeLanguage('ja')}
            className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
          />
          <img
            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754814970/zh_flag_r9l06y.png"
            alt="中文"
            onClick={() => i18n.changeLanguage('zh')}
            className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 105, 180, 0.5);
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 105, 180, 0.8), 0 0 60px rgba(255, 105, 180, 0.4);
          }
        }

        .character-announcement {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          padding: 10px;
          border-radius: 12px;
          margin: 8px 0;
          max-width: 280px;
        }

        .new-character-text {
          text-shadow: 
            0 0 10px rgba(255, 105, 180, 0.8),
            0 0 20px rgba(255, 105, 180, 0.6),
            0 0 30px rgba(255, 105, 180, 0.4);
          animation: float 3s ease-in-out infinite;
        }

        .theorycraft-text {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .theorycraft-text::after {
          content: '...';
          position: absolute;
          animation: dots 1.5s infinite;
        }

        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }

        .character-image {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        /* 🐜 ANIMATIONS CHIBI WORLD */
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes float-up {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
            transform: scale(1);
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(100px) scale(0);
            opacity: 0;
          }
        }

        .animate-float-up {
          animation: float-up linear infinite;
        }

        /* 📱 MOBILE SPECIFIC OPTIMIZATIONS */
        @media (max-width: 768px) {
          .mobile-title-container {
            max-height: 16vh !important;
            overflow: hidden;
            padding: 4px 8px;
          }
          
          .mobile-title-h1 {
            font-size: 14px !important;
            line-height: 1.2 !important;
            margin-bottom: 3px !important;
            text-align: center;
          }
          
          .mobile-title-h2 {
            font-size: 10px !important;
            line-height: 1.2 !important;
            margin-bottom: 2px !important;
            text-align: center;
          }
          
          .mobile-title-h3 {
            font-size: 8px !important;
            line-height: 1.2 !important;
            text-align: center;
          }
          
          .mobile-nav-button {
            min-height: 45px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            box-shadow: 0 2px 8px rgba(168, 85, 247, 0.2) !important;
            transition: all 0.2s ease !important;
          }
          
          .mobile-nav-button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3) !important;
          }
          
          .mobile-nav-disabled {
            min-height: 45px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            opacity: 0.4 !important;
          }

          /* Mobile Chibi World */
          .chibi-world-section {
            margin-top: 20px !important;
            padding: 0 10px !important;
          }

          .chibi-world-card {
            padding: 20px !important;
          }

          .chibi-sprites {
            gap: 8px !important;
          }

          .chibi-sprite-bubble {
            width: 40px !important;
            height: 40px !important;
          }

          .chibi-world-title {
            font-size: 24px !important;
          }

          .chibi-world-description {
            font-size: 14px !important;
          }

          .chibi-features {
            gap: 16px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* 🎯 HEADER RECENTRÉ ET AGRANDI MOBILE - MAXIMAL 16% DE L'ÉCRAN */}
      <header className="text-center mb-2 md:mb-10 mobile-title-container">
        <h1 className="mobile-title-h1 md:text-4xl font-extrabold text-purple-400 drop-shadow-md">
          {currentSEODisplay.h1}
        </h1>
        <h2 className="mobile-title-h2 md:text-xl text-gray-300 md:mb-2 font-semibold">
          {currentSEODisplay.h2}
        </h2>
        <h3 className="mobile-title-h3 md:text-lg text-purple-300 font-medium">
          {currentSEODisplay.h3}
        </h3>
      </header>

      {/* 🎮 LAYOUT ADAPTATIF DESKTOP/MOBILE */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
        
        {/* 📱 VERSION MOBILE - ULTRA COMPACT */}
        <div className="block md:hidden flex-1 flex flex-col">
          <section className="character-announcement mx-auto flex-shrink-0" aria-label="New Character Announcement">
            <img
              src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869120/JinhoJinah_ln6p3n.png"
              alt={t('home.announcement.imageAlt')}
              className="character-image w-full rounded-lg hover:scale-105 transition-all duration-300"
              loading="lazy"
            />

            <div className="mt-1 text-center">
              <p className="text-[9px] font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {t('home.announcement.buildNew')}
              </p>
              <p className="new-character-text text-[11px] font-extrabold mt-1 text-white">
                {t('home.announcement.buildJinah')}
              </p>
              <p className="theorycraft-text text-[9px] mt-1 font-medium">
                {t('home.announcement.dpsInfo')}
              </p>
            </div>
          </section>

          <nav className="grid grid-cols-2 gap-3 max-w-sm w-full mx-auto mt-3 flex-1" aria-label="Main Navigation">
            {activeItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="mobile-nav-button border border-purple-600 bg-[#1c1c2a] text-center text-white
                  hover:bg-purple-700 flex items-center justify-center"
                aria-label={`Go to ${item.label}`}
              >
                {item.label}
              </Link>
            ))}

            {inactiveItems.map((item) => (
              <div
                key={item.label}
                className="mobile-nav-disabled border border-gray-700 bg-[#1a1a1a] text-center text-gray-500
                  cursor-not-allowed flex items-center justify-center"
                aria-label={`${item.label} - Coming Soon`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* 💻 VERSION DESKTOP */}
        <div className="hidden md:block">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
            
            <div className="md:order-1">
              <h4 className="text-xl font-bold text-purple-300 mb-6 text-center">
              </h4>
              <nav className="grid gap-4" aria-label="Main Navigation">
                {activeItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="border border-purple-600 bg-[#1c1c2a] rounded-xl p-4 text-center text-lg font-bold text-white
                      transition duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_#a855f7] hover:bg-purple-700
                      flex items-center justify-center min-h-[60px]"
                    aria-label={`Go to ${item.label}`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {inactiveItems.map((item) => (
                  <div
                    key={item.label}
                    className="border border-gray-700 bg-[#1a1a1a] rounded-xl p-4 text-center text-lg font-bold text-gray-500
                      opacity-50 cursor-not-allowed flex items-center justify-center min-h-[60px]"
                    aria-label={`${item.label} - Coming Soon`}
                  >
                    {item.label}
                  </div>
                ))}
              </nav>
            </div>

            <div className="md:order-2">
              <section className="character-announcement mx-auto max-w-sm" aria-label="New Character Announcement">
                <img
                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869120/JinhoJinah_ln6p3n.png"
                  alt={t('home.announcement.imageAlt')}
                  className="character-image w-full rounded-lg hover:scale-105 transition-all duration-300"
                  loading="lazy"
                />

                <div className="mt-4 text-center">
                  <p className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    {t('home.announcement.buildNew')}
                  </p>
                  <p className="new-character-text text-xl font-extrabold mt-2 text-white">
                    {t('home.announcement.buildJinah')}
                  </p>
                  <p className="theorycraft-text text-sm mt-3 font-medium">
                    {t('home.announcement.dpsInfo')}
                  </p>
                </div>
              </section>
            </div>

          </div>
        </div>

        {/* 🌟 SECTION CHIBI WORLD - NOUVEAU ! */}
        <div className="chibi-world-section mt-12 px-4 w-full max-w-4xl mx-auto">
          <Link to="/chibi-world">
            <div className="chibi-world-card relative overflow-hidden rounded-2xl 
                            bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40
                            border-2 border-purple-500/50 hover:border-purple-400 
                            transition-all duration-500 hover:scale-[1.02] group
                            backdrop-blur-sm">
              
              {/* Background image avec effet parallax */}
              <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-700">
                <img 
                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755091230/BuilderBeru_enclos_wgtjm5.jpg"
                  alt="Chibi World Map"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
              </div>
              
              {/* Contenu principal */}
              <div className="relative p-8 text-center z-10">
                {/* Sprites animés */}
                <div className="chibi-sprites flex justify-center mb-6 gap-4">
                  <div className="animate-bounce" style={{animationDelay: '0s'}}>
                    <div className="chibi-sprite-bubble w-16 h-16 bg-purple-500/20 rounded-full p-2 backdrop-blur-sm
                                    border border-purple-400/50 shadow-lg shadow-purple-500/30">
                      <span className="text-3xl">🐜</span>
                    </div>
                  </div>
                  <div className="animate-bounce" style={{animationDelay: '0.2s'}}>
                    <div className="chibi-sprite-bubble w-16 h-16 bg-green-500/20 rounded-full p-2 backdrop-blur-sm
                                    border border-green-400/50 shadow-lg shadow-green-500/30">
                      <span className="text-3xl">🛡️</span>
                    </div>
                  </div>
                  <div className="animate-bounce" style={{animationDelay: '0.4s'}}>
                    <div className="chibi-sprite-bubble w-16 h-16 bg-blue-500/20 rounded-full p-2 backdrop-blur-sm
                                    border border-blue-400/50 shadow-lg shadow-blue-500/30">
                      <span className="text-3xl">⚔️</span>
                    </div>
                  </div>
                </div>
                
                {/* Titre épique */}
                <h2 className="chibi-world-title text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 
                               bg-clip-text text-transparent animate-gradient">
                  {t('home.chibiWorld.title', "L'Enclos des Ombres Éternelles")}
                </h2>
                
                {/* Badge NEW animé */}
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 
                                   text-white px-3 py-1 rounded-full animate-pulse shadow-lg">
                    NOUVEAU !
                  </span>
                  <span className="text-yellow-400 animate-pulse">✨</span>
                </div>
                
                {/* Description */}
                <p className="chibi-world-description text-lg text-purple-200/90 mb-6 max-w-2xl mx-auto">
                  {t('homeChibi.chibiWorld.description', 
                     "Collecte et élève tes chibis dans un monde vivant ! Connexion quotidienne, évolutions, batailles épiques !")}
                </p>
                
                {/* Features */}
                <div className="chibi-features flex justify-center gap-8 mb-6 flex-wrap">
                  <div className="flex items-center gap-2 text-purple-300">
                    <span className="text-2xl">🔥</span>
                    <span>{t('homeChibi.chibiWorld.streak', 'Streak quotidien')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300">
                    <span className="text-2xl">🎰</span>
                    <span>{t('homeChibi.chibiWorld.gacha', 'Système Gacha')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300">
                    <span className="text-2xl">📈</span>
                    <span>{t('homeChibi.chibiWorld.evolution', 'Évolutions')}</span>
                  </div>
                </div>
                
                {/* Bouton d'entrée */}
                <button className="relative px-8 py-3 font-bold text-white rounded-full
                                   bg-gradient-to-r from-purple-600 to-indigo-600
                                   hover:from-purple-700 hover:to-indigo-700
                                   transform transition-all duration-300 hover:scale-105
                                   shadow-xl hover:shadow-purple-500/50
                                   group/btn">
                  <span className="relative z-10">
                    {t('homeChibi.chibiWorld.enter', 'Entrer dans le Monde')}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-purple-400 opacity-0 
                                  group-hover/btn:opacity-30 blur transition-opacity duration-300" />
                </button>
              </div>
              
              {/* Particules flottantes */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-float-up"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 2}s`,
                      animationDuration: `${10 + Math.random() * 10}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 📄 FOOTER AVEC PROTECTION LÉGALE */}
      <footer className="mt-2 md:mt-12 text-sm text-gray-500 italic text-center max-w-sm flex-shrink-0">
        <p className="mb-2">
          {t('home.footer.disclaimer')}
        </p>
        <p className="text-xs text-gray-600 mb-2">
          🎮 This is a fan-made website for Solo Leveling: Arise. Not affiliated with Netmarble or any official entities.
        </p>
        <p>
          {t('home.footer.community')}{" "}
          <a
            href="https://discord.gg/m8RCuDz5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
            aria-label="Join BuilderBeru Discord Community"
          >
            Discord
          </a>
          .
        </p>
      </footer>
    </div>
  );
}