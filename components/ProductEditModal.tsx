import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, onSave }) => {
  // FIX: Add `created_at` to the initial state to satisfy the `Product` type.
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    images: [],
    stock: 0,
    created_at: new Date().toISOString(),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      // FIX: Copy `created_at` from the product when editing.
      const { id, ...productData } = product;
      setFormData(productData);
    } else {
      // FIX: Initialize `created_at` for a new product.
      setFormData({ name: '', price: 0, description: '', category: '', images: [], stock: 0, created_at: new Date().toISOString() });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const imagePromises: Promise<string>[] = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
          if (event.target && typeof event.target.result === 'string') {
            resolve(event.target.result);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(base64Images => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...base64Images],
        }));
      })
      .catch(error => {
        if (error instanceof Error) {
            console.error("Error reading image files:", error.message);
        } else {
            console.error("An unknown error occurred while reading image files:", error);
        }
      });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct: Product = {
      id: product?.id || 'new-product-placeholder',
      ...formData,
      images: formData.images.length > 0 ? formData.images : [],
    };
    onSave(finalProduct);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required step="0.01" />
            </div>
             <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Cantidad en Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required step="1" min="0" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Imágenes del Producto</label>
            
            {/* Main Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">Vista Previa de Imagen Principal</label>
                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                  <img src={formData.images[0]} alt="Main product preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={image} alt={`Product image ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    aria-label="Eliminar imagen"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-full aspect-square border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-brand-pink hover:text-brand-pink transition-colors"
                >
                <PlusIcon className="h-8 w-8" />
                <span className="mt-1 text-xs font-semibold">Añadir Imágenes</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">La primera imagen será la imagen principal.</p>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-2 px-4 rounded-lg">Guardar Producto</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
