import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';

interface HeroSliderProps {
  slides: Slide[];
  sliderSpeed: number;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, sliderSpeed }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
            <p className="text-gray-500">No hay diapositivas para mostrar.</p>
        </div>
    );
  }
  
  const slideData = slides[currentSlide];

  if (!slideData) {
    return null;
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.imageUrl} alt={slide.title || 'Imagen del carrusel'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ))}
      <div className="relative z-10 inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        {slideData.title && (
            <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight mb-4 animate-fade-in-down">
                {slideData.title}
            </h1>
        )}
        {slideData.subtitle && (
            <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-in-up">
                {slideData.subtitle}
            </p>
        )}
        {slideData.buttonText && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button className="bg-brand-pink text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
              {slideData.buttonText}
            </button>
          </div>
        )}
      </div>

        {slides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-white/30 text-white rounded-full p-2 hover:bg-white/50 transition-colors"
                    aria-label={isPaused ? "Reproducir carrusel" : "Pausar carrusel"}
                >
                    {isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
                </button>
                {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 my-auto rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-brand-pink w-6' : 'bg-white/50'}`}
                    aria-label={`Ir a la diapositiva ${index + 1}`}
                />
                ))}
            </div>
        )}
    </div>
  );
};

export default HeroSlider;
