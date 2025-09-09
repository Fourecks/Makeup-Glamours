import React from 'react';

interface FooterProps {
  siteName: string;
  logoDataUri: string;
  phoneNumber: string;
}

const Footer: React.FC<FooterProps> = ({ siteName, logoDataUri, phoneNumber }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;
  const instagramUrl = "https://www.instagram.com/makeup_glamoursv/?igsh=MTRkaGF3M21jYXB2dA%3D%3D";

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center mb-2">
          <img src={logoDataUri} alt={`${siteName} Logo`} className="h-12 w-12 mr-3" />
          <p className="text-2xl font-bold tracking-wider">{siteName}</p>
        </div>
        <p className="text-gray-400">&copy; {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">Instagram</a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;