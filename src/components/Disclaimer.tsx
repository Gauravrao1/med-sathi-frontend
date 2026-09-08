import React from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { AlertCircle } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-100 p-3 rounded-lg flex gap-2 items-start text-xs text-gray-600 my-4">
      <AlertCircle size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
      <p>{t('common.disclaimer')}</p>
    </div>
  );
};
