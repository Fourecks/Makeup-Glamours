import React from 'react';

interface AdminToolbarProps {
  onLogout: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ onLogout }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white h-12 flex items-center justify-between px-4 sm:px-6 z-50">
      <div className="flex items-center">
        <span className="font-bold text-lg text-brand-pink">Admin</span>
        <span className="ml-4 text-sm font-semibold hidden md:inline">Sesión iniciada</span>
      </div>
      <div className="flex items-center space-x-4">
        <a 
          href="/admin" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-600 transition-colors">
          Gestionar Contenido
        </a>
        <button 
          onClick={onLogout} 
          className="text-sm bg-brand-reddish px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;