import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './fr.json';
import en from './en.json';
// 🔥 NOUVELLES LANGUES (à décommenter quand prêt)
import ko from './ko.json';
import ja from './ja.json';
import zh from './zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      // 🔥 AJOUTER ICI QUAND PRÊT
      ko: { translation: ko },
      ja: { translation: ja },
      zh: { translation: zh }
    },
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    // 🔥 OPTIONNEL : Config avancée pour les langues asiatiques
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'builderBeru_language' // Clé custom pour ton site
    }
  });

export default i18n;