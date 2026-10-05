import React, { useEffect, useId, useRef, useState } from "react";
import BeautyIcon from "./icons/BeautyIcon";
import { Product, CartItem } from "../types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  carouselLabel?: string;
  cartItems?: CartItem[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  carouselLabel,
  onProductClick,
  onAddToCart,
  cartItems = [],
}) => {
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    if (!carouselLabel || !element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [carouselLabel, products]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };
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
    <div className={carouselLabel ? "product-carousel" : undefined}>
      {carouselLabel && (
        <div
          className="carousel-controls"
          role="group"
          aria-label={`Desplazar ${carouselLabel}`}
        >
          <button
            type="button"
            className="icon-button carousel-previous"
            aria-label={`Anteriores en ${carouselLabel}`}
            aria-controls={trackId}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <BeautyIcon kind="arrow" className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Siguientes en ${carouselLabel}`}
            aria-controls={trackId}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <BeautyIcon kind="arrow" className="h-5 w-5" />
          </button>
        </div>
      )}
      <div
        ref={track}
        id={trackId}
        className={carouselLabel ? "product-carousel-track" : "product-grid"}
        role={carouselLabel ? "region" : undefined}
        aria-label={carouselLabel}
        aria-roledescription={carouselLabel ? "carrusel" : undefined}
        tabIndex={carouselLabel ? 0 : undefined}
        onKeyDown={
          carouselLabel
            ? (event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  move(event.key === "ArrowRight" ? 1 : -1);
                }
              }
            : undefined
        }
      >
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
    </div>
  );
};

export default ProductGrid;
