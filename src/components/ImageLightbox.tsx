import React, { useState, useEffect } from 'react';
import XIcon from './icons/XIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  startIndex: number;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (isOpen) {
        setCurrentIndex(startIndex < 0 ? 0 : startIndex);
    }
  }, [isOpen, startIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-[52] transition-opacity"
        aria-label="Cerrar visor de imágenes"
      >
        <XIcon className="h-8 w-8" />
      </button>

      {images.length > 1 && (
        <>
        <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 z-[52] transition-all"
            aria-label="Imagen anterior"
        >
            <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 z-[52] transition-all"
            aria-label="Siguiente imagen"
        >
            <ChevronRightIcon className="h-8 w-8" />
        </button>
        </>
      )}

      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img src={images[currentIndex]} alt="Vista ampliada del producto" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
      </div>
    </div>
  );
};

export default ImageLightbox;