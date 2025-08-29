import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white shadow-sm p-4 flex justify-between items-center fixed top-0 z-50">
      <h1
        className="text-2xl font-bold text-blue-700 cursor-pointer"
        onClick={() => navigate('/')}
      >
        PsicoConecta
      </h1>
      <nav className="flex gap-2">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors"
        >
          Inicio
        </button>
        <button
          onClick={() => navigate('/search')}
          className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors"
        >
          Buscar Psicólogos
        </button>
        <button
          onClick={() => navigate('/psicoconecta')}
          className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors"
        >
          ¿Eres Psicólogo?
        </button>
      </nav>
    </header>
  );
};

export default Header;
