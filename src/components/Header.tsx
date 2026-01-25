import React from 'react';
import { Volume2, Type, Accessibility } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/participa-df-logo.svg';

export const Header = () => {
  const { toggleHighContrast, toggleTalkBack, increaseFontSize, decreaseFontSize } = useAccessibility();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-50" role="banner">
      <div className="flex justify-between items-center mb-2">
        <img
          src={logo}
          alt="Participa DF"
          className="h-8 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-semibold"
          aria-label="Sair"
        >
          Sair
        </button>
      </div>

      {/* Ícone de Acessibilidade (cadeira de rodas) */}
      <div className="mb-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded hover:bg-white/20 transition-colors flex items-center gap-2"
          aria-expanded={showMenu}
          aria-label="Abrir opções de acessibilidade"
        >
          <Accessibility className="w-6 h-6" />
          <span className="text-xs font-medium hidden md:inline">Acessibilidade</span>
        </button>
      </div>

      {/* Accessibility Toolbar toggled below icon */}
      {showMenu && (
      <div className="bg-white/10 p-2 rounded-lg flex justify-around items-center">
        <button 
          onClick={toggleHighContrast}
          className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/20"
          title="Alto Contraste"
        >
          <div className="w-6 h-6 border-2 border-white rounded-full bg-half-black" />
          <span className="text-xs">Contraste</span>
        </button>

        <button 
          onClick={toggleTalkBack}
          className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/20"
          title="Leitor de Tela"
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-xs">Voz</span>
        </button>

        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
          <button onClick={decreaseFontSize} className="p-1 hover:bg-white/20 rounded"><Type className="w-4 h-4" /></button>
          <span className="text-xs font-bold">A</span>
          <button onClick={increaseFontSize} className="p-1 hover:bg-white/20 rounded"><Type className="w-6 h-6" /></button>
        </div>
      </div>
      )}
    </header>
  );
};
