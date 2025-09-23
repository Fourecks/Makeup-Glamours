import React from 'react';
import { Product } from '../types';
import PlusIcon from './icons/PlusIcon';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, onAddToCart }) => {
  const totalStock = product.variants?.length > 0
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
  const isSoldOut = totalStock <= 0;
  
  const firstImageUrl = product.image_url ? product.image_url.split(',')[0].trim() : 'https://picsum.photos/400/400';

  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    
    if (product.variants && product.variants.length > 0) {
      onProductClick(product);
    } else {
      onAddToCart(product);
    }
  };
  
  return (
    <div 
      className={`group relative bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 ${isSoldOut ? '' : 'hover:-translate-y-2 cursor-pointer'}`}
      onClick={() => !isSoldOut && onProductClick(product)}
    >
      <div className="relative w-full h-64 bg-gray-200">
        <img src={firstImageUrl} alt={product.name} className={`w-full h-full object-cover ${isSoldOut ? 'grayscale' : ''}`} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
        {isSoldOut ? (
          <div className="absolute top-4 left-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Agotado
          </div>
        ) : (
          <button 
            onClick={handleInteraction}
            className="absolute bottom-4 right-4 bg-brand-pink text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-pink-hover hover:scale-110"
            aria-label={`Añadir ${product.name} al carrito`}
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-brand-pink font-bold mt-1">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
