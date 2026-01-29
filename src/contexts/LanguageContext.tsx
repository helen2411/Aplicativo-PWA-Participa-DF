import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    // AuthGateway
    govLogin: 'Entrar com',
    govBr: 'gov.br',
    govDescription: 'Clique para criar ou acessar sua conta gov.br',
    enter: 'Entrar',
    register: 'Cadastrar',
    guestAccess: 'Continuar sem login',
    
    // Login
    welcome: 'Bem-vindo!',
    accessAccount: 'Acesse sua conta do Participa DF',
    email: 'E-mail',
    password: 'Senha',
    noAccount: 'Não tem uma conta?',
    registerLink: 'Cadastre-se',
    
    // Register
    createAccount: 'Crie sua conta',
    registerBtn: 'Cadastrar',
    joinParticipa: 'Junte-se ao Participa DF',
    fullName: 'Nome Completo',
    cpf: 'CPF',
    alreadyAccount: 'Já tem uma conta?',
    loginLink: 'Faça login',
    
    // Common
    emailPlaceholder: 'seu@email.com',
    passwordPlaceholder: '••••••••',
    namePlaceholder: 'Seu nome',
    cpfPlaceholder: '000.000.000-00',
    backToLoginOptions: 'Voltar para opções de login',
    
    // Errors/Status
    errorEmailExists: 'E-mail já cadastrado. Faça login.',
    errorAuth: 'Erro ao autenticar após cadastro.',
    errorSave: 'Falha ao salvar cadastro. Tente novamente.',
    errorInvalid: 'E-mail ou senha inválidos. Faça seu cadastro.',
    tryingLogin: 'Tentando realizar login',
    loginSuccess: 'Login realizado com sucesso',
  },
  en: {
    // AuthGateway
    govLogin: 'Login with',
    govBr: 'gov.br',
    govDescription: 'Click to create or access your gov.br account',
    enter: 'Sign In',
    register: 'Sign Up',
    guestAccess: 'Continue as Guest',
    
    // Login
    welcome: 'Welcome!',
    accessAccount: 'Access your Participa DF account',
    email: 'Email',
    password: 'Password',
    noAccount: 'Don\'t have an account?',
    registerLink: 'Sign Up',
    
    // Register
    createAccount: 'Create your account',
    registerBtn: 'Sign Up',
    joinParticipa: 'Join Participa DF',
    fullName: 'Full Name',
    cpf: 'CPF',
    alreadyAccount: 'Already have an account?',
    loginLink: 'Sign In',
    
    // Common
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: '••••••••',
    namePlaceholder: 'Your name',
    cpfPlaceholder: '000.000.000-00',
    backToLoginOptions: 'Back to login options',
    
    // Errors/Status
    errorEmailExists: 'Email already registered. Please sign in.',
    errorAuth: 'Authentication error after registration.',
    errorSave: 'Failed to save registration. Please try again.',
    errorInvalid: 'Invalid email or password. Please sign up.',
    tryingLogin: 'Attempting login',
    loginSuccess: 'Login successful',
  },
  es: {
    // AuthGateway
    govLogin: 'Entrar con',
    govBr: 'gov.br',
    govDescription: 'Haga clic para crear o acceder a su cuenta gov.br',
    enter: 'Entrar',
    register: 'Registrarse',
    guestAccess: 'Continuar sin inicio de sesión',
    
    // Login
    welcome: '¡Bienvenido!',
    accessAccount: 'Acceda a su cuenta de Participa DF',
    email: 'Correo electrónico',
    password: 'Contraseña',
    noAccount: '¿No tiene una cuenta?',
    registerLink: 'Regístrese',
    
    createAccount: 'Crear su cuenta',
    registerBtn: 'Registrarse',
    joinParticipa: 'Únase a Participa DF',
    fullName: 'Nombre Completo',
    cpf: 'CPF',
    alreadyAccount: '¿Ya tiene una cuenta?',
    loginLink: 'Inicie sesión',
    
    // Common
    emailPlaceholder: 'su@email.com',
    passwordPlaceholder: '••••••••',
    namePlaceholder: 'Su nombre',
    cpfPlaceholder: '000.000.000-00',
    backToLoginOptions: 'Volver a opciones de inicio de sesión',
    
    // Errors/Status
    errorEmailExists: 'Correo ya registrado. Inicie sesión.',
    errorAuth: 'Error de autenticación tras el registro.',
    errorSave: 'Error al guardar el registro. Inténtelo de nuevo.',
    errorInvalid: 'Correo o contraseña inválidos. Regístrese.',
    tryingLogin: 'Intentando iniciar sesión',
    loginSuccess: 'Inicio de sesión exitoso',
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['pt']) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    // Update HTML lang attribute
    const langMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
    document.documentElement.lang = langMap[language];
  }, [language]);

  const t = (key: keyof typeof translations['pt']) => {
    return translations[language][key] || translations['pt'][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
