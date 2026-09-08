import React from 'react';
import { Medicine, GenericAlternative } from '../types';
import { useTranslation } from '../i18n/I18nProvider';
import { TrendingDown } from 'lucide-react';

interface Props {
  medicine: Medicine;
  alternatives: GenericAlternative[];
}

export const PriceComparison: React.FC<Props> = ({ medicine, alternatives }) => {
  const { t } = useTranslation();

  const isOvercharged = medicine.mrp > medicine.ceilingPrice;

  return (
    <div className="mb-6">
      <h3 className="font-bold text-lg mb-3">{t('results.priceComparison')}</h3>
      
      <div className="card mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">{t('results.mrp')}</span>
          <span className={`font-bold ${isOvercharged ? 'text-red-500' : 'text-gray-900'}`}>
            ₹{medicine.mrp.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600">{t('results.ceilingPrice')}</span>
          <span className="font-medium">₹{medicine.ceilingPrice.toFixed(2)}</span>
        </div>
        
        {isOvercharged && (
          <div className="pt-2 text-red-500 text-sm font-medium flex items-center justify-between">
            <span>{t('results.overcharged')}</span>
            <span>- ₹{(medicine.mrp - medicine.ceilingPrice).toFixed(2)}</span>
          </div>
        )}
      </div>

      {alternatives.length > 0 && (
        <>
          <h4 className="font-medium text-gray-700 mb-2">{t('results.genericAlternatives')}</h4>
          <div className="space-y-3">
            {alternatives.map((alt) => {
              const savings = medicine.mrp - alt.mrp;
              const savingsPercent = Math.round((savings / medicine.mrp) * 100);

              return (
                <div key={alt.id} className="card p-3 flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-sm">{alt.brandName}</h5>
                    <p className="text-xs text-gray-500">{alt.manufacturer}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-700">₹{alt.mrp.toFixed(2)}</div>
                    {savings > 0 && (
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                        <TrendingDown size={12} />
                        {savingsPercent}% less
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
