import React, { useState, useEffect } from 'react';
import { Slide } from './types';
import Editable from './components/Editable';
import PencilIcon from './components/icons/PencilIcon';
import PlayIcon from './components/icons/PlayIcon';
import PauseIcon from './components/icons/PauseIcon';

interface HeroSliderProps {
  slides: Slide[];
  isAdmin: boolean;
  // FIX: Corrected onUpdate prop type to allow editing fields and fixed `imageUrl` to `image_url`.
  onUpdate: (id: number, field: keyof Omit<Slide, 'id' | 'image_url' | 'created_at' | 'order' | 'button_link'>, value: string) => void;
  sliderSpeed: number;
  onOpenSliderEditor: () => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, isAdmin, onUpdate, sliderSpeed, onOpenSliderEditor }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // FIX: Reset current slide if it becomes out of bounds, e.g., after a slide is deleted.
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (slides.length > 1 && !isPaused) {
      const timer = setTimeout(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, sliderSpeed);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides.length, sliderSpeed, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!slides || slides.length === 0) {
    return (
        <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-200 flex items-center justify-center">
            {isAdmin && (
                <button
                    onClick={onOpenSliderEditor}
                    className="bg-brand-pink text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                    Añade una Diapositiva para Empezar
                </button>
            )}
        </div>
    );
  }
  
  const slideData = slides[currentSlide];

  if (!slideData) {
    return null;
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {isAdmin && (
          <div className="absolute top-24 right-4 z-20 flex flex-col space-y-2">
            <button
                onClick={onOpenSliderEditor}
                className="bg-white/90 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-white shadow-md transition-all duration-300 flex items-center space-x-2"
            >
                <PencilIcon className="h-5 w-5" />
                <span>Editar Carrusel</span>
            </button>
             {slides.length > 1 && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-white/90 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-white shadow-md transition-all duration-300 flex items-center space-x-2"
                aria-label={isPaused ? "Reproducir carrusel" : "Pausar carrusel"}
              >
                {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
                <span>{isPaused ? 'Reproducir' : 'Pausar'}</span>
              </button>
            )}
          </div>
      )}

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* FIX: Property 'imageUrl' does not exist on type 'Slide'. Did you mean 'image_url'? */}
          <img src={slide.image_url} alt={slide.title || 'Imagen del carrusel'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ))}
      <div className="relative z-10 inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        {slideData.title && (
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-down">
                <Editable as="span" isAdmin={isAdmin} value={slideData.title} onSave={(value) => onUpdate(slideData.id, 'title', value)} />
            </h1>
        )}
        {slideData.subtitle && (
            <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-in-up">
                <Editable as="span" isAdmin={isAdmin} value={slideData.subtitle} onSave={(value) => onUpdate(slideData.id, 'subtitle', value)} />
            </p>
        )}
        {/* FIX: Add editable button to the hero slider if buttonText is provided. */}
        {/* FIX: Property 'buttonText' does not exist on type 'Slide'. Did you mean 'button_text'? */}
        {slideData.button_text && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button className="bg-brand-pink text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
              {/* FIX: Property 'buttonText' does not exist on type 'Slide'. Did you mean 'button_text'? */}
              <Editable as="span" isAdmin={isAdmin} value={slideData.button_text} onSave={(value) => onUpdate(slideData.id, 'button_text', value)} />
            </button>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
            <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-brand-pink' : 'bg-white/50'}`}
                aria-label={`Ir a la diapositiva ${index + 1}`}
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
