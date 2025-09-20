import React from 'react';
import XIcon from './icons/XIcon';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 transition-opacity"
        aria-label="Cerrar visor de imágenes"
      >
        <XIcon className="h-8 w-8" />
      </button>
      <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Vista ampliada del producto" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
      </div>
    </div>
  );
};

export default ImageLightbox;
