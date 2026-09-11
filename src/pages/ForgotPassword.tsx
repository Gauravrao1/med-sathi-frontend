import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowLeft, MessageCircle, CheckCircle } from 'lucide-react';
import { authApi } from '../api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  
  // Step 2 state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(phone);
      setDemoOtp(res.otp || '');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authApi.resetPassword(phone, otp, newPassword);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Invalid OTP or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {step === 1 && (
          <div className="p-8">
            <div className="mb-6">
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={20} className="mr-1" /> Back to Login
              </button>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-500">Enter your phone number to receive a reset OTP</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1.5">Phone Number</label>
                <div className="relative flex">
                  <div className="flex items-center justify-center bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-3 text-gray-500 font-medium">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-gray-800"
                      placeholder="9876543210"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="mb-6">
              <button 
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={20} className="mr-1" /> Back
              </button>
            </div>
            
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <div className="flex items-center justify-center text-teal-600 gap-1.5 bg-teal-50 py-2 px-3 rounded-lg inline-flex">
                <MessageCircle size={18} />
                <span className="text-sm font-medium">OTP sent to your WhatsApp</span>
              </div>
            </div>

            {demoOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-amber-800 text-xs font-medium uppercase tracking-wider mb-1">Demo Mode OTP</p>
                <p className="text-amber-900 text-3xl font-bold tracking-widest">{demoOtp}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-gray-800 tracking-widest text-center text-lg font-medium"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-gray-800"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-gray-800"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Password Reset!</h2>
            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link
              to="/login"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center inline-block"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
