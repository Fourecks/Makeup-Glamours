import React, { useState } from 'react';
import { Product } from '../types';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import ImageLightbox from './ImageLightbox';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isAdmin: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, isAdmin }) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const isSoldOut = product.stock <= 0;
  
  const handleAddToCartClick = () => {
    if (!isSoldOut) {
      onAddToCart(product, quantity);
    }
  };
  
  // Adjust top padding to account for the fixed header and potential admin toolbar
  const containerPadding = isAdmin ? 'pt-36' : 'pt-24';

  return (
    <>
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 pb-12 ${containerPadding}`}>
        <button onClick={onBack} className="mb-8 text-brand-pink hover:text-brand-pink-hover font-semibold">&larr; Volver a Productos</button>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Image Gallery */}
          <div className="md:w-1/2 lg:w-5/12">
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              <button onClick={() => setIsLightboxOpen(true)} className="w-full cursor-pointer" aria-label="Ver imagen más grande">
                <img src={selectedImage} alt={product.name} className={`w-full h-auto object-cover aspect-square transition-transform duration-300 hover:scale-105 ${isSoldOut ? 'grayscale' : ''}`} />
              </button>
              {isSoldOut && (
                <div className="absolute top-4 left-4 bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                  Agotado
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, index) => (
                <button 
                  key={index} 
                  onClick={() => setSelectedImage(img)}
                  className={`rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-brand-pink scale-105' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`${product.name} miniatura ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 lg:w-7/12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
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
                  <p className="font-semibold">Cantidad:</p>
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md">
                      <MinusIcon className="h-5 w-5"/>
                    </button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md">
                      <PlusIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCartClick}
                  className="w-full bg-brand-pink text-white font-bold py-4 px-6 rounded-lg hover:bg-brand-pink-hover transition-all duration-300 transform hover:scale-105"
                >
                  Añadir al Carrito
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ImageLightbox
        isOpen={isLightboxOpen}
        imageUrl={selectedImage}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export default ProductDetail;