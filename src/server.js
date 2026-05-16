require('dotenv').config();
const express = require('express');
const { generateResponse } = require('./bot');
const { saveLead } = require('./storage');

if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: Debes definir OPENAI_API_KEY en el archivo .env.');
  process.exit(1);
}

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Memoria temporal para conversaciones (en producción se usaría una DB)
const conversations = {};
const qualifiedLeads = new Set(); // Para evitar duplicados en la misma sesión
const MAX_HISTORY = 12;

// Ruta de salud (para verificar que el bot está activo en la nube)
app.get('/', (req, res) => {
  res.send('Miami Roofing Bot está activo y funcionando.');
});

app.post('/webhook/sms', async (req, res) => {
  const from = req.body.From || req.body.from || req.body.fromNumber || null;
  const body = req.body.Body || req.body.message || req.body.body || null;

  if (!from || !body) {
    return res.status(400).json({ error: 'Faltan campos requeridos: From y Body.' });
  }

  if (!conversations[from]) {
    conversations[from] = [];
  }

  const history = conversations[from].slice(-MAX_HISTORY);
  const { textResponse, metadata } = await generateResponse(body, history);
  
  console.log(`[Extracción] Datos detectados para ${from}:`, metadata);
  console.log(`[Respuesta] Enviando: "${textResponse.substring(0, 50)}..."`);

  // Guardar en el historial, manteniendo solo los mensajes más recientes
  conversations[from].push({ role: 'user', content: body });
  conversations[from].push({ role: 'assistant', content: textResponse });
  if (conversations[from].length > MAX_HISTORY) {
    conversations[from] = conversations[from].slice(-MAX_HISTORY);
  }

  // Calificación basada en los metadatos de la IA
  const isQualified = metadata.listoParaCita === true || (metadata.direccion && metadata.direccion !== "null");

  if (isQualified && !qualifiedLeads.has(from)) {
    console.log(`[Lead] 🎯 ¡Nuevo lead calificado detectado! Guardando datos de: ${from}`);
    qualifiedLeads.add(from);
    saveLead({
      telefono: from,
      direccion: metadata.direccion,
      urgencia: metadata.urgencia,
      causa: metadata.causa,
      ultimoMensaje: body,
      fechaLead: new Date().toISOString()
    });
  } else if (qualifiedLeads.has(from)) {
    console.log(`[Lead] ℹ️ El cliente ${from} ya fue guardado en esta sesión.`);
  }

  res.json({ 
    response: textResponse,
    isQualified,
    from,
    data: metadata
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 [SERVIDOR LISTO]`);
  console.log(`📍 URL Local: http://127.0.0.1:${PORT}`);
  console.log(`📡 Esperando mensajes...\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ERROR: El puerto ${PORT} ya está ocupado. Cierra otros procesos o cambia el puerto en .env`);
  } else {
    console.error(`❌ ERROR al iniciar el servidor: ${err.message}`);
  }
});
