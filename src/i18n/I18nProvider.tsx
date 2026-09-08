import React, { createContext, useContext, useState } from 'react';
import enTranslations from './en.json';
import hiTranslations from './hi.json';

type Language = 'en' | 'hi';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'hi') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: Record<string, string>): string => {
    const keys = key.split('.');
    let current: any = language === 'en' ? enTranslations : hiTranslations;
    
    for (const k of keys) {
      if (current === undefined) return key;
      current = current[k];
    }
    
    let result = current || key;
    if (typeof result === 'string' && replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        result = result.replace(`{{${k}}}`, v);
      }
    }
    
    return result;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
