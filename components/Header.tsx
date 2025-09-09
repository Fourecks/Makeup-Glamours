import React from 'react';
import CartIcon from './icons/CartIcon';
import UserIcon from './icons/UserIcon';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  isAdmin: boolean;
  isScrolled: boolean;
  siteName: string;
  logoDataUri: string;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, onLoginClick, isAdmin, isScrolled, siteName, logoDataUri }) => {
  const headerClasses = `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`;
  const iconClasses = `transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-brand-pink' : 'text-white hover:text-pink-200 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]'}`;
  const logoClasses = `transition-colors duration-300 ${isScrolled ? 'text-brand-pink' : 'text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]'}`;
  const adminTextClasses = `text-sm font-semibold transition-colors duration-300 ${isScrolled ? 'text-gray-700' : 'text-white [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]'}`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className={`flex items-center text-2xl font-bold tracking-wider ${logoClasses}`}>
              <img src={logoDataUri} alt={`${siteName} Logo`} className="h-12 w-12 mr-3" />
              <span>{siteName}</span>
            </div>
          </div>

          {/* Icons and Actions */}
          <div className="flex items-center space-x-5">
            {isAdmin && (
               <span className={adminTextClasses}>Admin Mode</span>
            )}
            <button onClick={onLoginClick} className={iconClasses} aria-label="Login">
              <UserIcon className="h-6 w-6" />
            </button>
            <button onClick={onCartClick} className={`relative ${iconClasses}`} aria-label="Open cart">
              <CartIcon className="h-6 w-6" />
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