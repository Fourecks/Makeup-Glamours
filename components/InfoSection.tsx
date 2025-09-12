
import React from 'react';
import Editable from './Editable';
// FIX: Imported the InfoFeature type from the correct location.
import { InfoFeature } from '../types';

interface InfoSectionProps {
  features: InfoFeature[];
  isAdmin: boolean;
  onUpdate: (index: number, field: keyof InfoFeature, value:string) => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({ features, isAdmin, onUpdate }) => {
  return (
    <section className="bg-pink-50 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {features.map((feature, index) => (
            <div key={index}>
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                <Editable as="span" isAdmin={isAdmin} value={feature.icon} onSave={(value) => onUpdate(index, 'icon', value)} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                <Editable as="span" isAdmin={isAdmin} value={feature.title} onSave={(value) => onUpdate(index, 'title', value)} />
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                 <Editable as="p" isAdmin={isAdmin} value={feature.description} onSave={(value) => onUpdate(index, 'description', value)} multiline />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoSection;