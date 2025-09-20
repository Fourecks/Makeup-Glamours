import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { supabase } from '../supabaseClient';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    image_url: '',
    stock: 0,
    created_at: new Date().toISOString(),
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      const { id, ...productData } = product;
      setFormData(productData);
      setImagePreview(product.image_url);
    } else {
      setFormData({ name: '', price: 0, description: '', category: '', image_url: '', stock: 0, created_at: new Date().toISOString() });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsUploading(false);
  }, [product, isOpen]);

  useEffect(() => {
    if (imageFile) {
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    let finalImageUrl = formData.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert(`Error al subir la imagen: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      finalImageUrl = data.publicUrl;
    }

    const finalProduct: Product = {
      id: product?.id || 'new-product-placeholder',
      ...formData,
      image_url: finalImageUrl || '',
    };

    onSave(finalProduct);
    setIsUploading(false);
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
            <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
            <div className="mt-2">
                {imagePreview ? (
                    <div className="relative group w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                        <img src={imagePreview} alt="Vista previa del producto" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button 
                                type="button" 
                                onClick={handleRemoveImage} 
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 p-2 rounded-full"
                                aria-label="Eliminar imagen"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-brand-pink hover:text-brand-pink transition-colors"
                    >
                        <PlusIcon className="h-8 w-8" />
                        <span className="mt-1 text-xs font-semibold">Añadir Imagen</span>
                    </button>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
             {imagePreview && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-sm text-brand-pink font-semibold hover:underline"
                >
                    Cambiar imagen
                </button>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
            <button 
                type="submit" 
                className="bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-36 disabled:bg-brand-pink-hover"
                disabled={isUploading}
            >
                {isUploading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;