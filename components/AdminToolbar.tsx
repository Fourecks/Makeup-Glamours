import React from 'react';

interface AdminToolbarProps {
  onSetView: (view: 'site' | 'dashboard') => void;
  onLogout: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ onSetView, onLogout }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white h-12 flex items-center justify-between px-6 z-50">
      <div className="flex items-center">
        <span className="font-bold text-lg text-brand-pink">Makeup Glamours</span>
        <span className="ml-4 text-sm font-semibold">Admin Mode is Active</span>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => onSetView('site')} 
          className="text-sm hover:text-brand-pink transition-colors">
          View Site
        </button>
         <button 
          onClick={() => onSetView('dashboard')} 
          className="text-sm hover:text-brand-pink transition-colors">
          Dashboard
        </button>
        <button 
          onClick={onLogout} 
          className="text-sm bg-brand-reddish px-3 py-1 rounded-md hover:bg-opacity-80 transition-colors">
          Exit Admin Mode
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;