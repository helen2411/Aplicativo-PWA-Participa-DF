import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ManifestationForm } from './pages/ManifestationForm';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Help } from './pages/Help';
import { MyManifestations } from './pages/MyManifestations';
import { ProtocolDetails } from './pages/ProtocolDetails';
import { AccessInfo } from './pages/AccessInfo';
import { AccountDirect } from './pages/AccountDirect';
import { ValidateCPF } from './pages/ValidateCPF';
import { AuthGateway } from './pages/AuthGateway';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <Layout>
              <Routes>
              <Route path="/" element={<AuthGateway />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/manifestar" element={<ManifestationForm />} />
              <Route path="/ajuda" element={<Help />} />
              <Route path="/minhas-manifestacoes" element={<MyManifestations />} />
              <Route path="/protocolo/:id" element={<ProtocolDetails />} />
              <Route path="/acesso-informacao" element={<AccessInfo />} />
              <Route path="/conta/direcionar-usuario" element={<AccountDirect />} />
              <Route path="/conta/validar-cpf" element={<ValidateCPF />} />
              <Route path="/auth" element={<AuthGateway />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
