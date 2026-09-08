import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { Loader2 } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const LoadingSequence: React.FC<Props> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const steps = [
    t('loadingSequence.step1'),
    t('loadingSequence.step2'),
    t('loadingSequence.step3')
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, 500); // 500ms per step
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(finishTimer);
    }
  }, [step, steps.length, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <Loader2 className="animate-spin text-teal-600 mb-6" size={48} />
      <div className="h-8">
        <p className="text-lg font-medium text-gray-800 animate-pulse">
          {step < steps.length ? steps[step] : ''}
        </p>
      </div>
    </div>
  );
};
