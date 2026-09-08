import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Shield, Check } from 'lucide-react';

export const Consent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAgree = async () => {
    setLoading(true);
    try {
      await authApi.giveConsent();
      // Fetch updated user after consent is recorded
      const updatedUser = await authApi.getMe();
      updateUser(updatedUser);
      navigate('/home');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const points = [
    t('consent.point1'),
    t('consent.point2'),
    t('consent.point3'),
    t('consent.point4')
  ];

  return (
    <div className="min-h-screen p-6 flex flex-col bg-white">
      <div className="flex-1 mt-8">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-50 p-4 rounded-full">
            <Shield size={48} className="text-teal-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-center">{t('consent.title')}</h1>
        
        <div className="space-y-4 mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
          {points.map((point, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAgree}
          className="btn-primary w-full mb-4"
          disabled={loading}
        >
          {t('consent.agree')}
        </button>
        
        <div className="text-center">
          <a href="#" className="text-teal-600 text-sm font-medium underline">
            {t('consent.readPolicy')}
          </a>
        </div>
      </div>
    </div>
  );
};
