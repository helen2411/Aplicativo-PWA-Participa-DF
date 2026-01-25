# Participa DF - PWA (Categoria Ouvidoria)

Aplicativo PWA acessível para registro de manifestações por texto, áudio, imagem e vídeo, com protocolo automático, anonimato opcional e integração planejada com IZA/Participa DF.

## Tecnologias
- React + Vite
- TypeScript
- Tailwind CSS
- Web Speech API (voz)
- MediaDevices/MediaRecorder (câmera/áudio)
- PWA (service worker + manifest)

## Comandos
- Instalar dependências:

```bash
npm install
```

- Desenvolvimento:

```bash
npm run dev
```

- Lint:

```bash
npm run lint
```

- Build:

```bash
npm run build
```

- Preview:

```bash
npm run preview
```

## Configuração de API (opcional)
Crie `.env` com:

```
VITE_API_BASE_URL=https://api.participadf.example
```

Endpoint esperado:
- POST /manifestations (envio da manifestação)
- POST /iza/analyze (análise/assistência da IZA)

## Vídeo de Demonstração
Link: [Adicionar link do vídeo (até 7 minutos) aqui]

## Acessibilidade (WCAG 2.1 AA)
- Alto contraste e ajuste de fonte
- Leitor por voz e aria-live em feedback
- Skip link para conteúdo principal
- Alternativas textuais para mídias
