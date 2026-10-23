import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import kn from '../locales/kn.json';
import ta from '../locales/ta.json';
import ml from '../locales/ml.json';
import { getStoredLanguage, setStoredLanguage } from './storage';

// TODO: Translations must be reviewed by native speakers before launch.

const initialLang = getStoredLanguage() || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    kn: { translation: kn },
    ta: { translation: ta },
    ml: { translation: ml },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  setStoredLanguage(lng);
  document.documentElement.lang = lng;
});

export default i18n;
