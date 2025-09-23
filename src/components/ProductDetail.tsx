import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, ProductVariant } from '../types';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import ImageLightbox from './ImageLightbox';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, variant: ProductVariant | null) => void;
  isAdmin: boolean;
  cartItems: CartItem[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, isAdmin, cartItems }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const hasVariants = product.variants && product.variants.length > 0;

  useEffect(() => {
    if (hasVariants) {
      const firstAvailableVariant = product.variants.find(v => v.stock > 0);
      setSelectedVariantId(firstAvailableVariant?.id || product.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!hasVariants || !selectedVariantId) return null;
    return product.variants.find(v => v.id === selectedVariantId);
  }, [selectedVariantId, product.variants, hasVariants]);

  const allImages = useMemo(() => {
    const mainImages = product.image_url ? product.image_url.split(',').map(url => url.trim()).filter(Boolean) : [];
    const variantImages = (product.variants || []).map(v => v.image_url).filter((url): url is string => !!url);
    return [...new Set([...mainImages, ...variantImages])];
  }, [product.image_url, product.variants]);

  const [mainImage, setMainImage] = useState(allImages[0] || 'https://picsum.photos/600');
  
  useEffect(() => {
    setMainImage(allImages[0] || 'https://picsum.photos/600');
  }, [allImages]);

  useEffect(() => {
    if (selectedVariant?.image_url) {
      setMainImage(selectedVariant.image_url);
    }
  }, [selectedVariant]);

  const currentItemInCart = cartItems.find(item => 
      item.productId === product.id && item.variantId === (selectedVariant?.id || null)
  );
  
  const quantityInCart = currentItemInCart?.quantity || 0;
  
  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
  
  const availableStock = (selectedVariant ? selectedVariant.stock : product.stock) - quantityInCart;

  const isSoldOut = totalStock <= 0;
  const isVariantSoldOut = selectedVariant ? selectedVariant.stock <= 0 : false;

  useEffect(() => {
      if (quantity > availableStock && availableStock > 0) {
        setQuantity(availableStock);
      } else if (availableStock <= 0 && quantity !== 1) {
        setQuantity(1);
      }
  }, [availableStock, quantity]);
  
  const handleAddToCartClick = () => {
    if (hasVariants && !selectedVariant) {
        alert("Please select a variant.");
        return;
    }
    if (!isSoldOut) {
      onAddToCart(product, quantity, selectedVariant);
    }
  };
  
  const containerPadding = isAdmin ? 'pt-36' : 'pt-24';

  return (
    <>
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 pb-12 ${containerPadding}`}>
        <button onClick={onBack} className="mb-8 text-brand-pink hover:text-brand-pink-hover font-semibold">&larr; Volver a Productos</button>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="md:w-1/2 lg:w-5/12">
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              <button onClick={() => setIsLightboxOpen(true)} className="w-full cursor-pointer" aria-label="Ver imagen más grande">
                <img src={mainImage} alt={product.name} className={`w-full h-auto object-cover aspect-square transition-transform duration-300 hover:scale-105 ${isSoldOut ? 'grayscale' : ''}`} loading="lazy" decoding="async" />
              </button>
              {isSoldOut && (
                <div className="absolute top-4 left-4 bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                  Agotado
                </div>
              )}
            </div>
             <div className="grid grid-cols-5 gap-2">
                {allImages.map((image, index) => (
                    <button 
                        key={index} 
                        onClick={() => setMainImage(image)}
                        className={`rounded-md overflow-hidden border-2 transition-colors ${mainImage === image ? 'border-brand-pink' : 'border-transparent hover:border-gray-300'}`}
                    >
                        <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" loading="lazy" decoding="async" />
                    </button>
                ))}
            </div>
          </div>

          <div className="md:w-1/2 lg:w-7/12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl text-brand-pink font-bold mb-6">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
            
            {hasVariants && (
              <div className="mb-8">
                <h3 className="text-sm text-gray-800 font-semibold mb-3">
                  Variante: <span className="font-normal">{selectedVariant?.name}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${
                        selectedVariantId === variant.id
                          ? 'bg-brand-pink text-white border-brand-pink ring-2 ring-brand-pink ring-offset-2'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
                      disabled={variant.stock <= 0}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
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
                    <span className="px-4 font-semibold w-12 text-center">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(q => q + 1)} 
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md disabled:text-gray-300 disabled:cursor-not-allowed"
                        disabled={quantity >= availableStock}
                    >
                      <PlusIcon className="h-5 w-5"/>
                    </button>
                  </div>
                   { availableStock < 5 && availableStock > 0 &&
                        <p className="text-sm text-red-600">¡Solo quedan {availableStock} disponibles!</p>
                   }
                   { hasVariants && isVariantSoldOut &&
                        <p className="text-sm text-red-600">Variante agotada</p>
                   }
                </div>

                <button 
                  onClick={handleAddToCartClick}
                  disabled={availableStock <= 0 || (hasVariants && !selectedVariant) || (hasVariants && isVariantSoldOut)}
                  className="w-full bg-brand-pink text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none hover:bg-brand-pink-hover transform hover:scale-105"
                >
                  {availableStock > 0 ? 'Añadir al Carrito' : 'No hay más disponibles'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={allImages}
        startIndex={allImages.indexOf(mainImage)}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export default ProductDetail;
