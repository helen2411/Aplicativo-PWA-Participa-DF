import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';

export const AccountDirect = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/minhas-manifestacoes';
  const { isTalkBackEnabled, speak } = useAccessibility();

  const choosePF = () => {
    if (isTalkBackEnabled) speak('Selecionado Pessoa Física');
    navigate(`/conta/validar-cpf?returnUrl=${encodeURIComponent(returnUrl)}&modoValidacao=0`);
  };
  const choosePJ = () => {
    if (isTalkBackEnabled) speak('Selecionado Pessoa Jurídica');
    alert('Em breve: validação de CNPJ');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          if (isTalkBackEnabled) speak('Voltando para a tela inicial');
          navigate('/');
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <h2 className="text-2xl font-bold text-gray-800">Direcionar Usuário</h2>
      <p className="text-gray-600">Escolha o tipo de pessoa para continuar.</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={choosePF}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all focus:ring-4 focus:ring-blue-200 focus:outline-none active:scale-95"
          aria-label="Pessoa Física"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <span className="font-bold text-gray-700">Pessoa Física</span>
        </button>

        <button
          onClick={choosePJ}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-md transition-all focus:ring-4 focus:ring-green-200 focus:outline-none active:scale-95"
          aria-label="Pessoa Jurídica"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <span className="font-bold text-gray-700">Pessoa Jurídica</span>
        </button>
      </div>
    </div>
  );
};

