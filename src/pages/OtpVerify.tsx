import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const OtpVerify: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const phone = location.state?.phone || '';
  const [demoOtp, setDemoOtp] = useState(location.state?.demoOtp || '');
  const [challenge, setChallenge] = useState(location.state?.challenge || '');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const submitOtp = async () => {
      const otpString = otp.join('');
      if (otpString.length === 6) {
        setLoading(true);
        setError('');
        try {
          const res = await authApi.verifyOtp(phone, otpString, challenge);
          login(res.token, res.user);
          
          if (!res.user.name) {
            navigate('/profile-setup');
          } else if (!res.user.consent_given_at) {
            navigate('/consent');
          } else {
            navigate('/home');
          }
        } catch (err: any) {
          setError(t('otp.invalidOtp'));
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } finally {
          setLoading(false);
        }
      }
    };

    if (otp.join('').length === 6 && !loading) {
      submitOtp();
    }
  }, [otp, phone, login, navigate, loading, t]);

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      const res = await authApi.sendOtp(phone);
      setDemoOtp(res.otp);
      setChallenge(res.challenge);
      setCountdown(30);
      setError('');
    } catch (err: any) {
      setError(t('common.error'));
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col bg-white">
      <div className="flex-1 mt-12">
        <h1 className="text-2xl font-bold mb-2">{t('otp.title')}</h1>
        <p className="text-gray-500 mb-8 text-sm">
          {t('otp.subtext')} <span className="font-medium text-gray-900">{phone}</span>
        </p>
        
        {demoOtp && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-amber-800 text-xs font-medium">Demo Mode — Your OTP is:</p>
            <p className="text-amber-900 text-2xl font-bold tracking-widest text-center mt-1">{demoOtp}</p>
          </div>
        )}

        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {loading && <div className="flex justify-center mb-4"><Loader2 className="animate-spin text-teal-600" /></div>}

        <div className="text-center mt-6">
          {countdown > 0 ? (
            <span className="text-gray-500 text-sm">
              {t('otp.resendIn', { seconds: countdown.toString() })}
            </span>
          ) : (
            <button onClick={handleResend} className="text-teal-600 font-medium text-sm">
              {t('otp.resend')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
