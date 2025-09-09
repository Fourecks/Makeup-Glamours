
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 col-span-2">
        <h3 className="text-2xl font-semibold text-gray-700">No products found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;