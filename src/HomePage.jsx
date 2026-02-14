import React, { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import HomeDashboard from './components/HomeDashboard';

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

  const slaItems = [
    {
      label: t('home.menu.build'),
      path: "/build",
      img: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771071790/LogoBuild128_pf9wkk.png",
      glowColor: "rgba(168, 85, 247, 0.5)",
      beruMessage: "Un build en preparation ? Montre-moi ca, chasseur !",
      alt: "Build your Hunter SLA",
    },
    {
      label: "Theorycraft",
      path: "/theorycraft",
      img: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771074452/LogoTheyroycraft128_maeizs.png",
      glowColor: "rgba(59, 130, 246, 0.5)",
      isNew: true,
      beruMessage: "Du theorycraft ? L'Ombre calcule deja les synergies...",
      alt: "Team Synergy Calculator - Crit Rate, Crit DMG, Def Pen",
    },
  ];

  const fanartItems = [
    {
      label: t('home.menu.drawBeru'),
      path: "/drawberu",
      img: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771073331/LogoDrawBERU128-removebg-preview_rhst5w.png",
      glowColor: "rgba(236, 72, 153, 0.5)",
      isNew: true,
      beruMessage: "Tu vas me dessiner ? Fais-moi beau cette fois !",
      alt: "DrawBeru - Coloring and Drawing System",
    },
    {
      label: "LoreStory",
      path: "/lorestory",
      img: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771076750/LogoLoreStory128_mqxibm.png",
      glowColor: "rgba(139, 92, 246, 0.5)",
      isNew: true,
      beruMessage: "Des histoires ? Installe-toi... le Soldat N1 raconte.",
      alt: "LoreStory - Shadow Army Chronicles",
    },
    {
      label: "Shadow Colosseum",
      path: "/shadow-colosseum",
      img: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771080428/LogoColossum128-removebg-preview_jrzpts.png",
      glowColor: "rgba(239, 68, 68, 0.5)",
      isNew: true,
      beruMessage: "Le Colisee des Ombres t'attend... Tes chibis sont prets ?",
      alt: "Shadow Colosseum - Chibi Battle RPG",
    },
  ];

  // Beru hover reaction cooldown
  const beruHoverCooldown = useRef(0);
  const handleNavHover = useCallback((item) => {
    const now = Date.now();
    if (now - beruHoverCooldown.current < 8000) return;
    beruHoverCooldown.current = now;
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: item.beruMessage, mood: 'thinking', duration: 4000 }
    }));
  }, []);

  const langFlags = [
    { src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/Francia_sboce9.png", alt: "Fran\u00e7ais Solo Leveling Arise", lang: 'fr' },
    { src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/BritishAirLine_s681io.png", alt: "English SOLO LEVELING ARISE", lang: 'en' },
    { src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754778825/ko_flag_zdbhiz.png", alt: "\uD55C\uAD6D\uC5B4", lang: 'ko' },
    { src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754814859/jap_flag_bet2ob.png", alt: "\u65E5\u672C\u8A9E", lang: 'ja' },
    { src: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754814970/zh_flag_r9l06y.png", alt: "\u4E2D\u6587", lang: 'zh' },
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
    <div
      className="min-h-screen bg-[#0f0f1a] text-white flex flex-col items-center py-6 md:py-12 px-3 md:px-4 relative"
      style={{ backgroundImage: 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771068462/backgroundVD_ywvghj.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}
    >
      <div className="absolute inset-0 bg-[#0f0f1a]/75 pointer-events-none" />

      {/* Language Selector */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex gap-1.5 items-center bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          {langFlags.map(flag => (
            <img
              key={flag.lang}
              src={flag.src}
              alt={flag.alt}
              onClick={() => i18n.changeLanguage(flag.lang)}
              className={`w-6 h-4 cursor-pointer hover:scale-110 transition-all duration-200 rounded
                ${currentLang === flag.lang ? 'ring-1 ring-yellow-400 scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`}
            />
          ))}
        </div>
      </div>

      {/* Header SEO */}
      <header className="text-center mb-3 md:mb-8 relative z-10 max-w-2xl">
        <h1 className="text-base md:text-4xl font-extrabold text-purple-400 drop-shadow-md">
          {currentSEODisplay.h1}
        </h1>
        <h2 className="text-[11px] md:text-xl text-gray-300 mt-1 font-semibold">
          {currentSEODisplay.h2}
        </h2>
        <h3 className="text-[9px] md:text-lg text-purple-300/70 mt-0.5 font-medium">
          {currentSEODisplay.h3}
        </h3>
      </header>

      {/* Navigation */}
      <nav className="w-full max-w-2xl mx-auto relative z-10 mb-6 md:mb-10 px-2" aria-label="Main Navigation">
        <style>{`
          @keyframes navFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes navShine {
            0% { left: -60%; }
            100% { left: 160%; }
          }
          @keyframes navGlowPulse {
            0%, 100% { opacity: 0.15; transform: scale(0.85); }
            50% { opacity: 0.3; transform: scale(0.95); }
          }
          .nav-link:hover .nav-shine-bar {
            animation: navShine 0.7s ease-out;
          }
          .nav-link:hover .nav-logo {
            transform: scale(1.18);
            filter: brightness(1.25) drop-shadow(0 0 20px var(--glow-color));
          }
          .nav-link:hover .nav-glow {
            opacity: 0.6 !important;
            transform: scale(1.3) !important;
          }
          .nav-link:hover .nav-badge {
            animation: navFloat 0.6s ease-in-out infinite;
          }
        `}</style>

        {/* SLA Section */}
        <div className="text-center mb-5">
          <span className="text-[10px] md:text-xs font-bold text-purple-400/80 uppercase tracking-widest">Solo Leveling: Arise</span>
        </div>
        <div className="flex justify-center items-center gap-10 md:gap-20 mb-10">
          {slaItems.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link group relative flex flex-col items-center"
              aria-label={item.alt}
              onMouseEnter={() => handleNavHover(item)}
            >
              <div
                className="relative"
                style={{ animation: `navFloat 4s ease-in-out infinite`, animationDelay: `${-i * 1.5}s` }}
              >
                {/* Ambient glow pulse */}
                <div
                  className="nav-glow absolute inset-[-30%] rounded-full blur-3xl transition-all duration-700 pointer-events-none"
                  style={{
                    backgroundColor: item.glowColor,
                    animation: 'navGlowPulse 4s ease-in-out infinite',
                    animationDelay: `${-i * 2}s`,
                  }}
                />

                {/* Shine sweep on hover */}
                <div className="absolute inset-0 overflow-hidden rounded-full z-20 pointer-events-none">
                  <div
                    className="nav-shine-bar absolute top-0 h-full pointer-events-none"
                    style={{
                      width: '40%',
                      left: '-60%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                    }}
                  />
                </div>

                {/* Logo */}
                <img
                  src={item.img}
                  alt={item.label}
                  className="nav-logo w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 transition-all duration-500 ease-out"
                  style={{ '--glow-color': item.glowColor, filter: `drop-shadow(0 4px 12px ${item.glowColor})` }}
                  draggable={false}
                />
              </div>

              {item.isNew && (
                <span className="nav-badge absolute -top-1 -right-2 z-30 px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold bg-green-500 text-white shadow-md shadow-green-500/50">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* FanArts Section */}
        <div className="text-center mb-5">
          <span className="text-[10px] md:text-xs font-bold text-pink-400/80 uppercase tracking-widest">FanArts</span>
        </div>
        <div className="flex justify-center items-center gap-10 md:gap-20">
          {fanartItems.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link group relative flex flex-col items-center"
              aria-label={item.alt}
              onMouseEnter={() => handleNavHover(item)}
            >
              <div
                className="relative"
                style={{ animation: 'navFloat 4s ease-in-out infinite', animationDelay: `${-0.8 - i * 1.3}s` }}
              >
                <div
                  className="nav-glow absolute inset-[-30%] rounded-full blur-3xl transition-all duration-700 pointer-events-none"
                  style={{
                    backgroundColor: item.glowColor,
                    animation: 'navGlowPulse 4s ease-in-out infinite',
                    animationDelay: `${-1 - i * 1.5}s`,
                  }}
                />
                <div className="absolute inset-0 overflow-hidden rounded-full z-20 pointer-events-none">
                  <div
                    className="nav-shine-bar absolute top-0 h-full pointer-events-none"
                    style={{
                      width: '40%',
                      left: '-60%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                    }}
                  />
                </div>
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.label}
                    className="nav-logo w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 transition-all duration-500 ease-out"
                    style={{ '--glow-color': item.glowColor, filter: `drop-shadow(0 4px 12px ${item.glowColor})` }}
                    draggable={false}
                  />
                ) : (
                  <div className="nav-logo relative z-10 flex flex-col items-center justify-center w-24 h-24 md:w-32 md:h-32 transition-all duration-500 ease-out">
                    <span className="text-5xl md:text-6xl" style={{ filter: `drop-shadow(0 4px 12px ${item.glowColor})` }}>{item.icon}</span>
                    <span className="text-[10px] md:text-xs font-bold text-white/90 mt-1">{item.label}</span>
                  </div>
                )}
              </div>
              {item.isNew && (
                <span className="nav-badge absolute -top-1 -right-2 z-30 px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold bg-green-500 text-white shadow-md shadow-green-500/50">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Dashboard Vivant */}
      <HomeDashboard />

      {/* Footer */}
      <footer className="mt-auto pt-4 md:pt-8 text-center max-w-md relative z-10">
        <p className="text-[10px] md:text-xs text-gray-500 italic mb-1.5">
          {t('home.footer.disclaimer')}
        </p>
        <p className="text-[9px] md:text-[11px] text-gray-600 mb-1.5">
          This is a fan-made website for Solo Leveling: Arise. Not affiliated with Netmarble.
        </p>
        <p className="text-[10px] md:text-xs text-gray-500">
          {t('home.footer.community')}{" "}
          <a
            href="https://discord.gg/m8RCuDz5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            aria-label="Join BuilderBeru Discord Community"
          >
            Discord
          </a>.
        </p>
      </footer>
    </div>
  );
}