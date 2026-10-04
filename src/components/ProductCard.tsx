import React, { useEffect, useRef, useState } from "react";
import { Product } from "../types";
import { productPath } from "../lib/routes";
import PlusIcon from "./icons/PlusIcon";
import ImageIcon from "./icons/ImageIcon";
interface ProductCardProps {
  quantityInCart?: number;
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  quantityInCart = 0,
}) => {
  const totalStock =
    product.variants?.length > 0
      ? product.variants.reduce((sum, v) => sum + v.stock, 0)
      : product.stock;
  const isSoldOut = totalStock <= 0;
  const isAtStockLimit =
    !product.variants?.length && quantityInCart >= product.stock;
  const image = product.image_url?.split(",")[0]?.trim();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const handleAdd = () => {
    if (isSoldOut || isAtStockLimit) return;
    if (product.variants?.length) {
      onProductClick(product);
      return;
    }
    onAddToCart(product);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };
  return (
    <article className="product-card">
      <a
        className="product-image"
        href={productPath(product)}
        aria-label={`Ver ${product.name}`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="420"
            height="480"
          />
        ) : (
          <span className="image-empty">
            <ImageIcon className="h-8 w-8" />
            Fotografía próximamente
          </span>
        )}
        {isSoldOut && <span className="stock-badge">Agotado</span>}
        {!isSoldOut && !!product.variants?.length && (
          <span className="variant-badge">
            {product.variants.length} variantes
          </span>
        )}
      </a>
      <div className="product-copy">
        <p className="product-category">{product.category}</p>
        <h3>
          <a href={productPath(product)}>{product.name}</a>
        </h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <button
          className="card-add"
          onClick={handleAdd}
          disabled={isSoldOut || isAtStockLimit}
          aria-label={
            isSoldOut
              ? `${product.name} agotado`
              : product.variants?.length
                ? `Elegir variante de ${product.name}`
                : `Agregar ${product.name} al carrito`
          }
        >
          {!isSoldOut && <PlusIcon className="h-4 w-4" />}
          <span>
            {isSoldOut
              ? "No disponible"
              : added
                ? "Agregado al carrito"
                : isAtStockLimit
                  ? "Ya está en tu carrito"
                  : product.variants?.length
                    ? "Elegir variante"
                    : "Agregar al carrito"}
          </span>
        </button>
        <span className="sr-only" role="status">
          {added ? `${product.name} agregado al carrito` : ""}
        </span>
      </div>
    </article>
  );
};
export default React.memo(ProductCard);
