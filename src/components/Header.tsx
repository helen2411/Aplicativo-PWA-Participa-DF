import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/participa-df-logo-2.png';

export const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <header className="bg-primary text-white p-2 shadow-md sticky top-0 z-50" role="banner">
      <div className="flex justify-between items-center">
        <img
          src={logo}
          alt="Participa DF"
          className="h-10 cursor-pointer"
          onClick={() => navigate('/home')}
        />
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-semibold"
          aria-label="Sair"
        >
          Sair
        </button>
      </div>
    </header>
  );
};
