import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export const Help = () => {
  const navigate = useNavigate();
  const { isTalkBackEnabled, speak } = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Olá! Sou a IA do Participa DF. Como posso te ajudar hoje? Você pode perguntar sobre como fazer denúncias, prazos ou sobre o aplicativo.', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<number>(2);
  const quickFAQs = [
    { q: 'Quais os tipos de manifestação?', a: 'Tipos de manifestação: Denúncia (irregularidades), Reclamação (insatisfação), Solicitação (pedido de providência), Sugestão (melhoria) e Elogio.' },
    { q: 'Como realizar uma denúncia?', a: 'Na tela inicial, escolha Áudio, Vídeo, Foto ou Texto. Você pode optar pelo envio anônimo.' },
    { q: 'Qual é o prazo de resposta?', a: 'O prazo regulamentar é de 20 dias corridos, prorrogável por mais 10 mediante justificativa.' },
    { q: 'Como funciona o protocolo?', a: 'O protocolo é gerado ao final do envio e serve para acompanhar o andamento em Minhas Manifestações.' },
    { q: 'Meus dados são coletados?', a: 'Se optar por envio anônimo, não coletamos seus dados pessoais. Caso se identifique, coletamos apenas o mínimo necessário para contato e acompanhamento.' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('tipo') || lowerInput.includes('tipos') || lowerInput.includes('quais os tipos')) {
      return "Tipos de manifestação: Denúncia (irregularidades), Reclamação (insatisfação), Solicitação (pedido de providência), Sugestão (melhoria) e Elogio.";
    }
    if (lowerInput.includes('denúncia') || lowerInput.includes('manifestação') || lowerInput.includes('reclamar')) {
      return "Para realizar uma manifestação, vá até a tela inicial e escolha o formato desejado: Áudio, Vídeo, Foto ou Texto. Você pode optar pelo envio anônimo se preferir.";
    } 
    if (lowerInput.includes('prazo') || lowerInput.includes('tempo') || lowerInput.includes('demora')) {
      return "O prazo regulamentar para resposta da Ouvidoria é de 20 dias corridos, podendo ser prorrogado por mais 10 dias mediante justificativa.";
    }
    if (lowerInput.includes('protocolo') || lowerInput.includes('acompanhar')) {
      return "O número de protocolo é gerado automaticamente ao final do envio. Você pode usá-lo para acompanhar o andamento da sua manifestação na área 'Minhas Manifestações'.";
    }
    if (lowerInput.includes('anônimo') || lowerInput.includes('sigilo') || lowerInput.includes('identificar') || lowerInput.includes('dados') || lowerInput.includes('coletados') || lowerInput.includes('privacidade')) {
      return "Sim, o sistema permite manifestações anônimas. Nesse caso, seus dados pessoais não serão solicitados ou armazenados.";
    }
    if (lowerInput.includes('cadastro') || lowerInput.includes('login') || lowerInput.includes('conta')) {
      return "Para criar uma conta ou entrar, utilize o botão de perfil no canto superior direito. O cadastro permite acompanhar todas as suas manifestações em um só lugar.";
    }
    if (lowerInput.includes('olá') || lowerInput.includes('oi') || lowerInput.includes('bom dia') || lowerInput.includes('boa tarde')) {
      return "Olá! Sou o assistente virtual do Participa DF. Estou aqui para tirar suas dúvidas sobre como usar o aplicativo e realizar manifestações.";
    }
    
    return "Posso ajudar com: como denunciar, prazos de resposta, protocolo, anonimato e tipos de manifestação.";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: idRef.current++,
      text: inputText,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponseText = getAIResponse(userMessage.text);
      
      const aiMessage: Message = {
        id: idRef.current++,
        text: aiResponseText,
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };
  
  const handleQuickAsk = (faq: { q: string; a: string }) => {
    const userMessage: Message = { id: idRef.current++, text: faq.q, sender: 'user' };
    const aiMessage: Message = { id: idRef.current++, text: faq.a, sender: 'ai' };
    setMessages(prev => [...prev, userMessage, aiMessage]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
        <button
          onClick={() => {
            if (isTalkBackEnabled) speak('Voltando');
            navigate('/home');
          }}
          className="p-2 rounded hover:bg-white/20 transition-colors !border-none no-border"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="p-2 bg-white/20 rounded-full">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold">Assistente Virtual</h2>
          <p className="text-xs text-blue-100">Inteligência Artificial do GDF</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-2 mb-2">
          {quickFAQs.map((faq) => (
            <button
              key={faq.q}
              onClick={() => handleQuickAsk(faq)}
              className="text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-colors text-sm text-gray-800"
            >
              {faq.q}
            </button>
          ))}
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua dúvida..."
          className="flex-1 p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-gray-800"
        />
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
