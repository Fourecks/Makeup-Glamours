import React from 'react';
import { InfoFeature } from '../types';

interface InfoSectionProps {
  features: InfoFeature[];
}

const InfoSection: React.FC<InfoSectionProps> = ({ features }) => {
  return (
    <section className="bg-pink-100 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {features.map((feature) => (
            <div key={feature.id}>
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                <span>{feature.icon}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                <span>{feature.title}</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                 {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
