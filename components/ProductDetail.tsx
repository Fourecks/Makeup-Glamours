import React, { useState } from 'react';
import { Product } from '../types';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const isSoldOut = product.stock <= 0;
  
  const handleAddToCartClick = () => {
    if (!isSoldOut) {
      onAddToCart(product, quantity);
    }
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="mb-8 text-brand-pink hover:text-brand-pink-hover font-semibold">&larr; Back to Products</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
            <img src={selectedImage} alt={product.name} className={`w-full h-auto object-cover aspect-square ${isSoldOut ? 'grayscale' : ''}`} />
            {isSoldOut && (
              <div className="absolute top-4 left-4 bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                Agotado
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, index) => (
              <button 
                key={index} 
                onClick={() => setSelectedImage(img)}
                className={`rounded-md overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-brand-pink' : 'border-transparent'}`}
              >
                <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl text-brand-pink font-bold mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          
          {isSoldOut ? (
            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-bold">Producto Agotado</p>
              <p>Este producto no está disponible actualmente.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4 mb-8">
                <p className="font-semibold">Quantity:</p>
                <div className="flex items-center border rounded-md">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md">
                    <MinusIcon className="h-5 w-5"/>
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md">
                    <PlusIcon className="h-5 w-5"/>
                  </button>
                </div>
                <p className="text-sm text-gray-500">{product.stock} disponibles</p>
              </div>

              <button 
                onClick={handleAddToCartClick}
                className="w-full bg-brand-pink text-white font-bold py-4 px-6 rounded-lg hover:bg-brand-pink-hover transition-all duration-300 transform hover:scale-105"
              >
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;