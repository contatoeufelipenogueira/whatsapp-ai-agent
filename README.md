# WhatsApp AI Agent (teste local)

Estrutura simples e funcional de um agente de IA "humanizado" para WhatsApp,
usando o Gemini 2.5 Flash-Lite. Pensada para você estudar a implementação
antes de evoluir para algo comercial.

## ⚠️ Antes de tudo: segurança da chave

Se você já colou sua chave do Gemini em algum chat, print ou mensagem,
**revogue/regenere essa chave agora** no Google AI Studio e gere uma nova.
Trate a chave como uma senha.

## ⚠️ Sobre a conexão com o WhatsApp

Este projeto usa a biblioteca [Baileys](https://github.com/WhiskeySockets/Baileys),
que se conecta ao WhatsApp da mesma forma que o WhatsApp Web — **não é a API
oficial do Meta**. Isso é ótimo para aprender e prototipar rápido (sem burocracia
de aprovação de conta Business), mas tecnicamente está fora dos Termos de Uso
do WhatsApp, e existe risco de o número ser banido se usado em volume alto ou
de forma comercial. Use um número de teste, não o seu número principal. Quando
for para produção/venda, o caminho recomendado é migrar para a
[Cloud API oficial do Meta](https://developers.facebook.com/docs/whatsapp/cloud-api).

A lógica do agente (memória + chamada ao Gemini) é a mesma nos dois casos —
só a "camada" de conexão com o WhatsApp muda.

## Estrutura do projeto

```
whatsapp-ai-agent/
├── package.json
├── .env.example         # copie para .env e preencha sua chave
├── src/
│   ├── index.js          # ponto de entrada
│   ├── whatsapp.js       # conexão com o WhatsApp (Baileys) + roteamento de mensagens
│   ├── gemini.js         # chamada à API do Gemini + prompt do agente
│   ├── memory.js         # histórico de conversa em memória (por contato)
│   └── humanize.js       # delay de "digitando..." e quebra de mensagens em bolhas
```

## Pré-requisitos

- Node.js 18 ou superior
- Um número de WhatsApp para testes (pode ser o seu, mas idealmente um número secundário)
- Uma chave de API do Gemini válida (gerada após você revogar a antiga)

## Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure sua chave
cp .env.example .env
# edite o .env e cole sua chave do Gemini

# 3. Inicie o servidor
npm start
```

Um QR Code vai aparecer no terminal. Escaneie com o WhatsApp do número de
teste (Configurações → Dispositivos conectados → Conectar dispositivo).

Depois de conectado, mande uma mensagem de **outro número** para o número de
teste. O agente vai responder usando o Gemini, simulando "digitando..." e
podendo quebrar a resposta em mais de uma mensagem.

A sessão fica salva na pasta `auth_info/` — não precisa escanear o QR Code
de novo nas próximas vezes que rodar `npm start` (a menos que desconecte o
dispositivo pelo próprio celular).

## Como o agente funciona, por dentro

1. `whatsapp.js` escuta mensagens novas chegando.
2. Para cada mensagem, busca o histórico da conversa daquele contato em `memory.js`.
3. Envia o histórico + mensagem nova para o Gemini em `gemini.js`, junto com
   um "system prompt" que define a personalidade do agente.
4. Guarda a pergunta e a resposta na memória daquele contato.
5. Antes de responder, simula "digitando..." e pode quebrar a resposta em
   várias mensagens (como uma pessoa faria), via `humanize.js`.

## Próximos passos sugeridos (para quando for evoluir)

- Trocar a memória em RAM (`memory.js`) por algo persistente (SQLite, Redis).
- Adicionar suporte a áudio (transcrição) e imagens.
- Criar personas diferentes por número/contexto.
- Adicionar limite de uso por contato (rate limiting), pra controlar custo de API.
- Migrar a camada de conexão para a Cloud API oficial do Meta antes de vender
  para terceiros.
- Adicionar logs/observabilidade (quantas mensagens, custo estimado, erros).

## Aviso

Este é um projeto de estudo. Não foi feito (ainda) com tratamento robusto de
erros, filas de mensagens, nem segurança para produção. Use em ambiente de
teste, com um número dedicado a isso.
