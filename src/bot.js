const { OpenAI } = require('openai');
require('dotenv').config();

const MOCK = process.env.MOCK_OPENAI === 'true';

let openai = null;
if (!MOCK) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const SYSTEM_PROMPT = `
Eres un asistente de atención al cliente para una compañía de roofing en Miami.

Tu objetivo es:
1. Responder rápido y profesional
2. Calificar al cliente
3. Obtener información clave
4. Llevarlo a agendar una cita

Haz preguntas una por una:
- ¿El problema es por tormenta o desgaste?
- ¿Cuál es la dirección?
- ¿Qué tan urgente es? (urgente / esta semana / flexible)

Sé breve, claro y amigable.
Si el cliente está listo:
Di: "Perfecto, podemos agendar una inspección gratuita. ¿Qué día te funciona?"

Nunca digas que eres IA.

IMPORTANTE: Al final de cada respuesta, añade SIEMPRE una línea con este formato exacto:
###{"direccion": "...", "urgencia": "...", "causa": "...", "listoParaCita": true/false}###
Si no conoces un dato, usa null. No inventes información.
`;

async function generateResponse(message, history = []) {
  const MOCK = process.env.MOCK_OPENAI === 'true';

  if (MOCK) {
    // Modo mock: respuestas determinísticas para CI/local sin llamar a OpenAI
    const lower = (message || '').toLowerCase();
    let textResponse = 'Gracias por el mensaje. ¿Puedes darme más detalles?';
    let metadata = { direccion: null, urgencia: null, causa: null, listoParaCita: false };

    if (/(gotera|fuga|techo|roof)/i.test(lower)) {
      textResponse = '¿El problema es por tormenta o desgaste?';
    }

    if (/(tormenta|lluvia|storm)/i.test(lower)) {
      textResponse = '¿Cuál es la dirección?';
      metadata.causa = 'tormenta';
    }

    // Detectar dirección sencilla (número + palabra)
    if (/\d+\s+\w+/.test(lower) && metadata.direccion === null) {
      textResponse = '¿Qué tan urgente es? (urgente / esta semana / flexible)';
      metadata.direccion = message.trim();
    }

    if (/(urgente|urgencia)/i.test(lower)) {
      textResponse = 'Perfecto, podemos agendar una inspección gratuita. ¿Qué día te funciona?';
      metadata.urgencia = 'urgente';
      metadata.listoParaCita = true;
    }

    return { textResponse, metadata };
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
    });

    const fullContent = response.choices[0].message.content;
    
    // Separar el texto amigable de los datos estructurados
    const parts = fullContent.split('###');
    const textResponse = parts[0].trim();
    
    // Metadata por defecto
    let metadata = { direccion: null, urgencia: null, causa: null, listoParaCita: false };

    // Intentar extraer el JSON de la última parte si existe el separador
    if (parts.length >= 2 && parts[parts.length - 1].includes('{')) {
      try {
        let jsonString = parts[parts.length - 1].trim();
        jsonString = jsonString.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        metadata = { ...metadata, ...parsed }; // Combinar con valores por defecto
      } catch (e) {
        console.error('Error parseando metadata:', e);
      }
    }

    return { textResponse, metadata };
  } catch (error) {
    console.error('Error en OpenAI:', error);
    return { 
      textResponse: 'Lo siento, estoy teniendo un problema técnico. ¿Podrías intentar más tarde?',
      metadata: {}
    };
  }
}

module.exports = { generateResponse };
