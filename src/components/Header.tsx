import React from "react";
import CartIcon from "./icons/CartIcon";
import SearchIcon from "./icons/SearchIcon";
import BeautyIcon from "./icons/BeautyIcon";
interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  isAdmin: boolean;
  isScrolled: boolean;
  siteName: string;
  logo: string;
  isProductPage: boolean;
  activeSection: "home" | "products" | "style" | undefined;
  onNavigate: (section: string, search?: boolean) => void;
}
const links = [
  { id: "home", label: "Inicio", href: "/" },
  { id: "products", label: "Tienda", href: "/tienda" },
  { id: "style", label: "Tu estilo", href: "/encuentra-tu-estilo" },
];
function NavigationIcon({ id }: { id: string }) {
  if (id === "style") return <BeautyIcon kind="heart" />;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "home" ? (
        <path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" />
      ) : (
        <>
          <path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 21v-6h6v6" />
        </>
      )}
    </svg>
  );
}
const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onCartClick,
  isAdmin,
  siteName,
  logo,
  activeSection,
  onNavigate,
}) => {
  const follow = (
    event: React.MouseEvent<HTMLAnchorElement>,
    section: string,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onNavigate(section);
  };
  return (
    <>
      <header className={`shop-header ${isAdmin ? "admin-header" : ""}`}>
        <div className="shop-shell header-inner">
          <a
            href="/"
            onClick={(e) => follow(e, "home")}
            className="brand"
            aria-label={siteName}
          >
            <img src={logo} alt="" width="56" height="56" />
            <span>{siteName}</span>
          </a>
          <nav className="desktop-navigation" aria-label="Navegación principal">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                aria-current={activeSection === link.id ? "page" : undefined}
                onClick={(e) => follow(e, link.id)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button header-search"
              onClick={() => onNavigate("products", true)}
              aria-label="Buscar productos"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <button
              className="icon-button cart-trigger"
              onClick={onCartClick}
              aria-label={`Abrir carrito, ${cartItemCount} artículos`}
            >
              <CartIcon className="h-5 w-5" />
              <span className="cart-count" aria-live="polite">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </header>
      <nav className="mobile-bottom-navigation" aria-label="Navegación móvil">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-current={activeSection === link.id ? "page" : undefined}
            onClick={(e) => follow(e, link.id)}
          >
            <NavigationIcon id={link.id} />
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
};
export default Header;
