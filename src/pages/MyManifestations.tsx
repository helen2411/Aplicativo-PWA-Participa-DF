import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';
import { ConfirmModal } from '../components/ConfirmModal';
import type { ManifestRecord } from '../types';

export const MyManifestations = () => {
  const navigate = useNavigate();
  const { isTalkBackEnabled, speak } = useAccessibility();
  const [protocols, setProtocols] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  useEffect(() => {
    // Load and cleanup protocols
    try {
      let loadedProtocols: string[] = JSON.parse(localStorage.getItem('protocolHistory') || '[]');
      if (!Array.isArray(loadedProtocols)) loadedProtocols = [];

      // Auto-cleanup specific broken protocols as requested
      const brokenProtocols = ['PDF-2026-169310', 'PDF-2026-384787'];
      const hasBroken = loadedProtocols.some(p => brokenProtocols.includes(p));

      if (hasBroken) {
        loadedProtocols = loadedProtocols.filter(p => !brokenProtocols.includes(p));
        localStorage.setItem('protocolHistory', JSON.stringify(loadedProtocols));
        
        // Clean details as well
        try {
          const mKey = 'manifestations';
          const storedM = localStorage.getItem(mKey);
          if (storedM) {
            let mList = JSON.parse(storedM) as ManifestRecord[];
            if (Array.isArray(mList)) {
              const newMList = mList.filter(m => !brokenProtocols.includes(m.protocol));
              localStorage.setItem(mKey, JSON.stringify(newMList));
            }
          }
        } catch (e) {
          console.error("Error cleaning manifestations details", e);
        }
      }
      
      setProtocols(loadedProtocols);
    } catch {
      setProtocols([]);
    }
  }, []);

  const handleDelete = (protocolToDelete: string) => {
    setDeleteConfirmation(protocolToDelete);
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    
    const protocolToDelete = deleteConfirmation;
    const newProtocols = protocols.filter(p => p !== protocolToDelete);
    setProtocols(newProtocols);
    localStorage.setItem('protocolHistory', JSON.stringify(newProtocols));

    // Also remove details if present
    try {
      const mKey = 'manifestations';
      const storedM = localStorage.getItem(mKey);
      if (storedM) {
        let mList = JSON.parse(storedM) as ManifestRecord[];
        if (Array.isArray(mList)) {
          const newMList = mList.filter(m => m.protocol !== protocolToDelete);
          localStorage.setItem(mKey, JSON.stringify(newMList));
        }
      }
    } catch (e) {
      console.error("Error removing details", e);
    }

    if (isTalkBackEnabled) speak('Protocolo removido do histórico.');
    setDeleteConfirmation(null);
  };

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

      <h2 className="text-2xl font-bold text-gray-800">Minhas Manifestações</h2>
      <p className="text-gray-600">Acompanhe seus protocolos enviados recentemente.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {protocols.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            Nenhum protocolo encontrado ainda.
          </div>
        ) : (
          <ul className="divide-y">
            {protocols.map((p) => (
              <li key={p} className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-sm text-gray-500 uppercase tracking-wider">Protocolo</span>
                  <span className="font-mono font-bold text-primary">{p}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:border-primary hover:text-primary transition-colors"
                    onClick={() => {
                      if (isTalkBackEnabled) speak(`Abrindo detalhes do protocolo ${p}`);
                      navigate(`/protocolo/${p}`);
                    }}
                    aria-label={`Ver detalhes do protocolo ${p}`}
                  >
                    Detalhes
                  </button>
                  <button 
                    className="px-3 py-2 text-sm rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                    onClick={() => handleDelete(p)}
                    aria-label={`Excluir protocolo ${p}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteConfirmation && (
        <ConfirmModal
          isOpen={!!deleteConfirmation}
          title="Excluir protocolo?"
          message="Tem certeza que deseja excluir este protocolo do histórico? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
};
