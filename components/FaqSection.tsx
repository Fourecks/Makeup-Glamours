import React, { useState } from 'react';
import { FaqItem } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import Editable from './Editable';

interface FaqSectionProps {
  faqs: FaqItem[];
  isAdmin: boolean;
  onUpdate: (id: number, field: 'question' | 'answer', value: string) => void;
}

const FaqItemComponent: React.FC<{ faq: FaqItem, isAdmin: boolean, onUpdate: (id: number, field: 'question' | 'answer', value: string) => void }> = ({ faq, isAdmin, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800"
      >
        <Editable as="span" isAdmin={isAdmin} value={faq.question} onSave={(value) => onUpdate(faq.id, 'question', value)} />
        <ChevronDownIcon
          className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600">
          <Editable as="p" isAdmin={isAdmin} value={faq.answer} onSave={(value) => onUpdate(faq.id, 'answer', value)} multiline />
        </div>
      )}
    </div>
  );
};


const FaqSection: React.FC<FaqSectionProps> = ({ faqs, isAdmin, onUpdate }) => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-10">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FaqItemComponent key={faq.id} faq={faq} isAdmin={isAdmin} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;