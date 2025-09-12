import React, { useState } from 'react';
import { Slide } from './types';
import XIcon from './components/icons/XIcon';
import TrashIcon from './components/icons/TrashIcon';
import PlusIcon from './components/icons/PlusIcon';
import SparkleIcon from './components/icons/SparkleIcon';
// FIX: Correctly import GoogleGenAI and GenerateContentResponse
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface SliderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  sliderSpeed: number;
  onSpeedChange: (speed: number) => void;
  onAddSlide: () => void;
  onUpdateSlide: (slide: Slide) => void;
  onDeleteSlide: (id: number) => void;
}

const SliderEditModal: React.FC<SliderEditModalProps> = ({
  isOpen,
  onClose,
  slides,
  sliderSpeed,
  onSpeedChange,
  onAddSlide,
  onUpdateSlide,
  onDeleteSlide,
}) => {
  if (!isOpen) return null;
  
  const [generating, setGenerating] = useState<number | null>(null);

  const handleSlideChange = (id: number, field: keyof Slide, value: string) => {
    const slideToUpdate = slides.find(s => s.id === id);
    if (slideToUpdate) {
      onUpdateSlide({ ...slideToUpdate, [field]: value });
    }
  };

  const generateWithGemini = async (slide: Slide) => {
      setGenerating(slide.id);
      try {
        // FIX: Use correct initialization for GoogleGenAI with API key from environment variables.
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

        const prompt = `Genera un título, subtítulo y texto de botón atractivos para un carrusel principal de una marca de cosméticos llamada AURA. El tono debe ser elegante, empoderador e inspirador. Devuelve la respuesta como un objeto JSON con las claves "title", "subtitle" y "buttonText". Temas de ejemplo: belleza natural, brillo de verano, productos veganos.`;

        // FIX: Use correct method to generate content and specify JSON response type.
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        
        // FIX: Extract text correctly from response and parse as JSON.
        const text = response.text;
        const jsonResponse = JSON.parse(text);

        const { title, subtitle, buttonText } = jsonResponse;

        // FIX: Property 'buttonText' does not exist in type 'Slide'. Did you mean to write 'button_text'?
        onUpdateSlide({ ...slide, title, subtitle, button_text: buttonText });

      } catch (error) {
        console.error("Error generating content with Gemini:", error);
        alert("Error al generar contenido. Por favor, revisa la consola para más detalles.");
      } finally {
        setGenerating(null);
      }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
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
                <div className="md:col-span-1">
                    {/* FIX: Property 'imageUrl' does not exist on type 'Slide'. Did you mean 'image_url'? */}
                    <img src={slide.image_url} alt={slide.title || 'Slide image'} className="w-full h-auto object-cover rounded-md aspect-video" />
                    <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600">URL de la Imagen</label>
                        <input
                        type="text"
                        // FIX: Property 'imageUrl' does not exist on type 'Slide'. Did you mean 'image_url'?
                        value={slide.image_url}
                        // FIX: Argument of type '"imageUrl"' is not assignable to parameter of type 'keyof Slide'.
                        onChange={(e) => handleSlideChange(slide.id, 'image_url', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink text-sm"
                        />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Título</label>
                        <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Subtítulo</label>
                        <textarea
                         value={slide.subtitle || ''}
                         onChange={(e) => handleSlideChange(slide.id, 'subtitle', e.target.value)}
                         className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink"
                         rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Texto del Botón</label>
                        <input
                        type="text"
                        // FIX: Property 'buttonText' does not exist on type 'Slide'. Did you mean 'button_text'?
                        value={slide.button_text || ''}
                        // FIX: Argument of type '"buttonText"' is not assignable to parameter of type 'keyof Slide'.
                        onChange={(e) => handleSlideChange(slide.id, 'button_text', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button 
                        onClick={() => generateWithGemini(slide)}
                        className={`bg-purple-100 text-purple-700 font-bold py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors duration-300 flex items-center space-x-2 ${generating === slide.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={generating === slide.id}
                      >
                         <SparkleIcon className={`h-5 w-5 ${generating === slide.id ? 'animate-spin' : ''}`} />
                         <span>{generating === slide.id ? 'Generando...' : 'Autocompletar con IA'}</span>
                      </button>
                      <button
                        onClick={() => onDeleteSlide(slide.id)}
                        className="text-red-600 hover:text-red-900 font-bold py-2 px-4 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                </div>
              </div>
            ))}
             <button
                onClick={onAddSlide}
                className="w-full bg-green-100 text-green-800 font-bold py-3 px-6 rounded-lg hover:bg-green-200 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <PlusIcon className="h-6 w-6" />
                <span>Añadir Nueva Diapositiva</span>
            </button>
          </div>
        </div>
        <div className="p-6 border-t sticky bottom-0 bg-white">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-3 px-4 rounded-lg"
          >
            Hecho
          </button>
        </div>
      </div>
    </div>
  );
};

export default SliderEditModal;