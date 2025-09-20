


import React, { useRef, useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory, searchQuery, onSearchChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleOpenSearch = () => {
    setIsSearchVisible(true);
  };

  const handleCloseSearch = () => {
    setIsSearchVisible(false);
    onSearchChange('');
  };

  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>, category: string) => {
    onSelectCategory(category);
    event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };


  if (isSearchVisible) {
    return (
      <div className="flex items-center justify-center w-full mb-12">
        <div className="relative w-full max-w-lg">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-12 pr-12 py-3 text-sm bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink"
            autoFocus
          />
          <button onClick={handleCloseSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center w-full mb-12">
      <div className="flex items-center space-x-2 w-full max-w-4xl">
        <button 
          onClick={handleOpenSearch}
          className="flex-shrink-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition"
          aria-label="Abrir búsqueda"
        >
          <SearchIcon className="h-5 w-5 text-gray-700" />
        </button>

        <div ref={scrollContainerRef} className="flex-grow flex items-center space-x-3 overflow-x-auto whitespace-nowrap scrollbar-hide px-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={(e) => handleCategoryClick(e, category)}
              className={`px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-bold rounded-lg transition-colors duration-300 flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-brand-reddish text-white shadow-md'
                  : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {category === 'Todos' ? 'INICIO' : category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;
