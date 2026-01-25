import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, UserPlus } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

export const AuthGateway = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/minhas-manifestacoes';
  const { isTalkBackEnabled, speak } = useAccessibility();

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          if (isTalkBackEnabled) speak('Voltando para validação de CPF');
          navigate(-1);
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <h2 className="text-2xl font-bold text-gray-800">Autenticação</h2>
      <p className="text-gray-600">Escolha uma opção para continuar.</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            if (isTalkBackEnabled) speak('Criar Nova Conta');
            navigate('/cadastro');
          }}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-md transition-all focus:ring-4 focus:ring-green-200 focus:outline-none active:scale-95"
          aria-label="Criar Nova Conta"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <span className="font-bold text-gray-700">Criar Nova Conta</span>
        </button>

        <button
          onClick={() => {
            if (isTalkBackEnabled) speak('Esqueci a senha');
            navigate('/login', { state: { mode: 'forgot', returnUrl } });
          }}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all focus:ring-4 focus:ring-blue-200 focus:outline-none active:scale-95"
          aria-label="Esqueci a senha"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <span className="font-bold text-gray-700">Esqueci a senha</span>
        </button>
      </div>
    </div>
  );
};

