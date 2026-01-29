import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/participa-df-logo-2.png';
import { useAccessibility } from '../hooks/useAccessibility';
import { useLanguage } from '../contexts/LanguageContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { isTalkBackEnabled, speak } = useAccessibility();
  const { t } = useLanguage();

  const returnUrl = location.state?.returnUrl || '/home';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      if (isTalkBackEnabled) speak(t('tryingLogin'));
      const ok = login(email, password);
      if (ok) {
        if (isTalkBackEnabled) speak(t('loginSuccess'));
        navigate(returnUrl);
      } else {
        const errorMsg = t('errorInvalid');
        setError(errorMsg);
        if (isTalkBackEnabled) speak(errorMsg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center p-4 bg-[#1351B4] overflow-y-auto">
      <div className="w-full max-w-sm p-4 animate-in fade-in slide-in-from-bottom-4 flex flex-col justify-center min-h-screen py-6">
        <div className="text-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="focus:outline-none hover:opacity-90 transition-opacity"
            title={t('backToLoginOptions')}
          >
            <img src={logo} alt="Participa DF" className="h-10 mx-auto mb-4 object-contain drop-shadow-md" />
          </button>
          
          <h2 className="text-lg font-bold text-white mb-2">{t('welcome')}</h2>
          <p className="text-white/80 text-sm">{t('accessAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 w-full">
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
            {t('enter')}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-2 bg-red-500/20 border border-red-200/50 rounded-lg text-center">
            <p className="text-xs text-white font-medium">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-white/90">
          {t('noAccount')}{' '}
          <button 
            onClick={() => navigate('/cadastro')} 
            className="text-white font-extrabold hover:underline ml-1"
          >
            {t('registerLink')}
          </button>
        </div>
      </div>
    </div>
  );
};
