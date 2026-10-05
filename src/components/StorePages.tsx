import type { Product, CartItem } from "../types";
import { categoryPath } from "../lib/routes";
import ProductGrid from "./ProductGrid";
import CategoryFilter from "./CategoryFilter";
import BeautyIcon from "./icons/BeautyIcon";
import CategoryIcon from "./icons/CategoryIcon";
type CatalogProps = {
  title: string;
  description: string;
  eyebrow: string;
  products: Product[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  onSelectCategory: (category: string) => void;
  onSearchChange: (query: string) => void;
  cartItems: CartItem[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};
export function CatalogPage(props: CatalogProps) {
  return (
    <main id="main-content" className="store-page">
      <div className="page-intro">
        <div className="shop-shell">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <a href="/">Inicio</a>
            <span aria-hidden="true">/</span>
            {props.selectedCategory !== "Todos" ? (
              <>
                <a href="/categorias">Categorías</a>
                <span aria-hidden="true">/</span>
              </>
            ) : null}
            <span aria-current="page">{props.title}</span>
          </nav>
          <h1>
            {props.title}
            <BeautyIcon kind="heart" className="heading-heart" />
          </h1>
          <p>{props.description}</p>
        </div>
      </div>
      <section
        id="products"
        className="shop-shell store-catalog"
        aria-label={props.title}
      >
        <div className="catalog-toolbar">
          <p role="status">
            {props.products.length}{" "}
            {props.products.length === 1 ? "producto" : "productos"}
          </p>
          <a className="text-link" href="/categorias">
            Explorar categorías <BeautyIcon kind="arrow" className="h-4 w-4" />
          </a>
        </div>
        <CategoryFilter
          categories={props.categories}
          selectedCategory={props.selectedCategory}
          onSelectCategory={props.onSelectCategory}
          searchQuery={props.searchQuery}
          onSearchChange={props.onSearchChange}
        />
        <ProductGrid
          products={props.products}
          cartItems={props.cartItems}
          onProductClick={props.onProductClick}
          onAddToCart={props.onAddToCart}
        />
      </section>
    </main>
  );
}
export function CategoriesPage({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  return (
    <main id="main-content" className="store-page">
      <div className="page-intro">
        <div className="shop-shell">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <a href="/">Inicio</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Categorías</span>
          </nav>
          <h1>Categorías</h1>
        </div>
      </div>
      <div className="shop-shell category-page-grid">
        {categories
          .filter((c) => c !== "Todos")
          .map((category) => {
            const group = products.filter((p) => p.category === category);
            return (
              <a
                className="category-page-card"
                href={categoryPath(category)}
                key={category}
              >
                <div className="category-page-image">
                  <CategoryIcon
                    category={category}
                    className="category-symbol"
                  />
                </div>
                <div>
                  <h2>{category}</h2>
                  <p>
                    {group.length}{" "}
                    {group.length === 1 ? "producto" : "productos"}
                  </p>
                  <BeautyIcon kind="arrow" className="h-5 w-5" />
                </div>
              </a>
            );
          })}
      </div>
    </main>
  );
}
export function NotFoundPage() {
  return (
    <main id="main-content" className="shop-shell not-found">
      <p className="eyebrow">SIGAMOS EXPLORANDO</p>
      <h1>No encontramos esta página</h1>
      <p>
        Puede que este producto o categoría ya no esté disponible. Encuentra tus
        favoritos en la tienda.
      </p>
      <a href="/tienda" className="primary-button">
        Explorar tienda <BeautyIcon kind="arrow" className="h-4 w-4" />
      </a>
    </main>
  );
}
