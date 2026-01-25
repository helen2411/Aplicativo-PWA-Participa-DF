import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus } from 'lucide-react';
import logo from '../assets/participa-df-logo.svg';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name) {
      try {
        const usersRaw = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersRaw) as Array<{ name: string; email: string; password: string }>;
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('E-mail já cadastrado. Faça login.');
          return;
        }
        const newUser = { name, email, password };
        localStorage.setItem('users', JSON.stringify([...users, newUser]));
        const ok = login(email, password);
        if (ok) {
          navigate('/');
        } else {
          setError('Erro ao autenticar após cadastro.');
        }
      } catch {
        setError('Falha ao salvar cadastro. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <img src={logo} alt="Participa DF" className="h-10 mx-auto mb-4" />
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Crie sua conta</h2>
          <p className="text-gray-600">Junte-se ao Participa DF</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Seu nome"
              required
            />
          </div>
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
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            Cadastrar
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">
            Faça login
          </button>
        </div>
      </div>
    </div>
  );
};
