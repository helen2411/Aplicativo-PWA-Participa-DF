import { useNavigate } from 'react-router-dom';
import { Mic, Video, Image, FileText } from 'lucide-react';
import logo from '../assets/participa-df-logo.svg';
import { useAccessibility } from '../hooks/useAccessibility';

export const Home = () => {
  const navigate = useNavigate();
  const { isTalkBackEnabled, speak } = useAccessibility();

  const handleNavigate = (type: string) => {
    if (isTalkBackEnabled) {
      const label = type === 'audio' ? 'Áudio' : type === 'video' ? 'Vídeo' : type === 'image' ? 'Foto' : 'Texto';
      speak(`Selecionado ${label}. Abrindo formulário.`);
    }
    navigate(`/manifestar?type=${type}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-center">
        <img src={logo} alt="Participa DF" className="h-10" />
      </div>
      <section className="text-center py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Olá, cidadão! 👋</h2>
        <p className="text-gray-600">Como você gostaria de fazer sua manifestação hoje?</p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleNavigate('audio')}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all focus:ring-4 focus:ring-blue-200 focus:outline-none group active:scale-95"
          aria-label="Registrar manifestação por Áudio"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
          <span className="font-bold text-gray-700">Áudio</span>
        </button>

        <button 
          onClick={() => handleNavigate('video')}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-md transition-all focus:ring-4 focus:ring-green-200 focus:outline-none group active:scale-95"
          aria-label="Registrar manifestação por Vídeo"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
            <Video className="w-8 h-8 text-green-600" />
          </div>
          <span className="font-bold text-gray-700">Vídeo</span>
        </button>
        
        <button 
          onClick={() => handleNavigate('image')}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:shadow-md transition-all focus:ring-4 focus:ring-purple-200 focus:outline-none group active:scale-95"
          aria-label="Registrar manifestação por Foto"
        >
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <Image className="w-8 h-8 text-purple-600" />
          </div>
          <span className="font-bold text-gray-700">Foto</span>
        </button>

        <button 
          onClick={() => handleNavigate('text')}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-orange-500 hover:shadow-md transition-all focus:ring-4 focus:ring-orange-200 focus:outline-none group active:scale-95"
          aria-label="Registrar manifestação por Texto"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <span className="font-bold text-gray-700">Texto</span>
        </button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">Precisa de ajuda?</h3>
        <p className="text-sm text-blue-700">
          Nossa Inteligência Artificial está pronta para auxiliar você.
          <button 
            onClick={() => {
              if (isTalkBackEnabled) speak("Abrindo assistente virtual.");
              navigate('/ajuda');
            }}
            className="block mt-2 font-bold underline hover:text-blue-900"
          >
            Ativar Assistente Virtual
          </button>
        </p>
      </div>
      
      <button
        onClick={() => {
          if (isTalkBackEnabled) speak("Abrindo Minhas Manifestações");
          navigate('/minhas-manifestacoes');
        }}
        className="w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-colors"
        aria-label="Acessar Minhas Manifestações e protocolos"
      >
        <div>
          <h3 className="font-semibold text-gray-800">Minhas Manifestações</h3>
          <p className="text-sm text-gray-600">Veja histórico e protocolos enviados</p>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <FileText className="w-7 h-7 text-gray-700" />
        </div>
      </button>

      <button
        onClick={() => {
          if (isTalkBackEnabled) speak("Abrindo Acesso à Informação");
          navigate('/acesso-informacao');
        }}
        className="w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-colors"
        aria-label="Acesso à Informação"
      >
        <div>
          <h3 className="font-semibold text-gray-800">Acesso à Informação</h3>
          <p className="text-sm text-gray-600">Canais de registro, prazos e portais oficiais</p>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <FileText className="w-7 h-7 text-gray-700" />
        </div>
      </button>
    </div>
  );
};
