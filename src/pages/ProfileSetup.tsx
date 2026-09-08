import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const AGE_BRACKETS = ['18-25', '26-35', '36-45', '46-55', '55+'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Thyroid', 'Asthma', 'Heart Disease', 'None'];

export const ProfileSetup: React.FC = () => {
  const { t, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState('');
  const [ageBracket, setAgeBracket] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [prefLang, setPrefLang] = useState<'en'|'hi'>('en');
  const [loading, setLoading] = useState(false);

  const toggleCondition = (c: string) => {
    if (c === 'None') {
      setConditions(['None']);
    } else {
      setConditions(prev => {
        const withoutNone = prev.filter(p => p !== 'None');
        if (withoutNone.includes(c)) {
          return withoutNone.filter(p => p !== c);
        } else {
          return [...withoutNone, c];
        }
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({
        name,
        age_bracket: ageBracket,
        chronic_conditions: conditions,
        preferred_language: prefLang
      });
      updateUser(updatedUser);
      setLanguage(prefLang);
      
      if (!(user as any)?.consent_given_at) {
        navigate('/consent');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!(user as any)?.consent_given_at) {
      navigate('/consent');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">{t('profileSetup.title')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profileSetup.name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profileSetup.ageBracket')}</label>
          <div className="flex flex-wrap gap-2">
            {AGE_BRACKETS.map(bracket => (
              <button
                key={bracket}
                type="button"
                onClick={() => setAgeBracket(bracket)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  ageBracket === bracket 
                    ? 'bg-teal-600 border-teal-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {bracket}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profileSetup.chronicConditions')}</label>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(cond => (
              <button
                key={cond}
                type="button"
                onClick={() => toggleCondition(cond)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  conditions.includes(cond)
                    ? 'bg-amber-500 border-amber-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profileSetup.language')}</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="lang" 
                value="en" 
                checked={prefLang === 'en'} 
                onChange={() => setPrefLang('en')}
                className="text-teal-600 focus:ring-teal-500 w-5 h-5"
              />
              <span>English</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="lang" 
                value="hi" 
                checked={prefLang === 'hi'} 
                onChange={() => setPrefLang('hi')}
                className="text-teal-600 focus:ring-teal-500 w-5 h-5"
              />
              <span>हिंदी</span>
            </label>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button type="submit" className="btn-primary" disabled={loading}>
            {t('common.continue')}
          </button>
          
          <button 
            type="button" 
            onClick={handleSkip}
            className="w-full text-center text-gray-500 text-sm font-medium py-2"
          >
            {t('profileSetup.skip')}
          </button>
        </div>
      </form>
    </div>
  );
};
