import React from "react";

interface AdminToolbarProps {
  onLogout: () => void;
  onToggleView: () => void;
  currentView: "site" | "dashboard";
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
  onLogout,
  onToggleView,
  currentView,
}) => {
  return (
    <div className="admin-toolbar fixed top-0 left-0 right-0 bg-gray-800 text-white h-12 flex items-center justify-between px-4 sm:px-6 z-50">
      <div className="flex items-center justify-between w-auto min-w-0">
        <div className="flex items-center">
          <span className="font-bold text-sm text-pink-200">
            Makeup Glamours
          </span>
          <span className="ml-4 text-sm font-semibold hidden md:inline">
            Modo Administrador Activo
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleView}
          className="text-sm hover:text-brand-pink transition-colors"
        >
          {currentView === "site" ? "Panel" : "Ver Sitio"}
        </button>
        <button
          onClick={onLogout}
          className="text-sm bg-brand-reddish px-3 py-1 rounded-md hover:bg-opacity-80 transition-colors"
        >
          Salir
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;
