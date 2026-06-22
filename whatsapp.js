import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { askGemini } from './gemini.js';
import { getHistory, pushMessage } from './memory.js';
import { splitIntoBubbles, typingDelayMs, sleep } from './humanize.js';

// Mude para 'info' se quiser ver os logs internos do Baileys
const logger = pino({ level: 'silent' });

export async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    logger,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📱 Escaneie o QR Code abaixo com o WhatsApp do número de teste:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        '⚠️  Conexão encerrada.',
        shouldReconnect ? 'Reconectando...' : 'Sessão deslogada — apague a pasta auth_info/ e escaneie o QR novamente.'
      );
      if (shouldReconnect) startWhatsApp();
    } else if (connection === 'open') {
      console.log('✅ Conectado ao WhatsApp! Aguardando mensagens...');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      if (!jid || jid.endsWith('@g.us')) continue; // por enquanto, ignora grupos

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        '';

      if (!text) continue; // ignora áudios, figurinhas, etc. nesta versão simples

      console.log(`📩 ${jid}: ${text}`);

      try {
        await handleIncomingMessage(sock, jid, text);
      } catch (err) {
        console.error('Erro ao processar mensagem:', err);
        await sock.sendMessage(jid, {
          text: 'Deu um erro aqui do meu lado, pode repetir? 🙏',
        });
      }
    }
  });

  return sock;
}

async function handleIncomingMessage(sock, jid, text) {
  const history = getHistory(jid);

  const reply = await askGemini(history, text);

  pushMessage(jid, 'user', text);
  pushMessage(jid, 'assistant', reply);

  const bubbles = splitIntoBubbles(reply);

  for (const bubble of bubbles) {
    await sock.sendPresenceUpdate('composing', jid);
    await sleep(typingDelayMs(bubble));
    await sock.sendMessage(jid, { text: bubble });
    await sock.sendPresenceUpdate('paused', jid);
  }
}
