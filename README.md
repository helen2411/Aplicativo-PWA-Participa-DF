# Aplicativo PWA - Participa DF

O **Participa DF** é um aplicativo web progressivo (PWA) desenvolvido para facilitar a comunicação entre os cidadãos e o Governo do Distrito Federal (GDF). Ele permite o registro de manifestações (denúncias, reclamações, sugestões, elogios) de forma acessível, inclusiva e eficiente, utilizando recursos modernos como inteligência artificial e geolocalização.

## 📱 Principais Funcionalidades

### 1. Multicanalidade de Envio
O cidadão pode registrar manifestações através de diversos formatos:
- **Texto:** Digitação direta ou transcrição de voz (Speech-to-Text).
- **Áudio:** Gravação de relatos por voz diretamente no app.
- **Imagem:** Envio de fotos com extração automática de coordenadas GPS (EXIF).
- **Vídeo:** Gravação ou upload de vídeos evidenciando o problema.

### 2. Acessibilidade e Inclusão (Prioridade)
O aplicativo foi desenhado seguindo as diretrizes WCAG 2.1 AA:
- **Leitor de Tela (TTS):** Feedback auditivo para ações, navegação e preenchimento de formulários (compatível com TalkBack).
- **Comandos de Voz:** Navegação e ativação de funcionalidades por voz.
- **Alto Contraste:** Modo visual para pessoas com baixa visão.
- **Ajuste de Fonte:** Controle de tamanho de texto.
- **Libras:** Indicativo de suporte à Língua Brasileira de Sinais.

### 3. Inteligência Artificial (Assistente IZA)
- **Análise Automática:** Classificação e resumo preliminar das manifestações (simulado).
- **Transcrição de Voz:** Conversão automática de fala para texto para facilitar o registro.

### 4. Geolocalização Inteligente
- **Detecção Automática:** Captura de coordenadas via GPS do dispositivo.
- **Metadados de Fotos:** Extração de localização (latitude/longitude) diretamente dos metadados EXIF das imagens anexadas.
- **Integração com Mapas:** Links diretos para visualização no OpenStreetMap.

### 5. Funcionamento Offline e PWA
- **Instalável:** Pode ser adicionado à tela inicial como um aplicativo nativo.
- **Persistência Local:** Histórico de manifestações e dados salvos localmente (LocalStorage) para consulta mesmo sem internet.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Roteamento:** [React Router DOM](https://reactrouter.com/)
- **PWA:** [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- Gerenciador de pacotes (npm, yarn ou pnpm)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/aplicativo-pwa-participa-df.git
cd aplicativo-pwa-participa-df
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173`.

### Build para Produção

Para gerar a versão otimizada para produção:
```bash
npm run build
```

### Como Testar no Celular

Para testar o aplicativo em seu dispositivo móvel, siga os passos abaixo:

1.  **Conexão de Rede:** Certifique-se de que seu computador e seu celular estejam conectados à mesma rede Wi-Fi.
2.  **Inicie o Servidor com Host:** No terminal do seu computador, execute o comando:
    ```bash
    npm run dev -- --host
    ```
    *Isso permitirá que o servidor seja acessível externamente na sua rede local.*
3.  **Identifique o IP:** No terminal, após iniciar o servidor, observe a linha que diz `Network:` (ex: `https://192.168.1.5:5173/`).
4.  **Acesse no Celular:** Abra o navegador do seu celular (Chrome, Safari, etc.) e digite o endereço IP completo mostrado no terminal.
5.  **Aceite o Certificado de Segurança:** Como estamos usando um certificado autoassinado para permitir recursos como câmera e microfone em ambiente de desenvolvimento (HTTPS), seu navegador pode exibir um aviso de "Sua conexão não é particular".
    *   Clique em **"Avançado"** e depois em **"Ir para [endereço IP] (não seguro)"**.

---

## ⚠️ Observações e Limitações Atuais

*   **Dados Fictícios:** Por se tratarem de dados fictícios para fins de teste, atualmente **não há uma verificação real de CPF válido** junto à Receita Federal. O sistema aceita CPFs formatados corretamente para fins de demonstração.
*   **Suporte a Idiomas:** A mudança de idiomas (Português/Inglês/Espanhol) atualmente está implementada e funcional apenas nas telas de **Login** e **Cadastro**. A expansão para as demais áreas do aplicativo será implementada futuramente.
*   **Avatar de Libras:** O item de acessibilidade (Avatar de Libras - VLibras) possui posição fixa na tela. Atualmente, o usuário **não consegue redefinir a posição ou o tamanho** do avatar manualmente.

## 📂 Estrutura do Projeto

```
src/
├── assets/          # Imagens e recursos estáticos
├── components/      # Componentes reutilizáveis (Header, etc.)
├── contexts/        # Gerenciamento de estado global (Acessibilidade)
├── hooks/           # Hooks personalizados (Áudio, Speech-to-Text, Auth)
├── pages/           # Páginas da aplicação (Home, Login, Formulários)
├── services/        # Integração com APIs (participaApi)
└── main.tsx         # Ponto de entrada da aplicação
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias, correções de bugs ou novas funcionalidades.

---

**Participa DF** - Conectando o cidadão à cidade.
