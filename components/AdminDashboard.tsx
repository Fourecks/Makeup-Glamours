import React, { useState, useRef } from 'react';
import { Product } from '../types';
import ProductEditModal from './ProductEditModal';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';
import SpinnerIcon from './icons/SpinnerIcon';

interface AdminDashboardProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onSetProducts: (products: Product[]) => void;
  showSoldOut: boolean;
  onSetShowSoldOut: (show: boolean) => void;
  siteName: string;
  onSiteNameChange: (name: string) => void;
  logo: string;
  onLogoChange: (dataUri: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  onSaveProduct, 
  onDeleteProduct,
  onSetProducts,
  showSoldOut, 
  onSetShowSoldOut,
  siteName,
  onSiteNameChange,
  logo,
  onLogoChange,
  phoneNumber,
  onPhoneNumberChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentSiteName, setCurrentSiteName] = useState(siteName);
  const [currentLogo, setCurrentLogo] = useState(logo);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(phoneNumber);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<string | null>(null);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (product: Product) => {
    onSaveProduct(product);
    setIsModalOpen(false);
  };

  const handleDeleteRequest = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete);
    }
    setIsConfirmModalOpen(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setProductToDelete(null);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target && typeof loadEvent.target.result === 'string') {
          setCurrentLogo(loadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    onSiteNameChange(currentSiteName);
    onLogoChange(currentLogo);
    onPhoneNumberChange(currentPhoneNumber);
    alert("¡Configuración del sitio guardada!");
  };

  const optimizeImage = (imageUrl: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // FIX: Allow cross-origin images to be loaded without tainting the canvas
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (e) {
            console.error(`Failed to export canvas for image: ${imageUrl}`, e);
            reject(new Error(`Could not export canvas. The image source may not support cross-origin requests.`));
        }
      };
      img.onerror = error => reject(error);
    });
  };

  const handleOptimizeImages = async () => {
    setIsOptimizing(true);
    setOptimizationStatus(null);
    
    const imagesToOptimize = products.flatMap(p => p.images).filter(src => !src.startsWith('data:image/'));

    if (imagesToOptimize.length === 0) {
      setOptimizationStatus('Todas las imágenes de los productos ya están optimizadas.');
      setIsOptimizing(false);
      return;
    }

    try {
      const optimizedProducts = await Promise.all(
        products.map(async (product) => {
          const optimizedImages = await Promise.all(
            product.images.map(imageSrc => {
              if (imageSrc.startsWith('data:image/')) {
                return Promise.resolve(imageSrc);
              }
              return optimizeImage(imageSrc);
            })
          );
          return { ...product, images: optimizedImages };
        })
      );
      
      onSetProducts(optimizedProducts);
      setOptimizationStatus(`¡Se han optimizado ${imagesToOptimize.length} imagen(es) de producto con éxito!`);
    } catch (error) {
      console.error('Image optimization failed:', error);
      setOptimizationStatus('Ocurrió un error durante la optimización de imágenes. Esto puede suceder si una fuente de imagen no admite solicitudes de origen cruzado (CORS). Revisa la consola para más detalles.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-gray-500 mt-2">Gestiona los productos de tu e-commerce y la configuración del sitio.</p>
          </div>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuración del Sitio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sitio</label>
                <input
                  type="text"
                  id="siteName"
                  value={currentSiteName}
                  onChange={(e) => setCurrentSiteName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white"
                />
              </div>
               <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de Teléfono de WhatsApp</label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={currentPhoneNumber}
                  onChange={(e) => setCurrentPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white"
                  placeholder="ej. 50375771383"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo del Sitio</label>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Subir Nuevo Logo
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa del Logo</label>
              <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                <img src={currentLogo} alt="Logo Preview" className="h-24 w-24 object-contain" />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="bg-brand-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-pink-hover transition-all duration-300 transform hover:scale-105"
            >
              Guardar Configuración
            </button>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Optimización de Rendimiento</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-grow">
                <h3 className="font-medium text-gray-800">Optimizar Imágenes</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Reduce el tamaño de los archivos de imagen para cargas de página más rápidas. Esto redimensionará y comprimirá todas las imágenes de los productos.
                </p>
              </div>
              <button
                onClick={handleOptimizeImages}
                disabled={isOptimizing}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center w-full sm:w-52 disabled:bg-indigo-400 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isOptimizing ? (
                  <>
                    <SpinnerIcon className="animate-spin h-5 w-5 mr-3" />
                    Optimizando...
                  </>
                ) : (
                  'Optimizar Todas las Imágenes'
                )}
              </button>
            </div>
             {optimizationStatus && (
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">{optimizationStatus}</p>
              )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Gestión de Productos</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
               <label className="flex items-center justify-between cursor-pointer bg-gray-100 p-2 rounded-lg">
                  <span className="mr-3 text-sm font-medium text-gray-700">Mostrar agotados</span>
                  <div className="relative">
                    <input type="checkbox" checked={showSoldOut} onChange={(e) => onSetShowSoldOut(e.target.checked)} className="sr-only" />
                    <div className={`block w-14 h-8 rounded-full transition ${showSoldOut ? 'bg-brand-pink' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showSoldOut ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>
                <button
                  onClick={handleAddNew}
                  className="bg-brand-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-pink-hover transition-all duration-300 transform hover:scale-105"
                >
                  Añadir Nuevo Producto
                </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Existencias</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 md:divide-y-0">
                {products.map((product) => (
                  <tr key={product.id} className="block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg shadow-md md:shadow-none relative group">
                    {/* Product Cell */}
                    <td className="block md:table-cell p-4 md:p-6 whitespace-nowrap" data-label="Producto">
                       <span className="md:hidden absolute left-4 top-4 text-xs font-bold uppercase text-gray-500">Producto</span>
                      <div className="flex items-center pt-6 md:pt-0">
                        <button 
                          onClick={() => handleDeleteRequest(product)} 
                          className="text-gray-400 hover:text-red-600 mr-3 md:opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={product.images[0]} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${product.stock <= 0 ? 'text-gray-500' : 'text-gray-900'}`}>{product.name}</div>
                        </div>
                      </div>
                    </td>
                    {/* Category Cell */}
                    <td className="block md:table-cell p-4 md:p-6 whitespace-nowrap text-right md:text-left border-t md:border-none" data-label="Categoría">
                        <span className="md:hidden absolute left-4 text-xs font-bold uppercase text-gray-500">Categoría</span>
                        <span className="text-sm text-gray-500">{product.category}</span>
                    </td>
                    {/* Price Cell */}
                    <td className="block md:table-cell p-4 md:p-6 whitespace-nowrap text-right md:text-left border-t md:border-none" data-label="Precio">
                        <span className="md:hidden absolute left-4 text-xs font-bold uppercase text-gray-500">Precio</span>
                        <span className="text-sm text-gray-500">${product.price.toFixed(2)}</span>
                    </td>
                    {/* Stock Cell */}
                    <td className="block md:table-cell p-4 md:p-6 whitespace-nowrap text-right md:text-left border-t md:border-none" data-label="Existencias">
                        <span className="md:hidden absolute left-4 text-xs font-bold uppercase text-gray-500">Existencias</span>
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                       </span>
                    </td>
                    {/* Actions Cell */}
                    <td className="block md:table-cell p-4 md:p-6 whitespace-nowrap text-right md:text-left border-t md:border-none">
                      <button onClick={() => handleEdit(product)} className="text-brand-pink hover:text-brand-pink-hover">
                        <PencilIcon className="h-5 w-5" />
                        <span className="md:sr-only ml-2">Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* FIX: Remove unsupported `jsx` attribute from style tag. */}
             <style>{`
                @media (max-width: 767px) {
                  td[data-label] {
                    position: relative;
                    padding-left: 50%;
                  }
                  td[data-label] > span:first-child {
                    position: absolute;
                    left: 1rem;
                    width: calc(50% - 2rem);
                    text-align: left;
                    top: 50%;
                    transform: translateY(-50%);
                  }
                }
            `}</style>
          </div>
        </div>
      </div>
      <ProductEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSave}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default AdminDashboard;