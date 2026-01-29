import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { AccessibilityFloatingButton } from './AccessibilityFloatingButton';
// no accessibility hooks needed here

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideHeaderRoutes = [
    '/login', 
    '/cadastro', 
    '/auth',
    '/manifestar',
    '/minhas-manifestacoes',
    '/acesso-informacao'
  ];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);
  
  // Force white background for auth routes to match Gov.br style
  const bgClass = shouldHideHeader ? 'bg-white' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col font-sans`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-primary focus:px-3 focus:py-2 focus:rounded">
        Ir para o conteúdo principal
      </a>
      {!shouldHideHeader && <Header />}
      <AccessibilityFloatingButton />
      <main id="main-content" className={`flex-1 container mx-auto p-4 max-w-lg ${shouldHideHeader ? 'bg-white' : ''}`} role="main">
        {children}
      </main>
      {!shouldHideHeader && (
        <footer className="p-6 text-center text-sm text-gray-500 bg-white border-t mt-auto">
          <p>© 2026 Governo do Distrito Federal</p>
          <p className="text-xs mt-1">Participa DF - Hackaton</p>
        </footer>
      )}
    </div>
  );
};
