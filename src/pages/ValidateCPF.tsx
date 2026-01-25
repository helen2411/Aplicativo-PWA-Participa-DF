import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, IdCard } from 'lucide-react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useState } from 'react';

export const ValidateCPF = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/minhas-manifestacoes';
  const { isTalkBackEnabled, speak } = useAccessibility();
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState<string | null>(null);

  const digits = cpf.replace(/\D/g, '');
  const isValidLength = digits.length === 11;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLength) {
      setError('CPF inválido. Informe 11 dígitos.');
      return;
    }
    try {
      localStorage.setItem('cpf', digits);
    } catch {
      setError('Não foi possível salvar o CPF localmente.');
    }
    if (isTalkBackEnabled) speak('CPF validado. Prosseguir para autenticação');
    navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          if (isTalkBackEnabled) speak('Voltando para direcionar usuário');
          navigate(-1);
        }}
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <div className="flex items-center gap-3">
        <IdCard className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold text-gray-800">Validar CPF</h2>
      </div>
      <p className="text-gray-600">Digite seu CPF para continuar.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          aria-invalid={!!error}
        />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!isValidLength}
        >
          Validar CPF
        </button>
      </form>
    </div>
  );
};
