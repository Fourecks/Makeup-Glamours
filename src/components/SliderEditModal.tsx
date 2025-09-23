import React, { useState, useEffect } from 'react';
import { Slide, ContentPosition } from '../types';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import ImageIcon from './icons/ImageIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface SliderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  sliderSpeed: number;
  onSpeedChange: (speed: number) => void;
  onAddSlide: () => void;
  onUpdateSlide: (id: number, updatedFields: Partial<Omit<Slide, 'id' | 'created_at'>>) => void;
  onDeleteSlide: (id: number) => void;
  onUpdateSlideImage: (slideId: number, file: File) => Promise<void>;
}

const positionGrid: ContentPosition[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

// Internal component for editing a single slide to better manage state
const SlideEditorItem: React.FC<{
    slide: Slide;
    onUpdate: (id: number, updatedFields: Partial<Omit<Slide, 'id' | 'created_at'>>) => void;
    onDelete: (id: number) => void;
    onImageUpdate: (slideId: number, file: File) => Promise<void>;
}> = ({ slide, onUpdate, onDelete, onImageUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                await onImageUpdate(slide.id, file);
            } catch (error) {
                console.error("Fallo la subida de la imagen del slide:", error);
                alert("Error al subir la imagen del slide. Revisa la consola para más detalles.");
            } finally {
                setIsUploading(false);
                if (e.target) {
                    e.target.value = '';
                }
            }
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Image Preview & Position Controls */}
                <div className="md:col-span-5 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Imagen de Fondo</label>
                        <label htmlFor={`image-upload-${slide.id}`} className="cursor-pointer group relative block w-full aspect-video bg-gray-200 rounded-md overflow-hidden shadow-inner">
                            {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <SpinnerIcon className="h-8 w-8 text-brand-pink animate-spin" />
                                </div>
                            ) : (
                                <div 
                                    className="w-full h-full bg-cover bg-no-repeat transition-all duration-150"
                                    style={{
                                        backgroundImage: `url(${slide.image_url})`,
                                        backgroundPosition: `${slide.image_position_x ?? 50}% ${slide.image_position_y ?? 50}%`
                                    }}
                                    aria-label="Vista previa de la imagen de fondo"
                                />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 bg-black/60 p-2 rounded-md">
                                    <ImageIcon className="h-5 w-5" />
                                    <span>Cambiar</span>
                                </div>
                            </div>
                        </label>
                        <input type="file" id={`image-upload-${slide.id}`} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </div>
                    <div className="space-y-3 pt-2">
                         <div>
                            <label className="block text-xs font-medium text-gray-600">Posición Horizontal: {slide.image_position_x ?? 50}%</label>
                            <input type="range" min="0" max="100" value={slide.image_position_x ?? 50} onChange={(e) => onUpdate(slide.id, { image_position_x: parseInt(e.target.value, 10) })} className="w-full mt-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600">Posición Vertical: {slide.image_position_y ?? 50}%</label>
                            <input type="range" min="0" max="100" value={slide.image_position_y ?? 50} onChange={(e) => onUpdate(slide.id, { image_position_y: parseInt(e.target.value, 10) })} className="w-full mt-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Text and Content Controls */}
                <div className="md:col-span-7 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" value={slide.title || ''} onChange={(e) => onUpdate(slide.id, { title: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                        <textarea value={slide.subtitle || ''} onChange={(e) => onUpdate(slide.id, { subtitle: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Texto del Botón</label>
                          <input type="text" value={slide.button_text || ''} onChange={(e) => onUpdate(slide.id, { button_text: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Enlace del Botón</label>
                          <input type="text" placeholder="ej: /productos" value={slide.button_link || ''} onChange={(e) => onUpdate(slide.id, { button_link: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" />
                      </div>
                    </div>
                     <div className="flex justify-between items-center pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posición del Contenido</label>
                            <div className="grid grid-cols-3 gap-1 mt-1 p-1 bg-gray-200 rounded-md w-24 h-24">
                                {positionGrid.map(pos => (
                                    <button key={pos} type="button" onClick={() => onUpdate(slide.id, { content_position: pos })} className={`w-full h-full rounded-sm flex items-center justify-center transition-colors ${(slide.content_position || 'center') === pos ? 'bg-brand-pink' : 'bg-gray-300 hover:bg-gray-400'}`}>
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="self-end">
                            <button onClick={() => onDelete(slide.id)} className="text-red-600 hover:text-red-800 font-medium p-2 rounded-lg hover:bg-red-50 transition-colors" aria-label="Eliminar diapositiva">
                                <TrashIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SliderEditModal: React.FC<SliderEditModalProps> = ({
  isOpen,
  onClose,
  slides,
  sliderSpeed,
  onSpeedChange,
  onAddSlide,
  onUpdateSlide,
  onDeleteSlide,
  onUpdateSlideImage,
}) => {
    
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Editar Carrusel Principal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          {/* Global Settings */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Configuración del Carrusel</h3>
            <label htmlFor="sliderSpeed" className="block text-sm font-medium text-gray-700">
              Velocidad de Transición: {sliderSpeed / 1000}s
            </label>
            <input
              id="sliderSpeed"
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={sliderSpeed}
              onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slides List */}
          <div className="space-y-6">
             <h3 className="text-lg font-semibold">Diapositivas</h3>
            {slides.map((slide) => (
              <SlideEditorItem
                key={slide.id}
                slide={slide}
                onUpdate={onUpdateSlide}
                onDelete={onDeleteSlide}
                onImageUpdate={onUpdateSlideImage}
              />
            ))}
             <button onClick={onAddSlide} className="w-full bg-green-100 text-green-800 font-bold py-3 px-6 rounded-lg hover:bg-green-200 transition-all duration-300 flex items-center justify-center space-x-2">
                <PlusIcon className="h-6 w-6" />
                <span>Añadir Nueva Diapositiva</span>
            </button>
          </div>
        </div>
        <div className="p-6 border-t sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-3 px-4 rounded-lg">
            Hecho
          </button>
        </div>
      </div>
    </div>
  );
};

export default SliderEditModal;
