
import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';
import Editable from './Editable';
import PencilIcon from './icons/PencilIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import { useDraggable } from '../hooks/useDraggable';

interface HeroSliderProps {
  slides: Slide[];
  isAdmin: boolean;
  onUpdate: (id: number, updatedFields: Partial<Omit<Slide, 'id' | 'created_at'>>) => void;
  sliderSpeed: number;
  onOpenSliderEditor: () => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, isAdmin, onUpdate, sliderSpeed, onOpenSliderEditor }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleTextDragEnd = (pos: { x: number, y: number }) => {
    if (slides[currentSlide]) {
      onUpdate(slides[currentSlide].id, { text_position_x: pos.x, text_position_y: pos.y });
    }
  };

  const handleButtonDragEnd = (pos: { x: number, y: number }) => {
    if (slides[currentSlide]) {
      onUpdate(slides[currentSlide].id, { button_position_x: pos.x, button_position_y: pos.y });
    }
  };

  useDraggable(textContentRef, sliderRef, handleTextDragEnd, isAdmin);
  useDraggable(buttonRef, sliderRef, handleButtonDragEnd, isAdmin);

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
  
  const textPosition = {
    left: `${slideData.text_position_x || 50}%`,
    top: `${slideData.text_position_y || 50}%`,
    transform: 'translate(-50%, -50%)',
  };

  const buttonPosition = {
    left: `${slideData.button_position_x || 50}%`,
    top: `${slideData.button_position_y || 80}%`,
    transform: 'translate(-50%, -50%)',
  };

  const textAlignClass = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  }[slideData.text_align || 'center'];
  
  const adminDraggableStyles = isAdmin
    ? 'cursor-grab active:cursor-grabbing hover:outline-dashed hover:outline-2 hover:outline-white/50 p-4 transition-all'
    : '';

  return (
    <div ref={sliderRef} className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {isAdmin && (
          <div className="absolute top-24 right-4 z-30 flex flex-col space-y-2">
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
          <img 
            src={slide.image_url} 
            alt={slide.title || 'Imagen del carrusel'} 
            className="w-full h-full object-cover" 
            style={{ objectPosition: `${slide.image_position_x || 50}% ${slide.image_position_y || 50}%` }}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ))}
      
      <div 
        ref={textContentRef}
        className={`absolute z-10 text-white w-full max-w-2xl ${textAlignClass} ${adminDraggableStyles}`}
        style={textPosition}
      >
        {slideData.title && (
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-down">
                <Editable as="span" isAdmin={isAdmin} value={slideData.title} onSave={(value) => onUpdate(slideData.id, { title: value })} />
            </h1>
        )}
        {slideData.subtitle && (
            <p className="text-lg md:text-xl mb-8 animate-fade-in-up">
                <Editable as="span" isAdmin={isAdmin} value={slideData.subtitle} onSave={(value) => onUpdate(slideData.id, { subtitle: value })} />
            </p>
        )}
      </div>

      {slideData.button_text && (
          <div 
            ref={buttonRef}
            className={`absolute z-20 animate-fade-in-up ${adminDraggableStyles}`}
            style={{...buttonPosition, animationDelay: '0.5s' }}
          >
            <button className="bg-brand-pink text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
              <Editable as="span" isAdmin={isAdmin} value={slideData.button_text} onSave={(value) => onUpdate(slideData.id, { button_text: value })} />
            </button>
          </div>
      )}


      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
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