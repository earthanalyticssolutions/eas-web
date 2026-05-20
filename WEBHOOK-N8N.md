# Webhook n8n · wf-leads-web

Cuando alguien completa el quiz de cotización en `cotiza.html`, el JavaScript del sitio hace un **POST** a una URL de n8n con todos los datos del lead. Este documento es la "receta" para armar ese workflow.

## 1. Crear el Webhook Trigger en n8n

En `molina0922.app.n8n.cloud`:

1. Crea un workflow nuevo: **`wf-leads-web`**
2. Agrega como primer nodo: **Webhook**
3. Configuración:
   - **HTTP Method**: `POST`
   - **Path**: `leads-web`
   - **Authentication**: None (público — el sitio web lo llamará)
   - **Response Mode**: `Immediately`
   - **Response Code**: `200`
4. Activa el workflow y copia la **Production URL** (algo como `https://molina0922.app.n8n.cloud/webhook/leads-web`)

## 2. Pegar la URL en el sitio web

Editar `cotiza.html` línea ~528:

```js
const WEBHOOK_URL = 'https://molina0922.app.n8n.cloud/webhook/leads-web';
```

Hacer `git commit + push`. Cloudflare redeploya en ~1 min y el quiz ya envía leads reales.

## 3. Payload que recibe el webhook

Cada lead llega con esta estructura JSON:

```json
{
  "fuente": "web-cotiza-quiz",
  "timestamp": "2026-05-10T15:34:21.000Z",
  "canal_preferido": "whatsapp",
  "nombre": "Juan Pérez",
  "contacto": "+57 313 555 0000 / juan@empresa.com",
  "mensaje": "Tengo un lote en Pamplona, quiero saber si sirve para construir...",
  "proyecto": "Lote (comprar / urbanizar)",
  "fase": "Evaluando · todavía no decido",
  "ubicacion": "Norte de Santander (Cúcuta y alrededores)",
  "urgencia": "Este mes",
  "presupuesto": "$5M – $15M COP",
  "user_agent": "Mozilla/5.0...",
  "referrer": "https://earthas.co/sectores/inmobiliario.html"
}
```

Campos siempre presentes (12). Algunos pueden venir vacíos (ej. `mensaje`, `presupuesto`) según lo que llene el cliente.

## 4. Workflow recomendado (4 nodos)

```
Webhook (POST /leads-web)
    │
    ▼
Google Sheets · Append Row
    └─ Spreadsheet: el de EAS Financiero
       Pestaña nueva: "Leads_Web"
       Columnas: timestamp · canal · nombre · contacto · proyecto · fase
                 ubicacion · urgencia · presupuesto · mensaje · referrer
    │
    ▼
Telegram · Send Message
    └─ Chat: tu chat personal (mismo que usa wf-bot-principal)
       Mensaje:
         🟢 *Nuevo lead web · {proyecto}*
         📍 {ubicacion} · ⏰ {urgencia}
         👤 {nombre} · {contacto}
         💬 {mensaje | sin mensaje}
         💰 {presupuesto | sin presupuesto}
         📡 {canal_preferido}
         🌐 desde: {referrer}
    │
    ▼
Gmail · Send Email (al cliente)
    └─ Para: {contacto si parece correo, sino skip}
       Asunto: Recibimos tu solicitud · EAS Earth Analytics Solutions
       Cuerpo: confirmación + recap de las respuestas + próximos pasos
```

## 5. Crear la pestaña "Leads_Web" en Sheets

Antes de activar el workflow, agregar manualmente al Spreadsheet de EAS una pestaña `Leads_Web` con encabezados en fila 1:

```
timestamp | canal_preferido | nombre | contacto | proyecto | fase | ubicacion | urgencia | presupuesto | mensaje | referrer | user_agent
```

## 6. Probar el flujo (antes de poner la URL real)

Para testear sin que entren leads falsos al Sheet real:

1. **Localmente**: abrir `cotiza.html` en navegador, completar el quiz, abrir consola del navegador (F12). Verás `[EAS quiz] webhook no configurado · payload: {...}` con el JSON que va a enviar. Verifica que la estructura es correcta.
2. **Con URL de prueba**: usar [webhook.site](https://webhook.site/) para generar una URL temporal, pegarla en `WEBHOOK_URL`, completar el quiz desde la web y ver el POST llegar. Cuando funcione, cambiar a la URL real de n8n.

## 7. Patrón del bot Telegram

Aprovechar el bot Telegram que ya existe en `wf-bot-principal` (Control Familia Molina Gómez). Solo cambia el `chat_id` si quieres que los leads de EAS lleguen a un canal separado, o reusa el mismo chat.

## 8. Email automático al cliente · plantilla

```
Asunto: ✓ Recibimos tu solicitud · EAS Earth Analytics Solutions

Hola {nombre},

Gracias por contactarnos. Recibimos tu solicitud de cotización:

  ▸ Proyecto: {proyecto}
  ▸ Fase: {fase}
  ▸ Ubicación: {ubicacion}
  ▸ Urgencia: {urgencia}

Te respondemos en menos de 24 horas hábiles con una propuesta técnica
que incluye tres alcances posibles (Inicial, Intermedio, Avanzado) y
sus valores de referencia.

Si tu solicitud es urgente, puedes escribirnos directamente:
  WhatsApp: +57 313 753 1833
  Correo: gerencia@earthas.co

Saludos,
Earth Analytics Solutions
earthas.co · Geociencias · Geotecnia · Ingeniería del Terreno
```

## 9. Pendientes después de activar

- [ ] Probar el quiz desde el celular (UX de los selectores)
- [ ] Habilitar Cloudflare Turnstile o reCAPTCHA en el form si empieza a llegar spam
- [ ] Cron de seguimiento: alerta a las 24h si un lead no fue respondido
- [ ] Tracker en Google Analytics 4 con evento `lead_submit` para métricas
