
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ImageIcon from './icons/ImageIcon';
import { supabase } from '../supabaseClient';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product, variants: ProductVariant[], variantsToDelete: string[]) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'image_url' | 'created_at' | 'variants'>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    stock: 0,
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantIdsToDelete, setVariantIdsToDelete] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (product) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, image_url, variants: productVariants, created_at, ...productData } = product;
          setFormData(productData);
          setImageUrls(image_url ? image_url.split(',').map(url => url.trim()).filter(Boolean) : []);
          setVariants(productVariants ? JSON.parse(JSON.stringify(productVariants)) : []);
        } else {
          setFormData({ name: '', price: 0, description: '', category: '', stock: 0 });
          setImageUrls([]);
          setVariants([]);
        }
        setImagesToDelete([]);
        setVariantIdsToDelete([]);
        setIsUploading(false);
        setIsSaving(false);
    }
  }, [product, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
    if (!bucketName) throw new Error("Supabase bucket name not configured.");

    const uploadPromises = files.map(async (file: File) => {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const newFileName = `${Date.now()}-${cleanFileName}`;
        const filePath = `public/${newFileName}`;
        
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
        if (uploadError) throw new Error(`No se pudo subir ${file.name}: ${uploadError.message}`);

        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
        const newUrls = await uploadImages(Array.from(e.target.files));
        setImageUrls(prev => [...prev, ...newUrls].filter(Boolean));
    } catch (error) {
        if (error instanceof Error) alert(`Fallo en la subida: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = imageUrls[indexToRemove];
    if (urlToRemove && !urlToRemove.startsWith('data:')) {
        setImagesToDelete(prev => [...prev, urlToRemove]);
    }
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
        id: `new-${Date.now()}`,
        product_id: product?.id || '',
        name: '',
        stock: 0,
        image_url: null,
        created_at: new Date().toISOString(),
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const handleRemoveVariant = (variantId: string) => {
    const variantToRemove = variants.find(v => v.id === variantId);
    setVariants(prev => prev.filter(v => v.id !== variantId));
    if (variantToRemove && !variantId.startsWith('new-')) {
        setVariantIdsToDelete(prev => [...prev, variantId]);
        if (variantToRemove.image_url) {
            setImagesToDelete(prev => [...prev, variantToRemove.image_url!]);
        }
    }
  };
  
  const handleVariantChange = (variantId: string, field: keyof Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>, value: string | number) => {
    setVariants(prev => prev.map(v => v.id === variantId ? {...v, [field]: value} : v));
  };

  const handleVariantImageUpload = (variantId: string) => {
    setUploadingVariantId(variantId);
    variantFileInputRef.current?.click();
  };

  const handleVariantImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !uploadingVariantId) return;
    const file = e.target.files[0];
    const variantIdToUpdate = uploadingVariantId;
    setUploadingVariantId(null);
    setIsUploading(true);
    
    try {
      const [newUrl] = await uploadImages([file]);
      const oldImageUrl = variants.find(v => v.id === variantIdToUpdate)?.image_url;
      if (oldImageUrl) {
        setImagesToDelete(prev => [...prev, oldImageUrl]);
      }
      setVariants(prev => prev.map(v => v.id === variantIdToUpdate ? {...v, image_url: newUrl} : v));
    } catch (error) {
      if (error instanceof Error) alert(`Fallo en la subida de imagen de variante: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (imagesToDelete.length > 0) {
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET;
        if (bucketName) {
            const getPathFromUrl = (url: string) => {
              if (url.startsWith('data:')) return '';
              try {
                const urlObject = new URL(url);
                const pathParts = urlObject.pathname.split(`/${bucketName}/`);
                return pathParts[1] || '';
              } catch (error) { return ''; }
            };
            const pathsToDelete = imagesToDelete.map(getPathFromUrl).filter(Boolean);
            if (pathsToDelete.length > 0) {
              await supabase.storage.from(bucketName).remove(pathsToDelete);
            }
        }
      }
      
      const finalImageUrl = imageUrls.join(',');
      const finalProduct: Product = {
        id: product?.id || 'new-product-placeholder',
        created_at: product?.created_at || new Date().toISOString(),
        ...formData,
        image_url: finalImageUrl,
        variants: [], // variants are passed separately to onSave
      };
      
      onSave(finalProduct, variants, variantIdsToDelete);

    } catch (error) {
       console.error("Error al guardar el producto:", error);
       alert("Ocurrió un error al guardar.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const isProcessing = isUploading || isSaving;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-3xl w-full relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2">
          <input type="text" name="name" placeholder="Nombre del Producto" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" name="price" placeholder="Precio" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required step="0.01" min="0"/>
            <input type="text" name="category" placeholder="Categoría" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md" required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Imágenes Principales</label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 m-1 text-white bg-red-600/80 p-1 rounded-full opacity-0 group-hover:opacity-100" disabled={isProcessing}><TrashIcon className="h-4 w-4" /></button>
                    </div>
                ))}
                 <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="flex items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg text-gray-400 hover:text-brand-pink hover:border-brand-pink">
                    {isUploading && !uploadingVariantId ? <SpinnerIcon className="animate-spin h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
                 </button>
            </div>
            <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageSelection} className="hidden" />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Variantes</h3>
                <button type="button" onClick={handleAddVariant} className="bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1 hover:bg-green-600"><PlusIcon className="h-4 w-4" /> Añadir</button>
            </div>
            {variants.length === 0 && (
                <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                    <p>Este producto no tiene variantes. El stock se gestionará a continuación.</p>
                </div>
            )}
            {variants.map((variant) => (
                <div key={variant.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                    <button type="button" onClick={() => handleVariantImageUpload(variant.id)} className="col-span-2 h-16 w-16 bg-white border rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50">
                        {isUploading && uploadingVariantId === variant.id ? <SpinnerIcon className="animate-spin h-6 w-6" /> : (variant.image_url ? <img src={variant.image_url} alt={variant.name} className="h-full w-full object-cover rounded-md" /> : <ImageIcon className="h-6 w-6" />)}
                    </button>
                    <div className="col-span-5"><input type="text" placeholder="Nombre Variante" value={variant.name} onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)} className="w-full text-sm p-2 border-gray-300 rounded-md" /></div>
                    <div className="col-span-3"><input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(variant.id, 'stock', parseInt(e.target.value, 10) || 0)} className="w-full text-sm p-2 border-gray-300 rounded-md" min="0" /></div>
                    <div className="col-span-2 text-right">
                        <button type="button" onClick={() => handleRemoveVariant(variant.id)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            ))}
            <input type="file" ref={variantFileInputRef} accept="image/*" onChange={handleVariantImageSelection} className="hidden"/>
             {variants.length === 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stock (para productos sin variantes)</label>
                    <input type="number" name="stock" placeholder="Stock Base" value={formData.stock} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required step="1" min="0" />
                </div>
            )}
          </div>

          <div className="flex justify-end pt-4 sticky bottom-0 bg-white py-4 -mx-8 px-8 border-t">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-36 disabled:bg-brand-pink/70" disabled={isProcessing}>
                {isSaving ? <><SpinnerIcon className="animate-spin h-5 w-5 mr-2" /> Guardando...</> : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
