
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
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'image_url'>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    stock: 0,
    created_at: new Date().toISOString(),
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (product) {
          const { id, image_url, ...productData } = product;
          setFormData(productData);
          setImageUrls(image_url ? image_url.split(',').map(url => url.trim()).filter(Boolean) : []);
        } else {
          setFormData({ name: '', price: 0, description: '', category: '', stock: 0, created_at: new Date().toISOString() });
          setImageUrls([]);
        }
        setImagesToDelete([]);
        setIsUploading(false);
        setIsSaving(false);
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };
  
  const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;

    if (!bucketName) {
      const errorMessage = "El nombre del bucket de Supabase no está configurado. Revisa tus variables de entorno (VITE_SUPABASE_BUCKET).";
      console.error(errorMessage);
      alert(errorMessage);
      setIsUploading(false);
      return;
    }

    const uploadPromises = files.map(async (file: File) => {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const newFileName = `${Date.now()}-${cleanFileName}`;
        const filePath = `public/${newFileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (uploadError) {
            console.error(`Error al subir la imagen '${file.name}':`, uploadError);
            throw new Error(`No se pudo subir ${file.name}: ${uploadError.message}`);
        }

        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return data.publicUrl;
    });

    try {
        const newUrls = await Promise.all(uploadPromises);
        setImageUrls(prev => [...prev, ...newUrls].filter(Boolean));
    } catch (error) {
        if (error instanceof Error) {
            alert(`Fallo en la subida: ${error.message}`);
        } else {
            alert('Ocurrió un error desconocido durante la subida. Revisa la consola.');
        }
    } finally {
        setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = imageUrls[indexToRemove];
    if (urlToRemove) {
        setImagesToDelete(prev => [...prev, urlToRemove]);
    }
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (imagesToDelete.length > 0) {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (!bucketName) {
            alert("Error: El nombre del bucket de Supabase no está configurado (VITE_SUPABASE_BUCKET).");
            setIsSaving(false);
            return;
        }

        const getPathFromUrl = (url: string) => {
            if (url.startsWith('data:')) return '';
            try {
                const urlObject = new URL(url);
                const bucketPathSegment = `/${bucketName}/`;
                const bucketPathIndex = urlObject.pathname.indexOf(bucketPathSegment);
                
                if (bucketPathIndex === -1) {
                    console.warn(`Could not find bucket path segment '${bucketPathSegment}' in URL path: ${urlObject.pathname}`);
                    return '';
                }
                
                return urlObject.pathname.substring(bucketPathIndex + bucketPathSegment.length);
            } catch (error) {
                console.error("URL inválida para extraer la ruta:", url, error);
                return '';
            }
        };

        const pathsToDelete = imagesToDelete.map(getPathFromUrl).filter(Boolean);
        
        if (pathsToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove(pathsToDelete);

            if (deleteError) {
                console.error('Error al eliminar imágenes del almacenamiento:', deleteError);
                alert(`Error al eliminar imágenes: ${deleteError.message}`);
            }
        }
      }
      
      const finalImageUrl = imageUrls.filter(url => url && url.trim() !== '').join(',');
      const finalProduct: Product = {
        id: product?.id || 'new-product-placeholder',
        ...formData,
        image_url: finalImageUrl,
      };

      onSave(finalProduct);

    } catch (error) {
       console.error("Error al guardar el producto:", error);
       alert("Ocurrió un error al guardar. Revisa la consola para más detalles.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const isProcessing = isUploading || isSaving;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink" required step="0.01" min="0" />
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
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img src={url} alt={`Vista previa ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                            <button 
                                type="button" 
                                onClick={() => handleRemoveImage(index)} 
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 p-2 rounded-full"
                                aria-label="Eliminar imagen"
                                disabled={isProcessing}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-pink hover:text-brand-pink transition-colors disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                    {isUploading ? <SpinnerIcon className="animate-spin h-8 w-8" /> : <PlusIcon className="h-8 w-8" />}
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleImageSelection}
                className="hidden"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
            <button 
                type="submit" 
                className="bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-36 disabled:bg-brand-pink/70"
                disabled={isProcessing}
            >
                {isSaving ? <><SpinnerIcon className="animate-spin h-5 w-5 mr-2" /> Guardando...</> : (isUploading ? "Espere..." : 'Guardar Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
