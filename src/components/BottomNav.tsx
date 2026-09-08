import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, Users, User, Bot } from 'lucide-react';
import { useTranslation } from '../i18n/I18nProvider';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] ${isActive ? 'text-teal-600' : 'text-gray-500'}`
        }
      >
        <Home size={24} />
        <span className="text-xs font-medium">{t('bottomNav.home')}</span>
      </NavLink>

      <NavLink
        to="/scan"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] ${isActive ? 'text-teal-600' : 'text-gray-500'}`
        }
      >
        <Camera size={24} />
        <span className="text-xs font-medium">{t('bottomNav.scan')}</span>
      </NavLink>

      <NavLink
        to="/community"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] ${isActive ? 'text-teal-600' : 'text-gray-500'}`
        }
      >
        <Users size={24} />
        <span className="text-xs font-medium">{t('bottomNav.community')}</span>
      </NavLink>

      <NavLink
        to="/chat"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] ${isActive ? 'text-teal-600' : 'text-gray-500'}`
        }
      >
        <Bot size={24} />
        <span className="text-xs font-medium">AI Chat</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] ${isActive ? 'text-teal-600' : 'text-gray-500'}`
        }
      >
        <User size={24} />
        <span className="text-xs font-medium">{t('bottomNav.profile')}</span>
      </NavLink>
    </div>
  );
};
