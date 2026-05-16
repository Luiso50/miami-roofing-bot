# Miami Roofing Bot

Asistente automático para captación de leads de roofing en Miami usando Node.js y OpenAI.

## Instalación

1. Clonar el repositorio.
2. Ejecutar:
   ```bash
   npm install
   ```
3. Crear un archivo `.env` basado en `.env.example` con tu clave de OpenAI:
   ```env
   OPENAI_API_KEY=tu_api_key_aqui
   ```

## Uso

Iniciar el servidor:

```bash
npm start
```

El servidor escuchará por defecto en `http://localhost:3000`.

## Endpoints

- `POST /webhook/sms`
  - Request JSON esperado:
    - `From`: número de origen
    - `Body`: mensaje del cliente
  - Respuesta JSON:
    - `response`: texto generado por el bot
    - `isQualified`: si se detectó un lead calificado
    - `from`: origen del mensaje

## Estructura principal

- `src/bot.js`: lógica de OpenAI y prompt de calificación.
- `src/server.js`: API y gestión de conversaciones.
- `src/storage.js`: guardado seguro de leads en `leads.json`.
- `test-flow.js`: prueba local de conversación.

## Integración con Make.com

Puedes conectar tu servidor a Make.com mediante un webhook HTTP que reciba los mensajes SMS de Twilio o de cualquier otro origen.

### Escenario simple recomendado

1. Ejecuta tu servidor localmente:
   ```bash
   npm start
   ```
2. Abre `ngrok` para exponerlo públicamente:
   ```bash
   ngrok http 3000
   ```
3. En Make.com crea un nuevo escenario y agrega un módulo `Webhook > Custom webhook`.
4. Copia la URL pública de `ngrok` y úsala como webhook.
5. Configura Make.com para que envíe un POST a:
   ```
   https://<tu-ngrok>.ngrok.io/webhook/sms
   ```
6. El body debe ser JSON con al menos estos campos:
   - `From`: número de teléfono del cliente
   - `Body`: mensaje de texto recibido

Ejemplo de payload:
```json
{
  "From": "+13051234567",
  "Body": "Hola, tengo una fuga en el techo"
}
```

### Ejemplo de flujo en Make.com

- Trigger: `Webhook > Custom webhook`
- Acción siguiente: `HTTP > Make a request` o `JSON > Parse JSON`
- Opcional: `Google Sheets > Add a row` para guardar información adicional
- Opcional: `Twilio > Send SMS` para reenviar la respuesta del bot al cliente

## Despliegue en Producción

Para que el bot funcione 24/7 sin tener tu computadora encendida:
1. Sube este código a un repositorio privado en **GitHub**.
2. Conecta el repositorio a una plataforma como **Render** o **Railway**.
3. En la configuración de la plataforma, añade la **Variable de Entorno**:
   - `OPENAI_API_KEY`: Tu clave de OpenAI.
4. La plataforma te dará una URL pública (ej: `https://mi-bot.onrender.com`) que usarás en Make.com en lugar de la URL de ngrok.

### Respuesta esperada del servidor

El endpoint devuelve JSON con:
- `response`: texto generado por OpenAI
- `isQualified`: `true` si se detectó un lead calificado
- `from`: número de origen

### Recomendaciones

- Si usas Twilio, primero haz que Twilio envíe los mensajes al webhook de Make.com.
- En Make.com puedes convertir el payload de Twilio a la forma esperada por tu servidor.
- Prueba el flujo con `test-flow.js` y con `ngrok` antes de implementar en producción.

## Mejoras sugeridas

- Usar base de datos en lugar de almacenamiento local.
- Agregar validación de firmas de Twilio si se expone públicamente.
- Implementar un flujo más explícito de calificación para el bot.
- Añadir tests automáticos.
