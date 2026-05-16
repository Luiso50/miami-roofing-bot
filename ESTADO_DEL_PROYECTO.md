# 🏗️ Proyecto: Captación de Leads para Roofing (Miami) - Estado Actual

Este archivo sirve como punto de control para retomar el proyecto en cualquier momento.

## 📋 Resumen del Sistema
Sistema automatizado que utiliza **Twilio** (SMS), **Make.com** (Orquestación), y **Node.js/OpenAI** (IA) para calificar clientes de roofing en Miami y guardarlos en Google Sheets.

## 📁 Archivos Creados
- `/miami-roofing-bot/`
  - `src/bot.js`: Lógica de la IA y Prompt especializado.
  - `src/server.js`: API JSON para conectar con Make.com.
  - `src/storage.js`: Almacenamiento local de leads en `leads.json`.
  - `test-flow.js`: Script de prueba de conversación local.
  - `.env.example`: Plantilla para claves de API.
  - `package.json`: Dependencias (express, openai, axios, dotenv).

## ✅ Progreso Realizado
1. **Fase 1 (Local):** Servidor funcional que procesa mensajes y califica leads.
2. **Fase 2 (IA):** Prompt optimizado para preguntar por: causa del daño, dirección y urgencia.
3. **Fase 3 (API):** Refactorización completada para integración con Make.com (formato JSON).

## 🚀 Pendiente para la Próxima Sesión
1. **Exposición:** Ejecutar `ngrok http 3000` para obtener la URL pública.
2. **Make.com:** Configurar el escenario (Webhook -> HTTP -> Router -> Sheets -> Twilio).
3. **Twilio:** Comprar número y configurar el Webhook con la URL de ngrok/Make.
4. **Google Sheets:** Crear la hoja con columnas: Nombre, Teléfono, Dirección, Urgencia, Estado.

## 🛠️ Cómo retomar
1. Abrir terminal en `miami-roofing-bot`.
2. Asegurar que `.env` tenga la `OPENAI_API_KEY`.
3. Ejecutar `node src/server.js`.
4. Seguir con la configuración de **ngrok** y **Make.com**.

---
*Estado guardado el: 9 de mayo de 2026*
