import React, { useState } from "react";
import CartIcon from "./icons/CartIcon";
import SearchIcon from "./icons/SearchIcon";
import BeautyIcon from "./icons/BeautyIcon";
import XIcon from "./icons/XIcon";
interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  isAdmin: boolean;
  isScrolled: boolean;
  siteName: string;
  logo: string;
  isProductPage: boolean;
  onNavigate: (section: string, search?: boolean) => void;
}
const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onCartClick,
  isAdmin,
  siteName,
  logo,
  onNavigate,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (section: string, search = false) => {
    setMenuOpen(false);
    onNavigate(section, search);
  };
  return (
    <header className={`shop-header ${isAdmin ? "admin-header" : ""}`}>
      <div className="shop-shell header-inner">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <BeautyIcon kind="menu" className="h-5 w-5" />
          )}
        </button>
        <a
          href="/"
          onClick={(e) => {
            if (
              e.button !== 0 ||
              e.metaKey ||
              e.ctrlKey ||
              e.shiftKey ||
              e.altKey
            )
              return;
            e.preventDefault();
            navigate("home");
          }}
          className="brand"
        >
          <img src={logo} alt="" width="38" height="38" />
          <span>{siteName}</span>
        </a>
        <nav className="desktop-navigation" aria-label="Navegación principal">
          {[
            ["home", "Inicio"],
            ["products", "Tienda"],
            ["categories", "Categorías"],
            ["new-arrivals", "Novedades"],
            ["style", "Tu estilo"],
          ].map(([id, label]) => (
            <a
              href={
                (
                  {
                    home: "/",
                    products: "/tienda",
                    categories: "/categorias",
                    "new-arrivals": "/novedades",
                    style: "/encuentra-tu-estilo",
                  } as Record<string, string>
                )[id]
              }
              key={id}
              onClick={(e) => {
                if (
                  e.button !== 0 ||
                  e.metaKey ||
                  e.ctrlKey ||
                  e.shiftKey ||
                  e.altKey
                )
                  return;
                e.preventDefault();
                navigate(id);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => navigate("products", true)}
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
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation shop-shell"
          aria-label="Navegación móvil"
        >
          {[
            ["home", "Inicio"],
            ["products", "Tienda"],
            ["categories", "Categorías"],
            ["new-arrivals", "Novedades"],
            ["style", "Tu estilo"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={
                (
                  {
                    home: "/",
                    products: "/tienda",
                    categories: "/categorias",
                    "new-arrivals": "/novedades",
                    style: "/encuentra-tu-estilo",
                  } as Record<string, string>
                )[id]
              }
              onClick={(e) => {
                if (
                  e.button !== 0 ||
                  e.metaKey ||
                  e.ctrlKey ||
                  e.shiftKey ||
                  e.altKey
                )
                  return;
                e.preventDefault();
                navigate(id);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
export default Header;
