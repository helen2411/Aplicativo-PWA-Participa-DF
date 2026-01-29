import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import participaDfLogo from '../assets/participa-df-logo-2.png';
import gdfLogo from '../assets/participa-df-logo-1.png';

export const AuthGateway = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/home';
  const { isTalkBackEnabled, speak } = useAccessibility();
  const { t } = useLanguage();

  // Redirect logic removed to ensure landing page is always visible as requested
  // User must explicitly choose to enter or register


  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 bg-[#1351B4] overflow-y-auto" style={{ backgroundColor: '#1351B4' }}>
      <LanguageSelector />
      
      {/* Header - Logo Participa DF */}
      <div className="w-full flex justify-center mt-10 mb-8">
        {participaDfLogo && <img 
          src={participaDfLogo} 
          alt="Logo Participa DF" 
          className="h-20 object-contain drop-shadow-md" 
        />}
        {!participaDfLogo && <div className="h-16 w-full text-white font-bold flex items-center justify-center">LOGO PARTICIPA DF</div>}
      </div>

      {/* Main Content - Login Options */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 flex-1 justify-center">
        
        {/* Gov.br Button */}
        <button
          onClick={() => {
            if (isTalkBackEnabled) speak(t('govLogin') + ' gov.br');
            window.location.href = 'https://sso.acesso.gov.br'; 
          }}
          className="w-full bg-white text-[#1351B4] rounded-full py-3 px-6 font-bold text-lg shadow-md hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          aria-label={t('govLogin') + ' gov.br'}
        >
          {t('govLogin')} <span className="font-extrabold italic">{t('govBr')}</span>
        </button>
        <p className="text-white/80 text-sm text-center mb-4">
          {t('govDescription')}
        </p>

        {/* Standard Login Button */}
        <button
          onClick={() => {
            if (isTalkBackEnabled) speak(t('enter'));
            navigate('/login', { state: { returnUrl } });
          }}
          className="w-full bg-white text-[#1351B4] border border-white rounded-full py-3 px-6 font-semibold shadow-sm hover:bg-gray-100 transition-all active:scale-95"
          aria-label={t('enter')}
        >
          {t('enter')}
        </button>

        {/* Register Button */}
        <button
          onClick={() => {
            if (isTalkBackEnabled) speak(t('register'));
            navigate('/cadastro');
          }}
          className="w-full bg-white text-[#1351B4] border border-white rounded-full py-3 px-6 font-medium hover:bg-gray-100 transition-all active:scale-95"
          aria-label={t('register')}
        >
          {t('register')}
        </button>

      </div>

      {/* Footer Options & Logo */}
      <div className="w-full max-w-sm flex flex-col items-center gap-8 mb-4 mt-8">
        
        {/* GDF Logo Footer */}
        <div className="mt-4 w-full flex justify-center">
          <div className="bg-[#1351B4] p-3 rounded-lg shadow-md inline-block border border-white">
            {gdfLogo && <img 
              src={gdfLogo} 
              alt="Controladoria-Geral do Distrito Federal - GDF" 
              className="h-12 object-contain"
            />}
            {!gdfLogo && <div className="h-12 w-full text-white text-xs flex items-center justify-center">LOGO GDF</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
