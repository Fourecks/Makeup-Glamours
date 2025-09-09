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
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    images: [],
    stock: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        images: product.images,
        stock: product.stock,
      });
    } else {
      setFormData({ name: '', price: 0, description: '', category: '', images: [], stock: 0 });
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
      .catch(error => console.error("Error reading files:", error));
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
      id: product?.id || Date.now(),
      ...formData,
      images: formData.images.length > 0 ? formData.images : ['https://picsum.photos/800/800?random=placeholder'],
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
        <h2 className="text-2xl font-bold text-center mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full input-style" required step="0.01" />
            </div>
             <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full input-style" required step="1" min="0" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full input-style" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full input-style" required />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            
            {/* Main Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">Main Image Preview</label>
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
                    aria-label="Remove image"
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
                <span className="mt-1 text-xs font-semibold">Add Images</span>
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
            <p className="text-xs text-gray-500 mt-2">The first image will be the main display image.</p>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-2 px-4 rounded-lg">Save Product</button>
          </div>
        </form>
        <style>{`.input-style { border: 1px solid #D1D5DB; padding: 0.5rem 0.75rem; border-radius: 0.375rem; width: 100%; }`}</style>
      </div>
    </div>
  );
};

export default ProductEditModal;