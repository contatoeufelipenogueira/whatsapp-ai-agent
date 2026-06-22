// Memória simples em RAM: guarda o histórico de conversa por contato (jid).
// Some quando o servidor reinicia. Para algo persistente no futuro,
// troque este Map por SQLite, Redis, etc. — a interface (get/push/clear)
// pode continuar igual.

const MAX_HISTORY = 12; // quantidade de mensagens (usuário + IA) guardadas por contato

const conversations = new Map();

export function getHistory(jid) {
  return conversations.get(jid) || [];
}

export function pushMessage(jid, role, text) {
  const history = conversations.get(jid) || [];
  history.push({ role, text, timestamp: Date.now() });

  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  conversations.set(jid, history);
}

export function clearHistory(jid) {
  conversations.delete(jid);
}

