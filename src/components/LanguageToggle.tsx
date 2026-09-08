import React from 'react';
import { useTranslation } from '../i18n/I18nProvider';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="bg-gray-100 text-teal-700 px-3 py-1.5 rounded-full font-medium text-sm border border-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors hover:bg-gray-200 gap-1"
    >
      <span className={language === 'en' ? 'font-bold' : 'text-gray-400'}>EN</span>
      <span className="text-gray-300">|</span>
      <span className={language === 'hi' ? 'font-bold' : 'text-gray-400'}>हि</span>
    </button>
  );
};
