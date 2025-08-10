import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t, i18n } = useTranslation();

  // 🎯 SEO DYNAMIQUE
  useEffect(() => {
    const currentLang = i18n.language || 'fr';
    
    // 📝 TITLES ET DESCRIPTIONS PAR LANGUE
    const seoData = {
      fr: {
        title: "BuilderBeru - Calculateur Solo Leveling Arise Gratuit",
        description: "BuilderBeru.com - Calculateur et optimiseur de builds Solo Leveling Arise gratuit. DPS Calculator, artefacts, guides multilingues. 5 langues disponibles."
      },
      en: {
        title: "BuilderBeru - Free Solo Leveling Arise Calculator",
        description: "BuilderBeru.com - Free Solo Leveling Arise build optimizer & DPS calculator. Artifact analysis, hunter guides. Available in 5 languages including Korean."
      },
      ko: {
        title: "BuilderBeru - 솔로 레벨링 어라이즈 무료 계산기",
        description: "BuilderBeru.com - 솔로 레벨링 어라이즈 무료 빌드 최적화 및 DPS 계산기. 아티팩트 분석, 헌터 가이드. 한국어 포함 5개 언어 지원."
      },
      ja: {
        title: "BuilderBeru - 俺だけレベルアップ無料カリキュレーター",
        description: "BuilderBeru.com - 俺だけレベルアップな件：ARISE 無料ビルド最適化＆DPSカリキュレーター。アーティファクト解析、ハンターガイド。5言語対応。"
      },
      zh: {
        title: "BuilderBeru - 我独自升级免费计算器",
        description: "BuilderBeru.com - 我独自升级：ARISE 免费构建优化器和DPS计算器。神器分析，猎人指南。支持5种语言包括中文。"
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

  }, [i18n.language]);

  const activeItems = [
    { label: t('home.menu.build'), path: "/build" },
    { label: t('home.menu.dpsCalculator'), path: "/damage-calculator", special: true, new: true },
    { label: t('home.menu.hallOfFlame'), path: "/hall-of-flame", special: true },
    { label: t('home.menu.pod'), path: "/pod" },
    { label: t('home.menu.guideEditor'), path: "/guide-editor" },
  ];

  const inactiveItems = [
    { label: t('home.menu.bot'), disabled: true },
    { label: t('home.menu.bdg'), disabled: true },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col items-center justify-center py-10 px-4">
      {/* 🌐 LANGUAGE SELECTOR - AJOUTER EN HAUT */}
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
          padding: 20px;
          border-radius: 15px;
          margin: 30px 0;
          max-width: 400px;
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
      `}</style>

      <h1 className="text-4xl font-extrabold mb-10 text-purple-400 drop-shadow-md">
        {t('home.title')}
      </h1>

      {/* 🎵 NOUVELLE SECTION IN COMING CHARACTERS */}
      <div className="character-announcement">
        <img
          src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869120/JinhoJinah_ln6p3n.png"
          alt={t('home.announcement.imageAlt')}
          className="character-image w-full rounded-lg hover:scale-105 transition-all duration-300"
        />

        <div className="mt-4 text-center">
          <p className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {t('home.announcement.buildNew')}
          </p>
          <p className="new-character-text text-2xl font-extrabold mt-2 text-white">
            {t('home.announcement.buildJinah')}
          </p>
          <p className="theorycraft-text text-sm mt-3 font-medium">
            {t('home.announcement.dpsInfo')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        {activeItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="border border-purple-600 bg-[#1c1c2a] rounded-xl p-6 text-center text-xl font-bold text-white
              transition duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_#a855f7] hover:bg-purple-700"
          >
            {item.label}
          </Link>
        ))}

        {inactiveItems.map((item) => (
          <div
            key={item.label}
            className="border border-gray-700 bg-[#1a1a1a] rounded-xl p-6 text-center text-xl font-bold text-gray-500
              opacity-50 cursor-not-allowed transition duration-300 transform hover:scale-100 hover:shadow-none"
          >
            {item.label}
          </div>
        ))}
      </div>

      <footer className="mt-12 text-sm text-gray-500 italic text-center max-w-sm">
        {t('home.footer.disclaimer')}
        <br />
        {t('home.footer.community')}{" "}
        <a
          href="https://discord.gg/m8RCuDz5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          Discord
        </a>
        .
      </footer>
    </div>
  );
}