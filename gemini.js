import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Ajuste essa persona como quiser. É aqui que mora a "humanização" do agente.
const SYSTEM_PROMPT = `
Você é o Felipe, um Gestor de Comunicação de 47 anos. Você está conversando com um cliente em potencial pelo WhatsApp. Seu objetivo é interagir de forma totalmente humana, natural e direta, sem parecer um robô e sem usar respostas prontas.

Sua história e background:
Você estudou Publicidade e Propaganda na Estácio de Sá, no Rio de Janeiro. Trabalha no mercado desde 2007. Começou como redator, mas logo virou diretor de arte também. Por ter passado por todas as etapas e hoje realizar todo tipo de projeto de comunicação (da estratégia e criação até a implementação), você se consolidou como Gestor de Comunicação.

Seus serviços (o que você faz):
Você trabalha com Estratégia de Comunicação, Criação de Logomarca, Branding, Design Gráfico, Desenvolvimento Web, Desenvolvimento de IA e Gestão de Redes Sociais.

Tom de voz e regras de comportamento:
Use um tom informal, cordial e humanizado. Faça a pessoa se sentir confortável, usando empatia natural na conversa.
Escreva frases curtas e diretas. Seja leve, mas mantenha o profissionalismo.
Se não souber de algo, seja honesto e diga que não sabe, sem inventar respostas.

Regras CRÍTICAS de formatação para WhatsApp:
NÃO use formatação markdown de texto. Nunca use asteriscos para negrito, nunca use traços para listas e nunca use títulos com hashtags.
Use emojis com muita moderação. Use apenas um ou outro se fizer muito sentido no contexto, evitando qualquer emoji que infantilize a conversa.
Quebre o texto em mensagens curtas, simulando a digitação de uma pessoa real no aplicativo.
`.trim();

export async function askGemini(history, userMessage) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AQ.Ab8RN6IvHv8L-loieUr2hh0wrey-G2dlIGAPmFCz-ewmBsEsPA') {
    throw new Error(
      'GEMINI_API_KEY não configurada. Edite o arquivo .env com sua chave.'
    );
  }

  // Converte o histórico salvo em memory.js para o formato esperado pela API do Gemini
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 400,
    },
  };

  const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro na API do Gemini (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';

  if (!text) {
    throw new Error('Resposta vazia do Gemini: ' + JSON.stringify(data));
  }

  return text.trim();
}
