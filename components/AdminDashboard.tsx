import React, { useState, useRef } from 'react';
import { Product } from '../types';
import ProductEditModal from './ProductEditModal';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface AdminDashboardProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
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
    alert("Site settings saved!");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your e-commerce products and site settings.</p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Site Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input
                  type="text"
                  id="siteName"
                  value={currentSiteName}
                  onChange={(e) => setCurrentSiteName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white"
                />
              </div>
               <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={currentPhoneNumber}
                  onChange={(e) => setCurrentPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink sm:text-sm text-gray-900 bg-white"
                  placeholder="e.g. 50375771383"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo</label>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Upload New Logo
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
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
              Save Site Settings
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Product Management</h2>
            <div className="flex items-center space-x-4">
               <label className="flex items-center cursor-pointer">
                  <span className="mr-3 text-sm font-medium text-gray-700">Mostrar productos agotados</span>
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
                  Add New Product
                </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={`group ${product.stock <= 0 ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleDeleteRequest(product)} 
                          className="text-gray-400 hover:text-red-600 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Delete ${product.name}`}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(product)} className="text-brand-pink hover:text-brand-pink-hover">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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