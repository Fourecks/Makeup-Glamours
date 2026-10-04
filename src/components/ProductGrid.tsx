import React from "react";
import { Product, CartItem } from "../types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  cartItems?: CartItem[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
  onAddToCart,
  cartItems = [],
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <h3 className="text-2xl font-semibold text-gray-700">
          No se encontraron productos
        </h3>
        <p className="text-gray-500 mt-2">
          Intenta ajustar tu búsqueda o criterios de filtro.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantityInCart={
            cartItems.find(
              (item) => item.productId === product.id && !item.variantId,
            )?.quantity || 0
          }
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
