import React, { useState, useEffect } from 'react';
import { AccessibilityContext } from './accessibility-context';

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isTalkBackEnabled, setIsTalkBackEnabled] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  
  const toggleTalkBack = () => {
    const newState = !isTalkBackEnabled;
    setIsTalkBackEnabled(newState);
    if (newState) {
      speak('Assistente de voz ativado.');
    } else {
      speak('Assistente de voz desativado.');
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      const voices = synth.getVoices();
      const preferred = voices.find(v => v.lang && (v.lang.startsWith('pt-BR') || v.lang.startsWith('pt')));
      if (preferred) {
        utterance.voice = preferred;
      }
      const speakNow = () => synth.speak(utterance);
      if (voices.length === 0) {
        synth.onvoiceschanged = () => {
          const vs = synth.getVoices();
          const v2 = vs.find(v => v.lang && (v.lang.startsWith('pt-BR') || v.lang.startsWith('pt')));
          if (v2) {
            utterance.voice = v2;
          }
          speakNow();
        };
        setTimeout(speakNow, 300);
      } else {
        speakNow();
      }
    } catch {}
  };
  
  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      toggleHighContrast,
      fontSize,
      increaseFontSize,
      decreaseFontSize,
      isTalkBackEnabled,
      toggleTalkBack,
      speak
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
