import React, { useState } from "react";
import { FaqItem } from "../types";
import ChevronDownIcon from "./icons/ChevronDownIcon";

interface FaqSectionProps {
  faqs: FaqItem[];
}

const FaqItemComponent: React.FC<{ faq: FaqItem }> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        aria-expanded={isOpen}
        aria-controls={`faq-${faq.id}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800"
      >
        <span>{faq.question}</span>
        <ChevronDownIcon
          className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div id={`faq-${faq.id}`} className="mt-4 text-gray-600">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  return (
    <section className="faq-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h2 className="font-serif text-3xl font-medium text-center mb-10">
          Un poco más de información
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FaqItemComponent key={faq.id} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
