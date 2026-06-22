// Funções simples para tornar as respostas menos "robóticas":
// - mostrar "digitando..." por um tempo proporcional ao tamanho da resposta
// - quebrar respostas longas em várias bolhas, como uma pessoa faria no WhatsApp

export function splitIntoBubbles(text) {
  // Quebra por parágrafos (linha vazia). Se não houver parágrafos, manda como uma bolha só.
  const parts = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [text.trim()];
}

export function typingDelayMs(text) {
  const base = 600; // tempo de "reação" antes de começar a digitar
  const perChar = 35; // ms por caractere (ajuste ao gosto)
  const ms = base + Math.min(text.length, 200) * perChar;
  return Math.min(ms, 6000); // nunca trava a conversa por mais de 6s
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

