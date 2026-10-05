import { Product } from "../types";
import BeautyIcon from "./icons/BeautyIcon";
import CategoryIcon from "./icons/CategoryIcon";
export function QuickCategories({
  categories,
  onSelect,
}: {
  products: Product[];
  categories: string[];
  onSelect: (category: string) => void;
}) {
  return (
    <section id="categories" className="quick-categories shop-shell">
      <div className="section-heading">
        <div>
          <h2>Encuentra lo que buscas</h2>
        </div>
        <a href="/tienda" className="text-link">
          Todo el catálogo <BeautyIcon kind="arrow" className="h-4 w-4" />
        </a>
      </div>
      <div className="quick-category-list">
        {categories
          .filter((c) => c !== "Todos")
          .map((category) => {
            return (
              <button
                key={category}
                onClick={() => onSelect(category)}
                className="quick-category"
              >
                <span className="quick-category-icon">
                  <CategoryIcon category={category} />
                </span>
                <span>{category}</span>
                <BeautyIcon kind="arrow" className="h-4 w-4" />
              </button>
            );
          })}
      </div>
    </section>
  );
}
export function HowToBuy() {
  return (
    <section className="how-to-buy shop-shell" id="how-to-buy">
      <div className="section-heading">
        <div>
          <h2>Cómo comprar</h2>
        </div>
      </div>
      <div className="buy-steps">
        {[
          ["01", "Explora", "Encuentra tus productos favoritos."],
          ["02", "Agrega", "Añádelos a tu carrito y elige tus variantes."],
          [
            "03",
            "Envía",
            "Envíanos tu pedido por WhatsApp para coordinar disponibilidad, entrega y pago.",
          ],
        ].map(([number, title, description]) => (
          <div key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export function EditorialBanner({ image }: { image?: string }) {
  return (
    <section className="editorial-banner shop-shell">
      <div className="banner-copy">
        <h2>
          Todo para tu
          <br />
          <em>rutina de belleza</em>
        </h2>

        <a className="text-link" href="/tienda">
          Explorar catálogo <BeautyIcon kind="arrow" className="h-4 w-4" />
        </a>
      </div>
      {image && (
        <img
          src={image}
          alt="Un favorito del catálogo de Makeup Glamours"
          loading="lazy"
          decoding="async"
          width="560"
          height="400"
        />
      )}
    </section>
  );
}
