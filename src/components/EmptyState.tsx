import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
};
