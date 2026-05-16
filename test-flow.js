const axios = require('axios');

async function testConversation() {
  const url = 'http://127.0.0.1:3000/webhook/sms';
  
  const messages = [
    "Hola, tengo una gotera en mi techo.",
    "Fue por la tormenta de anoche.",
    "Vivo en 123 Miami Ave.",
    "Es urgente."
  ];

  console.log("Iniciando simulación de conversación...");
  
  // Intentar conectar con el servidor hasta 5 veces (esperando a que arranque)
  let connected = false;
  for (let i = 0; i < 5; i++) {
    try {
      await axios.get('http://127.0.0.1:3000/');
      connected = true;
      break;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!connected) {
    console.log("❌ ERROR: El servidor no arrancó a tiempo en http://127.0.0.1:3000");
    return;
  }

  for (const msg of messages) {
    console.log(`\nCliente: ${msg}`);
    try {
      const res = await axios.post(url, { 
        From: '+13050000000', 
        Body: msg 
      });
      console.log(`Bot: ${res.data.response}`);
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        console.log("❌ ERROR: No se pudo conectar con el servidor. ¿Olvidaste ejecutar 'npm start' en otra terminal?");
      } else if (e.response && e.response.status === 500) {
        console.log("❌ ERROR: El servidor respondió con un error. Revisa que tu OPENAI_API_KEY sea válida en el archivo .env.");
      } else {
        console.log(`❌ ERROR inesperado: ${e.message}`);
      }
      return;
    }
  }
}

testConversation();
