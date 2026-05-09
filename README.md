# EAS · Earth Analytics Solutions — Sitio web

Landing comercial estática (HTML + CSS + Vanilla JS).

## Estructura

```
web/
├── index.html        Landing (16 secciones)
├── css/styles.css    Sistema de diseño completo
├── js/main.js        Nav, reveals, mobile menu, form submit
├── assets/eas.png    Logo
├── _headers          Config Cloudflare Pages (seguridad + caché)
├── _redirects        Config Cloudflare Pages (redirecciones)
├── vercel.json       Config Vercel (alternativa)
├── robots.txt        SEO
├── sitemap.xml       SEO
└── README.md         Este archivo
```

## Probar localmente

Abre `index.html` directo en el navegador, o levanta un server local:

```powershell
# PowerShell · Python instalado
python -m http.server 5500
# luego abrir http://localhost:5500
```

## Deploy recomendado: Cloudflare Pages

**Por qué Cloudflare Pages > Vercel para este sitio**:
- Bandwidth ilimitado en free tier (Vercel limita a 100 GB/mes)
- CDN más rápido en Latinoamérica
- DNS y dominio en el mismo panel si ya está en Cloudflare
- Build instantáneo de sitios estáticos puros

**Pasos**:
1. Crear repo en GitHub: `git init && git add . && git commit -m "init"`
2. Push a GitHub: `gh repo create eas-web --public --push`
3. En `dash.cloudflare.com`: **Workers & Pages → Create → Pages → Connect to Git**
4. Seleccionar el repo. Build command: vacío (no hay build). Output directory: `/`
5. Deploy. Cloudflare asigna `*.pages.dev`
6. **Custom domain → earthas.co** → Cloudflare actualiza DNS automáticamente
7. HTTPS y CDN global activos en minutos

## Deploy alternativo: Vercel

```powershell
npm i -g vercel
vercel deploy --prod
```

Vercel detecta `vercel.json` y aplica headers/redirects.

## Pendientes para activar producción

- [ ] Reemplazar `+57 XXX XXX XXXX` por el WhatsApp real (3 lugares en index.html)
- [ ] Imágenes reales de los 3 casos (Plaza Terra, Canaán, Vía Ciudadela)
- [ ] Webhook n8n en `js/main.js` línea ~80 (variable `WEBHOOK_URL`)
- [ ] Crear `og-image.jpg` en `/assets` (1200×630, para previews al compartir)
- [ ] Verificar dominio en Google Search Console
- [ ] Conectar GA4 / Pixel Meta si se requiere tracking
