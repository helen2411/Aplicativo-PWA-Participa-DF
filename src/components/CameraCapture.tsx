import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, Video, RefreshCw, StopCircle } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

interface CameraCaptureProps {
  mode: 'image' | 'video';
  isOpen: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ mode, isOpen, onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { isTalkBackEnabled, speak } = useAccessibility();

  // Keep streamRef in sync with stream state for cleanup
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle visibility and mode changes
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.enabled = false);
      }
      if (isRecording) {
        stopRecordingVideo();
      }
      return;
    }

    const initCamera = async () => {
      setLoading(true);
      if (!stream) {
        await startCamera();
      } else {
        // Check if we need to upgrade to audio (if mode is video but stream has no audio)
        const hasAudio = stream.getAudioTracks().length > 0;
        if (mode === 'video' && !hasAudio) {
          await startCamera();
        } else {
          // Resume existing stream
          stream.getTracks().forEach(track => track.enabled = true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          if (isTalkBackEnabled) speak(`Câmera retomada. Modo ${mode === 'image' ? 'foto' : 'vídeo'}.`);
        }
      }
      setLoading(false);
    };

    initCamera();
  }, [isOpen, mode]);

  // Handle facing mode changes
  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
  }, [facingMode]);

  const startCamera = async () => {
    // Stop previous stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: facingMode }
      };
      
      if (mode === 'video') {
        constraints.audio = true; 
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
      if (isTalkBackEnabled) speak(`Câmera iniciada. Modo ${mode === 'image' ? 'foto' : 'vídeo'}.`);
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      // Fallback for notebooks/desktops that might not have 'environment' camera
      if (err.name === 'OverconstrainedError' && facingMode === 'environment') {
         console.log('Falling back to user camera');
         setFacingMode('user');
         return;
      }
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      if (isTalkBackEnabled) speak('Erro ao acessar câmera. Verifique as permissões.');
    } finally {
      setLoading(false);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isTalkBackEnabled) speak('Trocando câmera.');
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            if (isTalkBackEnabled) speak('Foto capturada.');
            onClose();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const startRecordingVideo = () => {
    if (stream && MediaRecorder.isTypeSupported('video/webm')) {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        onCapture(file);
        if (isTalkBackEnabled) speak('Vídeo gravado e salvo.');
        onClose();
      };

      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
      if (isTalkBackEnabled) speak('Gravação de vídeo iniciada.');
    } else {
        setError('Gravação de vídeo não suportada neste navegador.');
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (isTalkBackEnabled) speak('Parando gravação.');
    }
  };

  if (!isOpen) return <div className="hidden" />;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {error ? (
        <div className="text-white p-6 text-center">
            <p className="mb-4 text-xl">{error}</p>
            <button 
                onClick={onClose}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold"
            >
                Fechar
            </button>
        </div>
      ) : (
        <>
            <div className="relative w-full h-full flex items-center justify-center bg-black">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="max-w-full max-h-full object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    aria-label="Fechar câmera"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Switch Camera */}
                <button 
                    onClick={switchCamera}
                    className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    aria-label="Trocar câmera"
                >
                    <RefreshCw className="w-6 h-6" />
                </button>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 w-full flex justify-center items-center gap-8">
                {mode === 'image' ? (
                    <button
                        onClick={handleCaptureImage}
                        className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
                        aria-label="Tirar foto"
                    >
                        <Camera className="w-10 h-10 text-black" />
                    </button>
                ) : (
                    <>
                        {!isRecording ? (
                            <button
                                onClick={startRecordingVideo}
                                className="w-20 h-20 bg-red-600 rounded-full border-4 border-white flex items-center justify-center hover:bg-red-700 active:scale-95 transition-transform"
                                aria-label="Gravar vídeo"
                            >
                                <Video className="w-10 h-10 text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={stopRecordingVideo}
                                className="w-20 h-20 bg-white rounded-full border-4 border-red-600 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform animate-pulse"
                                aria-label="Parar gravação"
                            >
                                <StopCircle className="w-10 h-10 text-red-600" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </>
      )}
    </div>
  );
};
