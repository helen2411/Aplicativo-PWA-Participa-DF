import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, Video, Image, FileText, ArrowLeft, Send, MicOff, MapPin, Trash2, Camera, Paperclip } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAccessibility } from '../hooks/useAccessibility';
import { participaApi } from '../services/participaApi';

type GPSLocation = { lat: number; lng: number; source: 'geolocation' | 'exif' | 'manual' };
type MediaType = 'text' | 'audio' | 'image' | 'video';

export const ManifestationForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isTalkBackEnabled, speak } = useAccessibility();
  const primaryType: MediaType = (params.get('type') as MediaType) || 'text';

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<MediaType>>(new Set<MediaType>([primaryType]));
  const [showAddMenu, setShowAddMenu] = useState(false);

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
  const imageAttachRef = useRef<HTMLInputElement>(null);
  const imageCameraRef = useRef<HTMLInputElement>(null);
  const videoAttachRef = useRef<HTMLInputElement>(null);
  const videoCameraRef = useRef<HTMLInputElement>(null);
  const imageCameraVideoRef = useRef<HTMLVideoElement>(null);
  const videoCameraVideoRef = useRef<HTMLVideoElement>(null);
  const [imageCameraActive, setImageCameraActive] = useState(false);
  const [videoCameraActive, setVideoCameraActive] = useState(false);
  const [imageCameraStream, setImageCameraStream] = useState<MediaStream | null>(null);
  const [videoCameraStream, setVideoCameraStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const [videoRecording, setVideoRecording] = useState(false);
  const Section = ({ type }: { type: MediaType }) => {
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
              onChange={(e) => setText(e.target.value)}
              placeholder="Descreva sua manifestação aqui..."
              className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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
              className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all flex items-center gap-2 ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-primary hover:bg-blue-200'
              }`}
              title="Descrever por voz (IA)"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-sm font-bold hidden md:inline">{isListening ? 'Ouvindo...' : 'Falar'}</span>
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
              className="px-3 py-2 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors font-semibold"
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
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
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
                <span className="text-sm font-semibold">Anexar</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (videoCameraActive) return;
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
                    setVideoCameraStream(stream);
                    setVideoCameraActive(true);
                    if (videoCameraVideoRef.current) {
                      videoCameraVideoRef.current.srcObject = stream;
                      await videoCameraVideoRef.current.play();
                    }
                    if (isTalkBackEnabled) speak('Câmera de vídeo iniciada.');
                  } catch {
                    videoCameraRef.current?.click();
                  }
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
              multiple
              onChange={handleVideoFiles}
              className="hidden"
            />
            {videoCameraActive && (
              <div className="space-y-2">
                <video ref={videoCameraVideoRef} className="w-full rounded-lg bg-black" />
                <div className="flex items-center gap-2">
                  {!videoRecording ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!videoCameraStream) return;
                        const rec = new MediaRecorder(videoCameraStream);
                        const chunks: Blob[] = [];
                        rec.ondataavailable = (e) => {
                          if (e.data && e.data.size > 0) chunks.push(e.data);
                        };
                        rec.onstop = () => {
                          const blob = new Blob(chunks, { type: 'video/webm' });
                          setVideos(prev => [...prev, new File([blob], `camera-${Date.now()}.webm`, { type: 'video/webm' })]);
                          setVideoPreviews(prev => [...prev, URL.createObjectURL(blob)]);
                        };
                        setVideoRecorder(rec);
                        rec.start();
                        setVideoRecording(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      Iniciar gravação
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        videoRecorder?.stop();
                        setVideoRecording(false);
                        if (isTalkBackEnabled) speak('Gravação de vídeo finalizada.');
                      }}
                      className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      Parar gravação
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRecorder && videoRecorder.state === 'recording') {
                        videoRecorder.stop();
                      }
                      setVideoRecording(false);
                      if (videoCameraStream) {
                        videoCameraStream.getTracks().forEach(t => t.stop());
                      }
                      setVideoCameraStream(null);
                      setVideoCameraActive(false);
                      if (isTalkBackEnabled) speak('Câmera encerrada.');
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Fechar câmera
                  </button>
                </div>
              </div>
            )}
            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {videoPreviews.map((src, i) => (
                  <video key={i} src={src} controls className="rounded-lg max-h-40" />
                ))}
              </div>
            )}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do vídeo (acessibilidade)</label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
              <span className="text-sm font-semibold">Anexar</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                if (imageCameraActive) return;
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  setImageCameraStream(stream);
                  setImageCameraActive(true);
                  if (imageCameraVideoRef.current) {
                    imageCameraVideoRef.current.srcObject = stream;
                    await imageCameraVideoRef.current.play();
                  }
                } catch {
                  imageCameraRef.current?.click();
                }
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
            multiple
            onChange={handleImageFiles}
            className="hidden"
          />
          {imageCameraActive && (
            <div className="space-y-2">
              <video ref={imageCameraVideoRef} className="w-full rounded-lg bg-black" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!imageCameraVideoRef.current) return;
                    const videoEl = imageCameraVideoRef.current;
                    const canvas = document.createElement('canvas');
                    canvas.width = videoEl.videoWidth || 1280;
                    canvas.height = videoEl.videoHeight || 720;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                    if (blob) {
                      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                      setImages(prev => [...prev, file]);
                      setImagePreviews(prev => [...prev, URL.createObjectURL(blob)]);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-blue-700"
                >
                  Capturar foto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (imageCameraStream) {
                      imageCameraStream.getTracks().forEach(t => t.stop());
                    }
                    setImageCameraStream(null);
                    setImageCameraActive(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Fechar câmera
                </button>
              </div>
            </div>
          )}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {imagePreviews.map((src, i) => (
                <img key={i} src={src} alt={`Foto ${i+1}`} className="rounded-lg max-h-32 object-contain" />
              ))}
            </div>
          )}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição das imagens (acessibilidade)</label>
            <textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
    setLocationError(null);
    if (files[0]) {
      const gps = await extractGPSFromImage(files[0]);
      if (gps) {
        setLocation({ lat: gps.lat, lng: gps.lng, source: 'exif' });
      }
    }
  };

  const handleVideoFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideos(files);
    setVideoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  useEffect(() => {
    return () => {
      try {
        imagePreviews.forEach((u) => URL.revokeObjectURL(u));
      } catch {}
    };
  }, [imagePreviews]);

  useEffect(() => {
    return () => {
      try {
        videoPreviews.forEach((u) => URL.revokeObjectURL(u));
      } catch {}
    };
  }, [videoPreviews]);

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
        setLocationError(err.message || 'Falha ao obter localização.');
        if (isTalkBackEnabled) speak('Falha ao obter localização.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProtocol = `PDF-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
    setProtocol(newProtocol);
    try {
      const key = 'protocolHistory';
      const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      localStorage.setItem(key, JSON.stringify([newProtocol, ...prev].slice(0, 50)));
      const mKey = 'manifestations';
      interface ManifestRecord {
        protocol: string;
        when: string;
        isAnonymous: boolean;
        title: string;
        text: string;
        audioUrl: string | null;
        audioDescription: string;
        imagesCount: number;
        imageDescription: string;
        videosCount: number;
        videoDescription: string;
        location: GPSLocation | null;
        address: string | null;
      }
      const mPrev = JSON.parse(localStorage.getItem(mKey) || '[]') as ManifestRecord[];
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
      };
      localStorage.setItem(mKey, JSON.stringify([manifest, ...mPrev].slice(0, 200)));
    } catch {
      // ignore storage errors
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
            navigate('/');
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
            navigate('/');
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
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
            className="px-3 py-2 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors font-semibold"
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
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-left"
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
            <div key={t} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
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
          <label className="block text-sm font-medium text-gray-700">Título da denúncia</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => { if (isTalkBackEnabled) speak('Título da denúncia, obrigatório'); }}
            placeholder="Ex.: Buraco na via principal da quadra 210"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
              return (<>{(['text', ...rest] as MediaType[]).map((t) => <Section key={t} type={t} />)}</>);
            }
            return (<>{ordered.map((t) => <Section key={t} type={t} />)}</>);
          })()}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Localização do Problema</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { if (isTalkBackEnabled) speak('Detectando sua localização.'); detectLocation(); }}
              className="px-3 py-2 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors"
            >
              Detectar minha localização
            </button>
            <span className="text-xs text-gray-500">ou informe manualmente</span>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex.: Samambaia, Qd 210, próximo à escola..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
          {locationError && <p className="text-sm text-red-600">{locationError}</p>}
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
