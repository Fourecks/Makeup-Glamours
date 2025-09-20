import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
  siteName: string;
  logo: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, siteName, logo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Suly' && password === 'sulita240508') {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos.');
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 w-full max-w-md">
         <div className="flex justify-center items-center mb-6">
            <img src={logo} alt={`${siteName} Logo`} className="h-16 w-16 mr-3" />
            <h1 className="text-3xl font-bold text-brand-pink tracking-wider">{siteName}</h1>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">Acceso de Administrador</h2>
            <p className="text-center text-gray-500 mb-6">Ingresa tus credenciales para continuar.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink bg-white text-gray-900"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-pink focus:border-brand-pink bg-white text-gray-900"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-brand-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-pink-hover transition-colors"
              >
                Entrar
              </button>
            </form>
        </div>
         <p className="text-center text-gray-500 text-sm mt-6">
            <a href="/" className="hover:text-brand-pink transition-colors">&larr; Volver al sitio principal</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
