import React from 'react';
import { Header } from './Header';
// no accessibility hooks needed here

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-primary focus:px-3 focus:py-2 focus:rounded">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="main-content" className="flex-1 container mx-auto p-4 max-w-lg" role="main">
        {children}
      </main>
      <footer className="p-6 text-center text-sm text-gray-500 bg-white border-t mt-auto">
        <p>© 2026 Governo do Distrito Federal</p>
        <p className="text-xs mt-1">Participa DF - Hackaton</p>
      </footer>
    </div>
  );
};
