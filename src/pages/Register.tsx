import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus } from 'lucide-react';
import logo from '../assets/participa-df-logo-2.png';
import { useLanguage } from '../contexts/LanguageContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Apply mask
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{3})/, '$1.$2');
    }
    
    setCpf(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && name && cpf) {
      try {
        const usersRaw = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersRaw) as Array<{ name: string; email: string; password: string; cpf?: string }>;
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError(t('errorEmailExists'));
          return;
        }
        const newUser = { name, email, password, cpf };
        localStorage.setItem('users', JSON.stringify([...users, newUser]));
        const ok = login(email, password);
        if (ok) {
          navigate('/home');
        } else {
          setError(t('errorAuth'));
        }
      } catch {
        setError(t('errorSave'));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center p-4 bg-[#1351B4] overflow-y-auto">
      <div className="w-full max-w-sm p-4 animate-in fade-in slide-in-from-bottom-4 flex flex-col justify-center min-h-screen py-6">
        <div className="text-center mb-6">
          <button 
            onClick={() => navigate('/auth')}
            className="focus:outline-none hover:opacity-90 transition-opacity"
            title={t('backToLoginOptions')}
          >
            <img src={logo} alt="Participa DF" className="h-10 mx-auto mb-2 object-contain drop-shadow-md" />
          </button>
          
          <h2 className="text-lg font-bold text-white mb-1">{t('createAccount')}</h2>
          <p className="text-white/80 text-sm">{t('joinParticipa')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          <div>
            <label className="block text-xs font-medium text-white mb-1 ml-1">{t('fullName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border-none focus:ring-2 focus:ring-white focus:outline-none bg-white text-[#1351B4] placeholder:text-gray-400 shadow-sm text-sm"
              placeholder={t('namePlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1 ml-1">{t('cpf')}</label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              className="w-full p-2.5 rounded-xl border-none focus:ring-2 focus:ring-white focus:outline-none bg-white text-[#1351B4] placeholder:text-gray-400 shadow-sm text-sm"
              placeholder={t('cpfPlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1 ml-1">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border-none focus:ring-2 focus:ring-white focus:outline-none bg-white text-[#1351B4] placeholder:text-gray-400 shadow-sm text-sm"
              placeholder={t('emailPlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1 ml-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border-none focus:ring-2 focus:ring-white focus:outline-none bg-white text-[#1351B4] placeholder:text-gray-400 shadow-sm text-sm"
              placeholder={t('passwordPlaceholder')}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-40 mx-auto block h-10 flex items-center justify-center bg-white text-[#1351B4] rounded-full font-bold text-base hover:bg-gray-50 transition-all shadow-lg active:scale-95 mt-6 flex-shrink-0"
          >
            {t('registerBtn')}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-2 bg-red-500/20 border border-red-200/50 rounded-lg text-center">
            <p className="text-xs text-white font-medium">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-white/90">
          {t('alreadyAccount')}{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-white font-extrabold hover:underline ml-1"
          >
            {t('loginLink')}
          </button>
        </div>
      </div>
    </div>
  );
};
