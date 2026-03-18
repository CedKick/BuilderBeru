import React, { useEffect, useRef, useCallback } from "react";
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

  const slaItems = [
    {
      label: t('home.menu.build'),
      path: "/build",
      img: "https://api.builderberu.com/cdn/images/LogoBuild128_pf9wkk.webp",
      glowColor: "rgba(168, 85, 247, 0.5)",
      beruMessage: "Un build en preparation ? Montre-moi ca, chasseur !",
      alt: "Build your Hunter SLA",
    },
    {
      label: "Theorycraft",
      path: "/theorycraft",
      img: "https://api.builderberu.com/cdn/images/LogoTheyroycraft128_maeizs.webp",
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
      img: "https://api.builderberu.com/cdn/images/LogoDrawBERU128-removebg-preview_rhst5w.webp",
      glowColor: "rgba(236, 72, 153, 0.5)",
      isNew: true,
      beruMessage: "Tu vas me dessiner ? Fais-moi beau cette fois !",
      alt: "DrawBeru - Coloring and Drawing System",
    },
    {
      label: "Shadow Colosseum",
      path: "/shadow-colosseum",
      img: "https://api.builderberu.com/cdn/images/LogoColossum128-removebg-preview_jrzpts.webp",
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
    { src: "https://api.builderberu.com/cdn/images/Francia_sboce9.webp", alt: "Fran\u00e7ais Solo Leveling Arise", lang: 'fr' },
    { src: "https://api.builderberu.com/cdn/images/BritishAirLine_s681io.webp", alt: "English SOLO LEVELING ARISE", lang: 'en' },
    { src: "https://api.builderberu.com/cdn/images/ko_flag_zdbhiz.webp", alt: "\uD55C\uAD6D\uC5B4", lang: 'ko' },
    { src: "https://api.builderberu.com/cdn/images/jap_flag_bet2ob.webp", alt: "\u65E5\u672C\u8A9E", lang: 'ja' },
    { src: "https://api.builderberu.com/cdn/images/zh_flag_r9l06y.webp", alt: "\u4E2D\u6587", lang: 'zh' },
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
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Language Selector */}
      <div className="fixed top-3 right-3 z-50">
        <div className="flex gap-1.5 items-center bg-[#1a1f2c]/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-purple-500/20">
          {langFlags.map(flag => (
            <img loading="lazy"
              key={flag.lang}
              src={flag.src}
              alt={flag.alt}
              onClick={() => i18n.changeLanguage(flag.lang)}
              className={`w-6 h-4 cursor-pointer hover:scale-110 transition-all duration-200 rounded
                ${currentLang === flag.lang ? 'ring-1 ring-purple-400 scale-110 opacity-100' : 'opacity-50 hover:opacity-100'}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-10 md:py-16">
        {/* Header SEO */}
        <header className="text-center mb-12 md:mb-16">
          <h1 className="text-2xl md:text-4xl font-extrabold text-purple-400 mb-2">
            {currentSEODisplay.h1}
          </h1>
          <h2 className="text-sm md:text-xl text-gray-300 font-semibold">
            {currentSEODisplay.h2}
          </h2>
          <h3 className="text-xs md:text-base text-purple-300/60 mt-1 font-medium">
            {currentSEODisplay.h3}
          </h3>
        </header>

        {/* SLA Tools Section */}
        <section className="mb-14" aria-label="Solo Leveling: Arise Tools">
          <h2 className="text-xl md:text-2xl font-bold text-purple-400 mb-6">
            Solo Leveling: Arise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {slaItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative flex items-center gap-4 bg-[#1a1f2c] border border-gray-700/50 rounded-lg p-4 md:p-5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 transition-all duration-300"
                aria-label={item.alt}
                onMouseEnter={() => handleNavHover(item)}
              >
                <img loading="lazy"
                  src={item.img}
                  alt={item.label}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
                  style={{ filter: `drop-shadow(0 2px 8px ${item.glowColor})` }}
                  draggable={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg md:text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.label}
                    </span>
                    {item.isNew && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">{item.alt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FanArts Section */}
        <section className="mb-14" aria-label="FanArts & Creativity">
          <h2 className="text-xl md:text-2xl font-bold text-pink-400 mb-6">
            FanArts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {fanartItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative flex items-center gap-4 bg-[#1a1f2c] border border-gray-700/50 rounded-lg p-4 md:p-5 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 hover:-translate-y-0.5 transition-all duration-300"
                aria-label={item.alt}
                onMouseEnter={() => handleNavHover(item)}
              >
                <img loading="lazy"
                  src={item.img}
                  alt={item.label}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
                  style={{ filter: `drop-shadow(0 2px 8px ${item.glowColor})` }}
                  draggable={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg md:text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                      {item.label}
                    </span>
                    {item.isNew && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">{item.alt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 italic mb-2">
            {t('home.footer.disclaimer')}
          </p>
          <p className="text-[11px] text-gray-600 mb-2">
            This is a fan-made website for Solo Leveling: Arise. Not affiliated with Netmarble.
          </p>
          <p className="text-xs text-gray-500">
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
    </div>
  );
}