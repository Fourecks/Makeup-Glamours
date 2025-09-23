
import React, { useState } from 'react';
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
  const [uploadingSlideId, setUploadingSlideId] = useState<number | null>(null);

  if (!isOpen) return null;
  
  const handleSlideFieldChange = (id: number, field: keyof Omit<Slide, 'id' | 'created_at'>, value: any) => {
      onUpdateSlide(id, { [field]: value });
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingSlideId(slideId);
      try {
        await onUpdateSlideImage(slideId, file);
      } catch (error) {
        console.error("Fallo la subida de la imagen del slide:", error);
        alert("Error al subir la imagen del slide. Revisa la consola para más detalles.");
      } finally {
        setUploadingSlideId(null);
        if (e.target) {
            e.target.value = '';
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Editar Carrusel Principal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          {/* Global Settings */}
          <div className="p-4 border rounded-lg">
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
              <div key={slide.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
                <div className="md:col-span-1 space-y-4">
                    <label htmlFor={`image-upload-${slide.id}`} className="cursor-pointer group relative block">
                        {uploadingSlideId === slide.id ? (
                          <div className="w-full aspect-video bg-gray-200 flex items-center justify-center rounded-md">
                              <SpinnerIcon className="h-8 w-8 text-brand-pink animate-spin" />
                          </div>
                        ) : (
                          <img src={slide.image_url} alt={slide.title || 'Imagen de la diapositiva'} className="w-full h-auto object-cover rounded-md aspect-video" style={{ objectPosition: `${slide.image_position_x || 50}% ${slide.image_position_y || 50}%` }} />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 bg-black/60 p-2 rounded-md">
                                <ImageIcon className="h-5 w-5" />
                                <span>Cambiar Imagen</span>
                            </div>
                        </div>
                    </label>
                    <input
                        type="file"
                        id={`image-upload-${slide.id}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, slide.id)}
                        disabled={uploadingSlideId !== null}
                    />
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Posición Horizontal: {slide.image_position_x || 50}%</label>
                        <input type="range" min="0" max="100" value={slide.image_position_x || 50} onChange={(e) => handleSlideFieldChange(slide.id, 'image_position_x', parseInt(e.target.value, 10))} className="w-full" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Posición Vertical: {slide.image_position_y || 50}%</label>
                        <input type="range" min="0" max="100" value={slide.image_position_y || 50} onChange={(e) => handleSlideFieldChange(slide.id, 'image_position_y', parseInt(e.target.value, 10))} className="w-full" />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Posición del Contenido</label>
                        <div className="grid grid-cols-3 gap-1 mt-1 p-1 bg-gray-100 rounded-md w-24 h-24">
                           {positionGrid.map(pos => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => handleSlideFieldChange(slide.id, 'content_position', pos)}
                                    className={`w-full h-full rounded-sm flex items-center justify-center transition-colors
                                        ${(slide.content_position || 'center') === pos ? 'bg-brand-pink' : 'bg-gray-300 hover:bg-gray-400'}`}
                                >
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Título</label>
                        <input type="text" value={slide.title || ''} onChange={(e) => handleSlideFieldChange(slide.id, 'title', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Subtítulo</label>
                        <textarea value={slide.subtitle || ''} onChange={(e) => handleSlideFieldChange(slide.id, 'subtitle', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" rows={2} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Texto del Botón</label>
                        <input type="text" value={slide.button_text || ''} onChange={(e) => handleSlideFieldChange(slide.id, 'button_text', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <input type="text" placeholder="Enlace del Botón (ej: /productos)" value={slide.button_link || ''} onChange={(e) => handleSlideFieldChange(slide.id, 'button_link', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white" />
                        <button onClick={() => onDeleteSlide(slide.id)} className="text-red-600 hover:text-red-900 font-bold p-2 rounded-lg hover:bg-red-50 transition-colors ml-4" aria-label="Eliminar diapositiva">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
              </div>
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
