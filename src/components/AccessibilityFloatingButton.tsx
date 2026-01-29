import { useState } from 'react';
import { Volume2, Type, Accessibility } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

export const AccessibilityFloatingButton = () => {
  const { toggleHighContrast, toggleTalkBack, increaseFontSize, decreaseFontSize } = useAccessibility();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="fixed right-2 z-50 flex flex-row-reverse items-center gap-3" style={{ bottom: '10px' }}>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors z-50 shrink-0"
        aria-expanded={showMenu}
        aria-label="Opções de acessibilidade"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Menu Expansion (Lateral) */}
      {showMenu && (
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-xl border border-gray-200 flex items-center gap-3 animate-in slide-in-from-right-4 mr-1">
          <button 
            onClick={toggleHighContrast}
            className="flex flex-col items-center justify-center gap-1 w-10 h-10 hover:bg-gray-100 rounded-full text-blue-900 transition-colors"
            title="Alto Contraste"
          >
            <div className="w-5 h-5 border-2 border-blue-900 rounded-full bg-half-black" />
          </button>

          <button 
            onClick={toggleTalkBack}
            className="flex flex-col items-center justify-center gap-1 w-10 h-10 hover:bg-gray-100 rounded-full text-blue-900 transition-colors"
            title="Leitor de Tela"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <div className="flex items-center gap-1">
            <button onClick={decreaseFontSize} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-blue-900 transition-colors" title="Diminuir fonte">
              <Type className="w-3 h-3" />
            </button>
            <button onClick={increaseFontSize} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-blue-900 transition-colors" title="Aumentar fonte">
              <Type className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
