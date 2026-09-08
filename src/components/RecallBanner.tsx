import React from 'react';
import { Recall } from '../types';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/I18nProvider';

interface Props {
  recall: Recall;
}

export const RecallBanner: React.FC<Props> = ({ recall }) => {
  const { t } = useTranslation();

  const isCritical = recall.severity === 'Critical';
  const bgColor = isCritical ? 'bg-red-600' : 'bg-amber-500';
  const textColor = 'text-white';
  const severityLabel = isCritical ? t('results.critical') : t('results.warning');

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-xl mb-6 shadow-md w-full`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="flex-shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-lg mb-1">
            {t('results.recallAlert')} - {severityLabel}
          </h3>
          <p className="text-sm opacity-90 leading-relaxed mb-2">
            {recall.reason}
          </p>
          <div className="text-xs opacity-75">
            {new Date(recall.alertDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
