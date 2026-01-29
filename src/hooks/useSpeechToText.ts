import { useState, useEffect, useRef } from 'react';

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export const useSpeechToText = (onFinalResult?: (finalText: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (Ctor) {
      const recognitionInstance: SpeechRecognitionLike = new Ctor();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'pt-BR';

      recognitionInstance.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript && onFinalResult) {
          onFinalResult(finalTranscript.trim());
        }
      };

      recognitionInstance.onerror = (event: { error: string }) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'network') {
          alert('Erro de conexão: O reconhecimento de voz requer internet ativa. Verifique sua conexão.');
        } else if (event.error === 'not-allowed') {
          alert('Permissão de microfone negada. Por favor, permita o acesso ao microfone.');
        } else if (event.error === 'no-speech') {
          // No speech detected, just stop silently or maybe notify if needed
          // alert('Nenhuma fala detectada.');
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      }

      recognitionRef.current = recognitionInstance;
    }
  }, [onFinalResult]);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    } else if (!recognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (e) {
        console.error(e);
      }
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
};
