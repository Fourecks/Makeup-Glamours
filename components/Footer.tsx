import React from 'react';

interface FooterProps {
  siteName: string;
  logo: string;
  phoneNumber: string;
  instagramUrl: string;
  onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ siteName, logo, phoneNumber, instagramUrl, onAdminClick }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <footer className="bg-gray-800 text-white py-8 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center mb-2">
          <img src={logo} alt={`${siteName} Logo`} className="h-12 w-12 mr-3" />
          <p className="text-2xl font-bold tracking-wider">{siteName}</p>
        </div>
        <p className="text-gray-400">&copy; {new Date().getFullYear()} {siteName}. Todos los Derechos Reservados.</p>
        <div className="flex justify-center space-x-6 mt-4">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">Instagram</a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">WhatsApp</a>
        </div>
      </div>
       <button 
        onClick={onAdminClick}
        className="absolute bottom-2 right-4 text-gray-600 hover:text-gray-400 text-xs transition-colors"
        aria-label="Admin Login"
      >
        Admin
      </button>
    </footer>
  );
};

export default Footer;
