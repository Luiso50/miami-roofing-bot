const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
