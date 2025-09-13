import React from 'react';

interface AdminToolbarProps {
  onLogout: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ onLogout }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white h-auto sm:h-12 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2 sm:py-0 z-50">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div className="flex items-center">
            <span className="font-bold text-lg text-brand-pink">Makeup Glamours</span>
            <span className="ml-4 text-sm font-semibold hidden md:inline">Modo Administrador Activo</span>
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-2 sm:mt-0">
        <a 
          href="/"
          className="text-sm hover:text-brand-pink transition-colors">
          Ver Sitio
        </a>
         <a 
          href="/admin"
          className="text-sm hover:text-brand-pink transition-colors">
          Panel
        </a>
        <button 
          onClick={onLogout} 
          className="text-sm bg-brand-reddish px-3 py-1 rounded-md hover:bg-opacity-80 transition-colors">
          Salir del Modo Admin
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;
