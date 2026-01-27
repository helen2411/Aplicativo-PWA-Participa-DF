import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';
import  from '../assets/participa-df-logo.svg';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const ok = login(email, password);
      if (ok) {
        navigate('/');
      } else {
        setError('E-mail ou senha inválidos. Faça seu cadastro.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <img src={logo} alt="Participa DF" className="h-10 mx-auto mb-4" />
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo de volta!</h2>
          <p className="text-gray-600">Acesse sua conta do Participa DF</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <button onClick={() => navigate('/cadastro')} className="text-primary font-bold hover:underline">
            Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
};
