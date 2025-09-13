import React, { useState, useEffect, useRef } from 'react';
import CartIcon from './icons/CartIcon';
import UserIcon from './icons/UserIcon';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  isAdmin: boolean;
  isScrolled: boolean;
  siteName: string;
  logo: string;
  isProductPage: boolean;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, onLoginClick, isAdmin, isScrolled, siteName, logo, isProductPage }) => {
  const forceSolidHeader = isScrolled || isProductPage;
  const [isItemAdded, setIsItemAdded] = useState(false);
  const prevCartItemCountRef = useRef(cartItemCount);

  useEffect(() => {
    // Solo activa la animación cuando se añaden artículos (el recuento aumenta)
    if (cartItemCount > prevCartItemCountRef.current) {
      setIsItemAdded(true);
      const timer = setTimeout(() => setIsItemAdded(false), 300); // La duración debe coincidir con la animación
      return () => clearTimeout(timer);
    }
    // Actualiza la referencia de recuento anterior
    prevCartItemCountRef.current = cartItemCount;
  }, [cartItemCount]);


  const headerClasses = `fixed ${isAdmin ? 'top-12 sm:top-12' : 'top-0'} left-0 right-0 z-40 transition-all duration-300 ${forceSolidHeader ? 'bg-white shadow-md' : 'bg-transparent'}`;
  const iconClasses = `transition-colors duration-300 ${forceSolidHeader ? 'text-gray-600 hover:text-brand-pink' : 'text-white hover:text-pink-200 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]'}`;
  const logoClasses = `transition-colors duration-300 ${forceSolidHeader ? 'text-brand-pink' : 'text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]'}`;
  const adminTextClasses = `text-sm font-semibold transition-colors duration-300 ${forceSolidHeader ? 'text-gray-700' : 'text-white [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]'}`;

  return (
    <header className={headerClasses} style={{ top: isAdmin ? '48px' : '0' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <div className={`flex items-center text-xl sm:text-2xl font-bold tracking-wider ${logoClasses}`}>
              <img src={logo} alt={`${siteName} Logo`} className="h-12 w-12 mr-3 flex-shrink-0" />
              <span className="truncate">{siteName}</span>
            </div>
          </div>

          {/* Icons and Actions */}
          <div className="flex items-center space-x-5 flex-shrink-0">
            {isAdmin && (
               <span className={`${adminTextClasses} hidden sm:inline`}>Modo Admin</span>
            )}
            {!isAdmin && (
              <button onClick={onLoginClick} className={iconClasses} aria-label="Iniciar Sesión">
                <UserIcon className="h-6 w-6" />
              </button>
            )}
            <button onClick={onCartClick} className={`relative ${iconClasses}`} aria-label="Abrir carrito">
              <CartIcon className={`h-6 w-6 ${isItemAdded ? 'animate-pop' : ''}`} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-live="polite">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;