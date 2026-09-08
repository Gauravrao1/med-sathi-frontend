import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n/I18nProvider';
import { authApi, scanApi } from '../api/client';
import { LanguageToggle } from '../components/LanguageToggle';
import { Scan } from '../types';
import { User, Clock, LogOut, ChevronRight, Edit3, Check } from 'lucide-react';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAge, setEditAge] = useState(user?.ageBracket || (user as any)?.age_bracket || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const data = await scanApi.getHistory();
      setScans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await authApi.updateProfile({
        name: editName,
        ageBracket: editAge
      } as any);
      updateUser(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-teal-600 text-white p-6">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-3 rounded-full">
                <User size={24} className="text-teal-600" />
              </div>
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="font-bold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                ) : (
                  <h2 className="font-bold text-gray-900">{user?.name || 'User'}</h2>
                )}
                <p className="text-sm text-gray-500">+91-{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={() => editing ? handleSaveProfile() : setEditing(true)}
              className="text-teal-600 p-2"
            >
              {editing ? <Check size={20} /> : <Edit3 size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs mb-0.5">Age</p>
              {editing ? (
                <select
                  value={editAge}
                  onChange={e => setEditAge(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                >
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                  <option value="55+">55+</option>
                </select>
              ) : (
                <p className="font-medium text-gray-800">{user?.ageBracket || (user as any)?.age_bracket || '-'}</p>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs mb-0.5">Language</p>
              <LanguageToggle />
            </div>
          </div>

          {user?.chronicConditions && (user.chronicConditions as any).length > 0 && (
            <div className="mt-3">
              <p className="text-gray-500 text-xs mb-1">Conditions</p>
              <div className="flex gap-1.5 flex-wrap">
                {(typeof user.chronicConditions === 'string' 
                  ? JSON.parse(user.chronicConditions) 
                  : user.chronicConditions || []
                ).map((c: string, i: number) => (
                  <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Past Scans */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">{t('profile.pastScans')}</h3>
          {loading ? (
            <div className="text-center py-6 text-gray-500">{t('common.loading')}</div>
          ) : scans.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Clock size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">{t('home.noScans')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scans.map(scan => (
                <button
                  key={scan.id}
                  onClick={() => {
                    sessionStorage.setItem('lastScanResult', JSON.stringify(scan));
                    navigate(`/results/${scan.id}`);
                  }}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between active:bg-gray-50"
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {scan.medicine?.brandName || 'Medicine'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(scan.scanDate).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-medium border border-red-200 rounded-xl bg-white active:bg-red-50"
        >
          <LogOut size={18} />
          {t('common.logout')}
        </button>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2">{t('common.logout')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('profile.logoutConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
