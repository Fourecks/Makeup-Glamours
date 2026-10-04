import React, { useState, useEffect, useMemo } from "react";
import { Product, CartItem, ProductVariant } from "../types";
import PlusIcon from "./icons/PlusIcon";
import MinusIcon from "./icons/MinusIcon";
import ImageLightbox from "./ImageLightbox";
import BeautyIcon from "./icons/BeautyIcon";
import { categoryPath } from "../lib/routes";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    variant: ProductVariant | null,
  ) => void;
  isAdmin: boolean;
  cartItems: CartItem[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onAddToCart,
  isAdmin: _isAdmin,
  cartItems,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const hasVariants = product.variants && product.variants.length > 0;

  const selectedVariant = useMemo(() => {
    if (!hasVariants || !selectedVariantId) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || null;
  }, [selectedVariantId, product.variants, hasVariants]);

  const allImages = useMemo(() => {
    const mainImages = product.image_url
      ? product.image_url
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      : [];
    const variantImages = (product.variants || [])
      .map((v) => v.image_url)
      .filter((url): url is string => !!url);
    return [...new Set([...mainImages, ...variantImages])];
  }, [product.image_url, product.variants]);

  const [mainImage, setMainImage] = useState(allImages[0] || "");

  useEffect(() => {
    setMainImage(allImages[0] || "");
  }, [allImages]);

  useEffect(() => {
    if (selectedVariant?.image_url) {
      setMainImage(selectedVariant.image_url);
    }
  }, [selectedVariant]);

  const currentItemInCart = cartItems.find(
    (item) =>
      item.productId === product.id &&
      item.variantId === (selectedVariant?.id || null),
  );

  const quantityInCart = currentItemInCart?.quantity || 0;

  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  const availableStock =
    (selectedVariant ? selectedVariant.stock : product.stock) - quantityInCart;

  const isSoldOut = totalStock <= 0;
  const isVariantSoldOut = selectedVariant ? selectedVariant.stock <= 0 : false;
  const isSelectionRequired = hasVariants && !selectedVariant;

  useEffect(() => {
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (availableStock <= 0 && quantity !== 1) {
      setQuantity(1);
    }
  }, [availableStock, quantity]);

  const handleAddToCartClick = () => {
    if (hasVariants && !selectedVariant) {
      alert("Por favor, selecciona una variante.");
      return;
    }
    if (!isSoldOut) {
      onAddToCart(product, quantity, selectedVariant);
      setAdded(true);
    }
  };

  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (added) {
      const timer = setTimeout(() => setAdded(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [added]);

  return (
    <>
      <main id="main-content" className="product-detail shop-shell">
        <nav className="breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/tienda">Tienda</a><span aria-hidden="true">/</span><a href={categoryPath(product.category)}>{product.category}</a><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
        <button
          onClick={onBack}
          className="mb-8 text-brand-pink hover:text-brand-pink-hover font-semibold"
        >
          &larr; Volver a Productos
        </button>
        <div className="detail-layout">
          <div className="detail-gallery">
            <div className="detail-main-image">
              <button
                disabled={!mainImage}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full cursor-pointer"
                aria-label="Ver imagen más grande"
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    width="680"
                    height="680"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <span className="image-empty">Fotografía próximamente</span>
                )}
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
                  aria-label={`Ver fotografía ${index + 1}`}
                  aria-pressed={mainImage === image}
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`rounded-md overflow-hidden border-2 transition-colors ${mainImage === image ? "border-brand-pink" : "border-transparent hover:border-gray-300"}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover aspect-square"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="detail-information">
            <p className="eyebrow mb-3">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">
              {product.name}
            </h1>
            <p className="detail-price">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {hasVariants && (
              <div className="mb-8">
                <h3 className="text-sm text-gray-800 font-semibold mb-3">
                  {selectedVariant ? (
                    <>
                      Variante:{" "}
                      <span className="font-normal">
                        {selectedVariant.name}
                      </span>
                    </>
                  ) : (
                    "Selecciona una variante:"
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      aria-pressed={selectedVariantId === variant.id}
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${
                        selectedVariantId === variant.id
                          ? "bg-brand-pink text-white border-brand-pink ring-2 ring-brand-pink ring-offset-2"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      } ${variant.stock <= 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
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
                    <button
                      aria-label="Reducir cantidad"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-4 font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      aria-label="Aumentar cantidad"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md disabled:text-gray-300 disabled:cursor-not-allowed"
                      disabled={quantity >= availableStock}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {selectedVariant &&
                    availableStock < 5 &&
                    availableStock > 0 && (
                      <p className="text-sm text-red-600">
                        ¡Solo quedan {availableStock} disponibles!
                      </p>
                    )}
                  {hasVariants && isVariantSoldOut && (
                    <p className="text-sm text-red-600">Variante agotada</p>
                  )}
                </div>

                <button
                  onClick={handleAddToCartClick}
                  disabled={
                    isSelectionRequired ||
                    availableStock <= 0 ||
                    (hasVariants && isVariantSoldOut)
                  }
                  className="primary-button detail-add"
                >
                  {isSelectionRequired
                    ? "Seleccionar Variante"
                    : availableStock > 0
                      ? added
                        ? "Agregado al carrito"
                        : "Agregar al carrito"
                      : "No hay más disponibles"}
                </button>
              </>
            )}
            <div className="detail-purchase-note">
              <BeautyIcon kind="chat" className="h-5 w-5" />
              <p>
                Añade tus favoritos y envía el carrito por WhatsApp.
                Confirmaremos contigo disponibilidad, entrega y pago.
              </p>
            </div>
            <p className="sr-only" role="status">
              {added ? "Producto agregado al carrito" : ""}
            </p>
          </div>
        </div>
      </main>
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
