import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, Video, Image, FileText, ArrowLeft, Send, MicOff, MapPin, Trash2, Camera, Paperclip } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAccessibility } from '../hooks/useAccessibility';
import { participaApi } from '../services/participaApi';
import { CameraCapture } from '../components/CameraCapture';
import { ConfirmModal } from '../components/ConfirmModal';
import { db } from '../services/db';

type GPSLocation = { lat: number; lng: number; source: 'geolocation' | 'exif' | 'manual' };
type MediaType = 'text' | 'audio' | 'image' | 'video';

import type { ManifestRecord } from '../types';

export const ManifestationForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isTalkBackEnabled, speak } = useAccessibility();
  const primaryType: MediaType = (params.get('type') as MediaType) || 'text';

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<MediaType>>(new Set<MediaType>([primaryType]));
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'image' | 'video'>('image');

  const [text, setText] = useState('');
  const { isRecording, audioUrl, startRecording, stopRecording, setAudioUrl } = useAudioRecorder();
  const { isListening, startListening, stopListening } = useSpeechToText((final) => {
    setText(prev => (prev ? prev + ' ' + final : final));
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [audioDescription, setAudioDescription] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [izaLoading, setIzaLoading] = useState(false);
  const [izaSummary, setIzaSummary] = useState<string | null>(null);
  const [izaCategory, setIzaCategory] = useState<string | null>(null);
  const [izaError, setIzaError] = useState<string | null>(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'image' | 'video';
    index: number;
  } | null>(null);
  const imageAttachRef = useRef<HTMLInputElement>(null);
  const imageCameraRef = useRef<HTMLInputElement>(null);
  const videoAttachRef = useRef<HTMLInputElement>(null);
  const videoCameraRef = useRef<HTMLInputElement>(null);
  // Track active blob URLs to revoke them only on unmount or manual removal
  const previewUrlsRef = useRef<string[]>([]);

  // Update tracked URLs whenever previews change
  useEffect(() => {
    previewUrlsRef.current = [...imagePreviews, ...videoPreviews];
  }, [imagePreviews, videoPreviews]);

  // Cleanup all blobs only when component unmounts
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const removeVideo = (index: number) => {
    setDeleteConfirmation({ isOpen: true, type: 'video', index });
  };

  const removeImage = (index: number) => {
    setDeleteConfirmation({ isOpen: true, type: 'image', index });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmation) return;
    const { type, index } = deleteConfirmation;

    if (type === 'video') {
      const urlToRemove = videoPreviews[index];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);

      setVideos(prev => prev.filter((_, i) => i !== index));
      setVideoPreviews(prev => prev.filter((_, i) => i !== index));
      if (isTalkBackEnabled) speak('Vídeo excluído.');
    } else {
      const urlToRemove = imagePreviews[index];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);

      setImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      if (isTalkBackEnabled) speak('Foto excluída.');
    }
    setDeleteConfirmation(null);
  };

  const renderSection = (type: MediaType) => {
    if (type === 'text') {
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Texto</span>
          </div>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.setCustomValidity('');
              }}
              onFocus={() => { if (isTalkBackEnabled) speak('Descrição da manifestação, obrigatório'); }}
              onInvalid={(e) => (e.target as HTMLTextAreaElement).setCustomValidity('Por favor, descreva sua manifestação.')}
              placeholder="Descreva sua manifestação aqui..."
              className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                  if (isTalkBackEnabled) speak("Digitação por voz desativada");
                } else {
                  startListening();
                  if (isTalkBackEnabled) speak("Digitação por voz ativada. Pode falar.");
                }
              }}
              className={`absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg transition-all flex items-center justify-center ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-primary hover:bg-blue-200'
              }`}
              title="Descrever por voz (IA)"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={async () => {
                setIzaError(null);
                setIzaSummary(null);
                setIzaCategory(null);
                const input = text.trim();
                if (!input || input.length < 10) {
                  setIzaError('Escreva ao menos uma frase para análise.');
                  return;
                }
                setIzaLoading(true);
                const res = await participaApi.analyzeWithIZA({ text: input });
                if (res.ok) {
                  setIzaSummary(res.data.summary);
                  setIzaCategory(res.data.category || null);
                } else {
                  if (res.error === 'NO_BASE_URL') {
                    const s = input.length > 200 ? `${input.slice(0, 200)}…` : input;
                    let cat = 'Geral';
                    const l = input.toLowerCase();
                    if (l.includes('denúncia') || l.includes('irregular')) cat = 'Denúncia';
                    else if (l.includes('reclama') || l.includes('insatisfa')) cat = 'Reclamação';
                    else if (l.includes('solicita') || l.includes('pedido')) cat = 'Solicitação';
                    else if (l.includes('sugest')) cat = 'Sugestão';
                    else if (l.includes('elogio')) cat = 'Elogio';
                    setIzaSummary(`Resumo automático: ${s}`);
                    setIzaCategory(cat);
                  } else {
                    setIzaError(`Falha na análise: ${res.error}`);
                  }
                }
                setIzaLoading(false);
              }}
              className="px-3 py-2 rounded-lg bg-blue-100 text-[#1351B4] hover:bg-blue-200 transition-colors font-semibold"
            >
              Assistente IZA
            </button>
            <div aria-live="polite" className="space-y-2">
              {izaLoading && <div className="text-sm text-gray-600">Analisando...</div>}
              {izaError && <div className="text-sm text-red-600">{izaError}</div>}
              {(izaSummary || izaCategory) && (
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  {izaSummary && <div className="text-sm text-gray-800"><strong>Resumo:</strong> {izaSummary}</div>}
                  {izaCategory && <div className="text-xs text-gray-600 mt-1"><strong>Categoria:</strong> {izaCategory}</div>}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do áudio (acessibilidade)</label>
            <textarea
              value={audioDescription}
              onChange={(e) => setAudioDescription(e.target.value)}
              onFocus={() => { if (isTalkBackEnabled) speak('Descrição do áudio, acessibilidade'); }}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900"
              placeholder="Descreva brevemente o conteúdo do áudio"
            />
          </div>
        </div>
      );
    }
    if (type === 'audio') {
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Áudio</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4">
            {audioUrl ? (
              <div className="w-full">
                <audio src={audioUrl} controls className="w-full" />
                <button 
                  type="button"
                  onClick={() => setAudioUrl(null)}
                  className="mt-2 text-red-500 text-sm hover:underline"
                >
                  Gravar novamente
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                      if (isTalkBackEnabled) speak("Gravação de áudio finalizada");
                    } else {
                      startRecording();
                      if (isTalkBackEnabled) speak("Gravação de áudio iniciada");
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-blue-600'
                  }`}
                >
                  <Mic className="w-10 h-10 text-white" />
                </button>
                <p className="text-gray-500">
                  {isRecording ? 'Gravando... Toque para parar' : 'Toque para começar a gravar'}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    if (type === 'video') {
      return (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Vídeo</span>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => videoAttachRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-semibold text-gray-900">Anexar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCameraMode('video');
                  setShowCamera(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-sm font-semibold">Usar câmera</span>
              </button>
            </div>
            <input
              ref={videoAttachRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoFiles}
              className="hidden"
            />
            <input
              ref={videoCameraRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleVideoFiles}
              className="hidden"
            />
            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {videoPreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <video src={src} controls className="rounded-lg max-h-40 w-full bg-black" />
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                      title="Excluir vídeo"
                      aria-label="Excluir vídeo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do vídeo (acessibilidade)</label>
              <textarea
                value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              onFocus={() => { if (isTalkBackEnabled) speak('Descrição do vídeo, acessibilidade'); }}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 bg-white"
              placeholder="Descreva brevemente o conteúdo do vídeo"
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Image className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">Foto</span>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => imageAttachRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">Anexar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraMode('image');
                setShowCamera(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-semibold">Usar câmera</span>
            </button>
          </div>
          <input
            ref={imageAttachRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageFiles}
            className="hidden"
          />
          <input
              ref={imageCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageFiles}
              className="hidden"
            />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`Foto ${i+1}`} className="rounded-lg h-32 w-full object-cover bg-gray-100" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    title="Excluir foto"
                    aria-label="Excluir foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição das imagens (acessibilidade)</label>
            <textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              onFocus={() => { if (isTalkBackEnabled) speak('Descrição das imagens, acessibilidade'); }}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900"
              placeholder="Descreva brevemente o conteúdo das imagens anexadas"
            />
          </div>
        </div>
      </div>
    );
  };

  const addType = (t: MediaType) => {
    setVisibleTypes(prev => {
      const next = new Set(prev);
      next.add(t);
      return next;
    });
    setShowAddMenu(false);
    if (isTalkBackEnabled) speak(`Incluído ${t === 'audio' ? 'áudio' : t === 'video' ? 'vídeo' : t === 'image' ? 'foto' : 'texto'}`);
  };

  const removeType = (t: MediaType) => {
    if (t === primaryType) return;
    setVisibleTypes(prev => {
      const next = new Set(prev);
      next.delete(t);
      return next;
    });
    if (t === 'audio') setAudioUrl(null);
    if (t === 'image') {
      setImages([]);
      setImagePreviews([]);
    }
    if (t === 'video') {
      setVideos([]);
      setVideoPreviews([]);
    }
    if (t === 'text') setText('');
    if (isTalkBackEnabled) speak(`Removido ${t === 'audio' ? 'áudio' : t === 'video' ? 'vídeo' : t === 'image' ? 'foto' : 'texto'}`);
  };

  const handleCameraCapture = async (file: File) => {
    if (cameraMode === 'image') {
      setImages(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
      setLocationError(null);
      const gps = await extractGPSFromImage(file);
      if (gps) {
        setLocation({ lat: gps.lat, lng: gps.lng, source: 'exif' });
      }
    } else {
      setVideos(prev => [...prev, file]);
      setVideoPreviews(prev => [...prev, URL.createObjectURL(file)]);
    }
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setLocationError(null);
    if (files[0]) {
      const gps = await extractGPSFromImage(files[0]);
      if (gps) {
        setLocation({ lat: gps.lat, lng: gps.lng, source: 'exif' });
      }
    }
    e.target.value = '';
  };

  const handleVideoFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setVideos(prev => [...prev, ...files]);
    setVideoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };



  const detectLocation = () => {
    setLocationError(null);
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocalização não suportada neste dispositivo.');
      if (isTalkBackEnabled) speak('Geolocalização não suportada neste dispositivo.');
      return;
    }
    if (isTalkBackEnabled) speak('Detectando sua localização.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'geolocation' });
        if (isTalkBackEnabled) speak('Localização detectada.');
      },
      (err) => {
        let msg = 'Falha ao obter localização.';
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            msg = 'Permissão de localização negada. Verifique se o acesso à localização está permitido no seu navegador.';
            break;
          case 2: // POSITION_UNAVAILABLE
            msg = 'Informações de localização indisponíveis. Verifique se o GPS está ativado.';
            break;
          case 3: // TIMEOUT
            msg = 'O tempo para obter a localização esgotou. Tente novamente.';
            break;
          default:
            msg = 'Ocorreu um erro desconhecido ao obter a localização. Tente digitar o endereço manualmente.';
        }
        setLocationError(msg);
        if (isTalkBackEnabled) speak(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProtocol = `PDF-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
    setProtocol(newProtocol);
    
    // Save to protocol history (list of strings)
    try {
      const key = 'protocolHistory';
      const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      localStorage.setItem(key, JSON.stringify([newProtocol, ...prev].slice(0, 50)));
    } catch (err) {
      console.error('Erro ao salvar histórico de protocolos:', err);
    }

    let audioBlob: Blob | null = null;
    if (audioUrl) {
      try {
        const r = await fetch(audioUrl);
        audioBlob = await r.blob();
      } catch (e) {
        console.error("Failed to fetch audio blob", e);
      }
    }

    const manifest: ManifestRecord = {
      protocol: newProtocol,
      when: new Date().toISOString(),
      isAnonymous,
      title,
      text,
      audioUrl,
      audioDescription,
      imagesCount: images.length,
      imageDescription,
      videosCount: videos.length,
      videoDescription,
      location,
      address: address || null,
      imageFiles: images,
      videoFiles: videos,
      audioFile: audioBlob
    };

    // Save full manifestation details to DB
    try {
      await db.saveManifestation(manifest);
    } catch (err) {
      console.error('Erro ao salvar detalhes da manifestação no DB:', err);
    }

    // Save full manifestation details to localStorage (legacy/fallback, excluding heavy files)
    try {
      const mKey = 'manifestations';
      let mPrev: ManifestRecord[] = [];
      try {
        const stored = localStorage.getItem(mKey);
        if (stored) {
          mPrev = JSON.parse(stored);
          if (!Array.isArray(mPrev)) mPrev = [];
        }
      } catch {
        mPrev = [];
      }

      // Create a copy without the files for localStorage to avoid quota issues
      const manifestForStorage = { ...manifest };
      delete manifestForStorage.imageFiles;
      delete manifestForStorage.videoFiles;
      delete manifestForStorage.audioFile;
      
      localStorage.setItem(mKey, JSON.stringify([manifestForStorage, ...mPrev].slice(0, 200)));
    } catch (err) {
      console.error('Erro ao salvar detalhes da manifestação:', err);
      // Try to clean up storage if full?
    }
    try {
      const payload = {
        protocol: newProtocol,
        when: new Date().toISOString(),
        isAnonymous,
        title,
        text,
        audioUrl,
        audioDescription,
        images: imagePreviews,
        imageDescription,
        videos: videoPreviews,
        videoDescription,
        location: location ? { lat: location.lat, lng: location.lng } : null,
        address: address || null,
      };
      participaApi.sendManifestation(payload);
    } catch (err) {
      console.error('Falha ao enviar para API Participa DF:', err);
    }
    if (isTalkBackEnabled) {
      const msg = new SpeechSynthesisUtterance(`Manifestação enviada com sucesso. Seu protocolo é ${newProtocol}`);
      msg.lang = 'pt-BR';
      window.speechSynthesis.speak(msg);
    }
  };

  if (protocol) {
    return (
      <div className="text-center p-8 space-y-6 animate-in fade-in zoom-in" aria-live="polite" role="status">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Send className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Manifestação Recebida!</h2>
        <p className="text-gray-600">Sua voz foi ouvida. Acompanhe pelo protocolo abaixo:</p>
        
        <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <span className="block text-sm text-gray-500 uppercase tracking-wider">Protocolo</span>
          <span className="text-3xl font-mono font-bold text-primary tracking-widest">{protocol}</span>
        </div>

        <button 
          onClick={() => {
            if (isTalkBackEnabled) speak("Voltando para a tela inicial");
            navigate('/home');
          }}
          className="w-full py-3 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => {
            if (isTalkBackEnabled) speak("Voltando para a tela inicial");
            navigate('/home');
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors !border-none no-border"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <h2 className="text-2xl font-bold text-gray-800">Nova Manifestação</h2>
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <div>
          <span className="block text-sm text-gray-500">Formato principal</span>
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            {primaryType === 'audio' && <Mic className="w-5 h-5 text-blue-600" />}
            {primaryType === 'video' && <Video className="w-5 h-5 text-green-600" />}
            {primaryType === 'image' && <Image className="w-5 h-5 text-pink-600" />}
            {primaryType === 'text' && <FileText className="w-5 h-5 text-orange-600" />}
            <span className="capitalize">{primaryType === 'image' ? 'foto' : primaryType}</span>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowAddMenu(s => {
                const next = !s;
                if (isTalkBackEnabled) speak(next ? 'Abrindo menu incluir mais.' : 'Fechando menu incluir mais.');
                return next;
              });
            }}
            className="px-3 py-2 rounded-lg bg-blue-100 text-[#1351B4] hover:bg-blue-200 transition-colors font-semibold"
            aria-expanded={showAddMenu}
          >
            Incluir mais
          </button>
          {showAddMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10 w-56">
              {(['video','image','text','audio'] as MediaType[])
                .filter(t => !visibleTypes.has(t))
                .map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addType(t)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-left text-gray-800 menu-item-hover !border-none"
                  >
                    {t === 'video' && <Video className="w-5 h-5 text-green-600" />}
                    {t === 'image' && <Image className="w-5 h-5 text-pink-600" />}
                    {t === 'text' && <FileText className="w-5 h-5 text-orange-600" />}
                    {t === 'audio' && <Mic className="w-5 h-5 text-blue-600" />}
                    <span className="capitalize">{t === 'image' ? 'foto' : t}</span>
                  </button>
                ))}
              {(['video','image','text','audio'] as MediaType[]).every(t => visibleTypes.has(t)) && (
                <div className="text-xs text-gray-500 px-2 py-1">Todos os formatos já incluídos</div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Chips dos formatos incluídos, abaixo do formato principal */}
      <div className="flex flex-wrap gap-2 mt-2">
        {(['video','image','text','audio'] as MediaType[])
          .filter(t => t !== primaryType && visibleTypes.has(t))
          .map(t => (
            <div key={t} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-800">
              {t === 'video' && <Video className="w-4 h-4 text-green-600" />}
              {t === 'image' && <Image className="w-4 h-4 text-pink-600" />}
              {t === 'text' && <FileText className="w-4 h-4 text-orange-600" />}
              {t === 'audio' && <Mic className="w-4 h-4 text-blue-600" />}
              <span className="text-sm capitalize">{t === 'image' ? 'foto' : t}</span>
              <button
                type="button"
                onClick={() => removeType(t)}
                className="p-1 rounded hover:bg-gray-200"
                title="Remover"
                aria-label={`Remover ${t}`}
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-2">
          <label htmlFor="title-input" className="block text-sm font-medium text-gray-700">Título da denúncia</label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.setCustomValidity('');
            }}
            onFocus={() => { if (isTalkBackEnabled) speak('Título da denúncia, obrigatório'); }}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha este campo.')}
            placeholder="Ex.: Buraco na via principal da quadra 210"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900"
            required
            aria-label="Título da denúncia"
          />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {(() => {
            const NON_TEXT_TYPES = ['audio', 'video', 'image'] as const;
            const afterPrimary: MediaType[] = NON_TEXT_TYPES.filter(
              (t) => t !== primaryType && visibleTypes.has(t)
            );
            const ordered: MediaType[] = [];
            if (visibleTypes.has(primaryType)) ordered.push(primaryType);
            if (primaryType !== 'text' && visibleTypes.has('text')) ordered.push('text');
            ordered.push(...afterPrimary);
            if (primaryType === 'text') {
              const rest: MediaType[] = NON_TEXT_TYPES.filter((t) => visibleTypes.has(t));
              return (<>{(['text', ...rest] as MediaType[]).map((t) => <div key={t}>{renderSection(t)}</div>)}</>);
            }
            return (<>{ordered.map((t) => <div key={t}>{renderSection(t)}</div>)}</>);
          })()}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <label htmlFor="address-input" className="flex items-center gap-2 cursor-pointer">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Localização do Problema</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { if (isTalkBackEnabled) speak('Detectando sua localização.'); setShowLocationConfirm(true); }}
              className="px-3 py-2 rounded-lg bg-blue-100 text-[#1351B4] hover:bg-blue-200 transition-colors"
            >
              Detectar minha localização
            </button>
            <span className="text-xs text-gray-500">ou informe manualmente</span>
          </div>
          <input
            id="address-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => { if (isTalkBackEnabled) speak('Localização do problema, opcional'); }}
            placeholder="Ex.: Samambaia, Qd 210, próximo à escola..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900"
            aria-label="Descrição da localização"
          />
          {location && (
            <div className="text-sm text-gray-700">
              Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)} ({location.source})
              {' '}
              <a
                href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`}
                target="_blank"
                rel="noopener"
                className="text-primary font-semibold hover:underline"
              >
                abrir mapa
              </a>
            </div>
          )}
          {locationError && (
            <div className="mt-2">
              <p className="text-sm text-red-600 mb-1">{locationError}</p>
              <button
                type="button"
                onClick={() => setShowLocationConfirm(true)}
                className="text-sm font-semibold text-primary underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
          <div>
            <span className="block font-semibold text-gray-800">Modo Anônimo</span>
            <span className="text-sm text-gray-500">Não revelar minha identidade</span>
          </div>
          <button
            type="button"
            onClick={() => { const next = !isAnonymous; setIsAnonymous(next); if (isTalkBackEnabled) speak(next ? 'Modo anônimo ativado' : 'Modo anônimo desativado'); }}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${
              isAnonymous ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
              isAnonymous ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          Enviar Manifestação
        </button>
      </form>
      <CameraCapture
        isOpen={showCamera}
        mode={cameraMode}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
      {showLocationConfirm && (
          <ConfirmModal
            isOpen={showLocationConfirm}
            title="Ativar Localização?"
            message="Para identificar o local do problema, precisamos acessar sua localização. Deseja permitir?"
            confirmLabel="Sim, ativar"
            cancelLabel="Não"
            onConfirm={() => {
              setShowLocationConfirm(false);
              detectLocation();
            }}
            onCancel={() => {
              setShowLocationConfirm(false);
              if (isTalkBackEnabled) speak('Permissão negada pelo usuário.');
            }}
          />
        )}

        {deleteConfirmation && (
          <ConfirmModal
            isOpen={deleteConfirmation.isOpen}
            title={`Excluir ${deleteConfirmation.type === 'video' ? 'vídeo' : 'foto'}?`}
            message={`Tem certeza que deseja excluir est${deleteConfirmation.type === 'video' ? 'e' : 'a'} ${deleteConfirmation.type === 'video' ? 'vídeo' : 'foto'}?`}
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirmation(null)}
          />
        )}
    </div>
  );
};

async function extractGPSFromImage(file: File): Promise<{ lat: number; lng: number } | null> {
  try {
    const buf = await file.arrayBuffer();
    const view = new DataView(buf);
    // Find APP1 Exif segment
    let offset = 2; // skip SOI 0xFFD8
    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset, false);
      const len = view.getUint16(offset + 2, false);
      if (marker === 0xFFE1) {
        // Check 'Exif\0\0'
        const exifStr = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7)
        );
        if (exifStr === 'Exif') {
          const tiffStart = offset + 10;
          const little = view.getUint16(tiffStart, false) === 0x4949;
          const getUint32 = (pos: number) => view.getUint32(pos, little);
          const ifd0Offset = getUint32(tiffStart + 4) + tiffStart;
          const gpsPtr = findTag(view, ifd0Offset, little, 0x8825);
          if (!gpsPtr) break;
          const gpsIfdOffset = gpsPtr.value + tiffStart;
          const latRefEntry = findTag(view, gpsIfdOffset, little, 0x0001);
          const latEntry = findTag(view, gpsIfdOffset, little, 0x0002);
          const lonRefEntry = findTag(view, gpsIfdOffset, little, 0x0003);
          const lonEntry = findTag(view, gpsIfdOffset, little, 0x0004);
          if (latEntry && lonEntry && latRefEntry && lonRefEntry) {
            const lat = readDMSRational(view, tiffStart, latEntry, little);
            const lon = readDMSRational(view, tiffStart, lonEntry, little);
            const latSign = readAsciiRef(view, tiffStart, latRefEntry) === 'S' ? -1 : 1;
            const lonSign = readAsciiRef(view, tiffStart, lonRefEntry) === 'W' ? -1 : 1;
            if (lat !== null && lon !== null) {
              return { lat: latSign * lat, lng: lonSign * lon };
            }
          }
        }
      }
      offset += 2 + len;
    }
    return null;
  } catch {
    return null;
  }
}

function findTag(view: DataView, ifdOffset: number, little: boolean, tagId: number): { type: number; num: number; value: number } | null {
  const count = view.getUint16(ifdOffset, little);
  for (let i = 0; i < count; i++) {
    const base = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(base, little);
    if (tag === tagId) {
      const type = view.getUint16(base + 2, little);
      const num = view.getUint32(base + 4, little);
      const valueOrOffset = view.getUint32(base + 8, little);
      return { type, num, value: valueOrOffset };
    }
  }
  return null;
}

function readDMSRational(view: DataView, tiffStart: number, entry: { type: number; num: number; value: number }, little: boolean): number | null {
  if (entry.type !== 5 || entry.num < 3) return null;
  const pos = tiffStart + entry.value;
  const readRat = (p: number) => {
    const num = view.getUint32(p, little);
    const den = view.getUint32(p + 4, little);
    return den ? num / den : 0;
  };
  const deg = readRat(pos);
  const min = readRat(pos + 8);
  const sec = readRat(pos + 16);
  return deg + (min / 60) + (sec / 3600);
}

function readAsciiRef(view: DataView, tiffStart: number, entry: { type: number; num: number; value: number }): string {
  if (entry.type !== 2 || entry.num < 1) return 'N';
  const pos = tiffStart + entry.value;
  const charCode = view.getUint8(pos);
  return String.fromCharCode(charCode).toUpperCase();
}
