import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, FileText, Image as ImageIcon, Video, Mic } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';
import type { ManifestRecord } from '../types';

export const ProtocolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isTalkBackEnabled, speak } = useAccessibility();
  const [manifestation, setManifestation] = useState<ManifestRecord | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('manifestations');
      if (stored) {
        const manifestations: ManifestRecord[] = JSON.parse(stored);
        const found = manifestations.find(m => m.protocol === id);
        if (found) {
          setManifestation(found);
          if (isTalkBackEnabled) {
            speak(`Detalhes do protocolo ${found.protocol} carregados.`);
          }
        } else {
          if (isTalkBackEnabled) {
            speak('Protocolo não encontrado.');
          }
        }
      }
    } catch (error) {
      console.error('Error loading manifestation details:', error);
    }
  }, [id]);

  if (!manifestation) {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Protocolo não encontrado</h2>
        <p className="text-gray-600">Não foi possível encontrar os detalhes para o protocolo {id}.</p>
        <button
          onClick={() => navigate('/minhas-manifestacoes')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <button 
        onClick={() => {
          if (isTalkBackEnabled) speak("Voltando para minhas manifestações");
          navigate('/minhas-manifestacoes');
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors mb-4 !border-none no-border"
        aria-label="Voltar para lista de manifestações"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-2" tabIndex={0} 
              onFocus={() => isTalkBackEnabled && speak(`Protocolo ${manifestation.protocol}`)}>
            {manifestation.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {manifestation.protocol}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(manifestation.when)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {manifestation.isAnonymous ? 'Anônimo' : 'Identificado'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section aria-labelledby="desc-section">
            <h3 id="desc-section" className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Descrição
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {manifestation.text}
            </p>
          </section>

          {(manifestation.address || manifestation.location) && (
            <section aria-labelledby="loc-section">
              <h3 id="loc-section" className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Localização
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {manifestation.address && (
                  <p className="text-gray-700 mb-1">{manifestation.address}</p>
                )}
                {manifestation.location && (
                  <p className="text-sm text-gray-500 font-mono">
                    Lat: {manifestation.location.lat.toFixed(6)}, Lng: {manifestation.location.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {manifestation.imagesCount > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Imagens ({manifestation.imagesCount})
                </h4>
                {manifestation.imageDescription && (
                  <p className="text-sm text-gray-600 italic">"{manifestation.imageDescription}"</p>
                )}
              </div>
            )}

            {manifestation.videosCount > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  Vídeos ({manifestation.videosCount})
                </h4>
                {manifestation.videoDescription && (
                  <p className="text-sm text-gray-600 italic">"{manifestation.videoDescription}"</p>
                )}
              </div>
            )}

            {(manifestation.audioUrl || manifestation.audioDescription) && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" />
                  Áudio
                </h4>
                {manifestation.audioDescription && (
                  <p className="text-sm text-gray-600 italic">"{manifestation.audioDescription}"</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Áudio gravado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
