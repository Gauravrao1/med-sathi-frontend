import React from 'react';
import { TrustScoreResult } from '../types';
import { useTranslation } from '../i18n/I18nProvider';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  result: TrustScoreResult;
}

export const TrustBadge: React.FC<Props> = ({ result }) => {
  const { t } = useTranslation();

  let colorClass = 'text-green-500';
  let bgClass = 'bg-green-50';
  let borderClass = 'border-green-200';
  let Icon = CheckCircle;
  let label = t('results.genuine');

  if (result.status === 'inconclusive') {
    colorClass = 'text-amber-500';
    bgClass = 'bg-amber-50';
    borderClass = 'border-amber-200';
    Icon = AlertTriangle;
    label = t('results.inconclusive');
  } else if (result.status === 'flagged') {
    colorClass = 'text-red-500';
    bgClass = 'bg-red-50';
    borderClass = 'border-red-200';
    Icon = XCircle;
    label = t('results.flagged');
  }

  return (
    <div className={`card flex flex-col items-center p-6 ${bgClass} ${borderClass} mb-6`}>
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        {/* Simple circular progress representation */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
          <circle 
            cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" 
            className={colorClass}
            strokeDasharray={2 * Math.PI * 56}
            strokeDashoffset={2 * Math.PI * 56 * (1 - result.score / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center">
          <span className={`text-4xl font-bold ${colorClass}`}>{result.score}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <Icon className={colorClass} size={24} />
        <h3 className={`text-xl font-bold ${colorClass}`}>{label}</h3>
      </div>

      <div className="w-full space-y-2 mt-2">
        {result.breakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
            <span className="text-gray-700">{item.label}</span>
            <span className="font-medium">
              {item.value}/{item.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
