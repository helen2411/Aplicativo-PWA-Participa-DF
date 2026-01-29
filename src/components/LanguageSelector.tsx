import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  return (
    <div className="absolute top-4 right-4 z-[1000] flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`
            px-2 py-1 rounded text-xs font-bold transition-all
            ${language === lang.code 
              ? 'bg-white text-[#1351B4] shadow-md scale-105' 
              : 'bg-blue-800/50 text-white/70 hover:bg-blue-700/50 hover:text-white'}
          `}
          aria-label={`Selecionar idioma ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
