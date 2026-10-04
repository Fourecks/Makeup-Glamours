import React from "react";
import SearchIcon from "./icons/SearchIcon";
import XIcon from "./icons/XIcon";
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => (
  <div className="catalog-filter">
    <div
      className="category-tabs"
      role="group"
      aria-label="Filtrar por categoría"
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          aria-pressed={selectedCategory === category}
          className={selectedCategory === category ? "selected" : ""}
        >
          {category === "Todos" ? "Ver todo" : category}
        </button>
      ))}
    </div>
    <div className="catalog-search">
      <SearchIcon className="h-5 w-5" />
      <label className="sr-only" htmlFor="product-search">
        Buscar productos
      </label>
      <input
        id="product-search"
        type="search"
        placeholder="Buscar productos..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange("")}
          aria-label="Limpiar búsqueda"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);
export default CategoryFilter;
