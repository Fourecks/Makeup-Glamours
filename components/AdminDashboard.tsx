import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductVariant, SiteConfig } from '../types';
import ProductEditModal from './ProductEditModal';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';
import SpinnerIcon from './icons/SpinnerIcon';

interface AdminDashboardProps {
  products: Product[];
  onSaveProduct: (product: Product, variants: ProductVariant[], variantsToDelete: string[]) => void;
  onDeleteProduct: (product: Product) => void;
  siteConfig: SiteConfig;
  onSiteConfigUpdate: (config: Partial<SiteConfig>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  onSaveProduct, 
  onDeleteProduct,
  siteConfig,
  onSiteConfigUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentConfig, setCurrentConfig] = useState<SiteConfig>(siteConfig);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentConfig(siteConfig);
  }, [siteConfig]);

  const handleConfigChange = (field: keyof SiteConfig, value: any) => {
    setCurrentConfig(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (product: Product, variants: ProductVariant[], variantsToDelete: string[]) => {
    onSaveProduct(product, variants, variantsToDelete);
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
          handleConfigChange('logo', loadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    onSiteConfigUpdate(currentConfig);
    alert("¡Configuración del sitio guardada!");
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
                  value={currentConfig.site_name}
                  onChange={(e) => handleConfigChange('site_name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white"
                />
              </div>
               <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de Teléfono de WhatsApp</label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={currentConfig.phone_number}
                  onChange={(e) => handleConfigChange('phone_number', e.target.value)}
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
                <img src={currentConfig.logo} alt="Logo Preview" className="h-24 w-24 object-contain" />
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

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Gestión de Productos</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
               <label className="flex items-center justify-between cursor-pointer bg-gray-100 p-2 rounded-lg">
                  <span className="mr-3 text-sm font-medium text-gray-700">Mostrar agotados</span>
                  <div className="relative">
                    <input type="checkbox" checked={siteConfig.show_sold_out} onChange={(e) => onSiteConfigUpdate({ show_sold_out: e.target.checked })} className="sr-only" />
                    <div className={`block w-14 h-8 rounded-full transition ${siteConfig.show_sold_out ? 'bg-brand-pink' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${siteConfig.show_sold_out ? 'transform translate-x-6' : ''}`}></div>
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
                {products.map((product) => {
                  const firstImageUrl = product.image_url ? product.image_url.split(',')[0].trim() : 'https://picsum.photos/150';
                  const totalStock = product.variants?.length > 0 
                    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                    : product.stock;

                  return (
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
                            <img className="h-10 w-10 rounded-full object-cover" src={firstImageUrl} alt={product.name} />
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${totalStock <= 0 ? 'text-gray-500' : 'text-gray-900'}`}>{product.name}</div>
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
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {totalStock > 0 ? `${totalStock} en stock` : 'Agotado'}
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
                  );
                })}
              </tbody>
            </table>
            {/* FIX: Removed unsupported `jsx` attribute from style tag. */}
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