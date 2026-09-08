import { createContext, useContext, useMemo, useState } from 'react';
import { LANGUAGES, LOCALE_MAP, translations } from './translations';

const STORAGE_KEY = 'recordsaathi:language';
const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return translations[stored] ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function getByPath(source, path) {
  return path.split('.').reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), source);
}

function interpolate(text, params) {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  function setLanguage(code) {
    if (!translations[code]) return;
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable — language choice is session-only in that case
    }
  }

  const value = useMemo(() => ({
    language,
    setLanguage,
    locale: LOCALE_MAP[language] || LOCALE_MAP[DEFAULT_LANGUAGE],
    t(key, params) {
      const text = getByPath(translations[language], key) ?? getByPath(translations[DEFAULT_LANGUAGE], key) ?? key;
      return interpolate(text, params);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

export { LANGUAGES };
