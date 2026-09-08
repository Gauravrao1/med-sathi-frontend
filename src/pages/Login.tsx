import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { authApi } from '../api/client';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError(t('login.invalidPhone'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.sendOtp(phone);
      navigate('/otp', { state: { phone, demoOtp: res.otp, challenge: res.challenge } });
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col bg-white">
      <div className="flex-1 mt-12">
        <h1 className="text-2xl font-bold mb-8">{t('login.title')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex relative">
              <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-medium">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="input-field rounded-l-none"
                placeholder="10-digit number"
                inputMode="numeric"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button 
            type="submit" 
            className="btn-primary flex justify-center items-center gap-2"
            disabled={phone.length !== 10 || loading}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {t('login.sendOtp')}
          </button>
        </form>
      </div>
    </div>
  );
};
