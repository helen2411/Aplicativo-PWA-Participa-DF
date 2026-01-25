import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

export const MyManifestations = () => {
  const navigate = useNavigate();
  const { isTalkBackEnabled, speak } = useAccessibility();
  let protocols: string[] = [];
  try {
    protocols = JSON.parse(localStorage.getItem('protocolHistory') || '[]');
  } catch {
    protocols = [];
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
                <button 
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                  onClick={() => {
                    if (isTalkBackEnabled) speak(`Abrindo detalhes do protocolo ${p}`);
                    alert(`Em breve: detalhes do protocolo ${p}`);
                  }}
                >
                  Detalhes
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
