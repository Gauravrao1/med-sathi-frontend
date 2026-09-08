import React from 'react';
import { Medicine } from '../types';

interface Props {
  medicine: Medicine;
}

export const MedicineCard: React.FC<Props> = ({ medicine }) => {
  return (
    <div className="card mb-6 bg-blue-50/50 border-blue-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{medicine.brandName}</h2>
      <p className="text-sm text-gray-600 mb-3">{medicine.genericName}</p>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div>
          <span className="text-gray-500 text-xs block">Manufacturer</span>
          <span className="font-medium">{medicine.manufacturer}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs block">Form</span>
          <span className="font-medium">{medicine.dosageForm}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500 text-xs block">Strength</span>
          <span className="font-medium">{medicine.strength}</span>
        </div>
      </div>
    </div>
  );
};
