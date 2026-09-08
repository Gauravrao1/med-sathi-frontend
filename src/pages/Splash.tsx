import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { LanguageToggle } from '../components/LanguageToggle';
import { ShieldCheck } from 'lucide-react';

export const Splash: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-teal-50 p-6 rounded-full mb-8">
          <ShieldCheck size={80} className="text-teal-600" />
        </div>
        
        <h1 className="text-5xl font-bold text-teal-700 mb-1">Aslee</h1>
        <h2 className="text-2xl font-medium text-gray-500 mb-6">असली</h2>
        
        <p className="text-lg text-gray-600 text-center max-w-xs">
          {t('splash.subtitle')}
        </p>
      </div>

      <div className="w-full pb-8">
        <button 
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          {t('splash.getStarted')}
        </button>
      </div>
    </div>
  );
};
