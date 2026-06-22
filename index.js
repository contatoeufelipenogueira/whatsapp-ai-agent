import { startWhatsApp } from './whatsapp.js';

console.log('🚀 Iniciando agente de IA para WhatsApp (modo teste local)...');

startWhatsApp().catch((err) => {
  console.error('Erro fatal ao iniciar:', err);
  process.exit(1);
});
