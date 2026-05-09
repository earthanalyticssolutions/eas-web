# Deploy a Cloudflare Pages · earthas.co

Eres dueño de `earthas.co`. Esta guía explica cómo apuntar el dominio a Cloudflare Pages **sin perder tu correo de Hostinger** y sin riesgos.

---

## Estrategia recomendada (segura, reversible)

Vamos en **2 etapas**:

1. **Etapa 1 (HOY)** — Subir el sitio a `eas-web.pages.dev` (URL temporal de Cloudflare). NO toca `earthas.co`. El sitio actual sigue intacto.
2. **Etapa 2 (cuando estés conforme)** — Apuntar `earthas.co` al sitio nuevo en Cloudflare. Mantener el correo en Hostinger usando registros MX.

> 💡 La Etapa 1 es 100% reversible. Si algo sale mal, no pasa nada.
> La Etapa 2 cambia DNS pero solo el dominio web, no el correo.

---

## ETAPA 1 · Subir a `eas-web.pages.dev` (HOY)

### 1.1 Crear cuenta de Cloudflare (si no tienes)

- Entra a [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
- Email + contraseña → confirma
- Plan: **Free**

### 1.2 Crear repositorio en GitHub

```powershell
# Desde la carpeta del proyecto
cd c:\Users\dlms0\n8n-workflows\eas\web

git init
git add .
git commit -m "EAS · landing v1"

# Si tienes gh CLI instalado:
gh auth login
gh repo create eas-web --public --source=. --push

# O manualmente:
# 1. Crea el repo en https://github.com/new (nombre: eas-web)
# 2. git remote add origin https://github.com/TU_USUARIO/eas-web.git
# 3. git branch -M main
# 4. git push -u origin main
```

### 1.3 Conectar Cloudflare Pages al repo

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Conecta tu cuenta de GitHub y autoriza
3. Selecciona el repo `eas-web`
4. **Project name**: `eas-web`
5. **Production branch**: `main`
6. **Framework preset**: `None`
7. **Build command**: dejar vacío (no hay build, es HTML puro)
8. **Build output directory**: `/` (raíz del repo)
9. **Save and Deploy**

En 30 segundos tu sitio está en `https://eas-web.pages.dev`.

✅ Pruébalo en celular y desktop. Comparte el link con tu equipo. Cualquier ajuste: edita los archivos → `git push` → Cloudflare hace deploy automático.

---

## ETAPA 2 · Apuntar `earthas.co` (cuando estés conforme)

### 2.1 Saber cómo está configurado tu dominio actualmente

Tu dominio `earthas.co` está registrado en algún proveedor (Hostinger, GoDaddy, Namecheap, etc.). Necesitamos saber:
- **Registrar**: dónde compraste el dominio
- **Nameservers actuales**: a qué DNS apunta hoy

Para saberlo, en PowerShell:

```powershell
nslookup -type=ns earthas.co
```

O entra a tu panel de Hostinger → **Dominios** → `earthas.co` → mira "Nameservers".

### 2.2 Decidir el modo de conexión

Hay **2 maneras** de apuntar `earthas.co` a Cloudflare Pages:

**Modo A · DNS Only (recomendado si tu correo está en Hostinger)**
- Sigues usando los nameservers de Hostinger
- Solo creas un registro `CNAME` apuntando a `eas-web.pages.dev`
- El correo `gerencia@earthas.co` sigue funcionando sin tocar nada
- **Más seguro y simple**

**Modo B · Full Cloudflare DNS (más rápido pero requiere migrar DNS)**
- Cambias los nameservers a los de Cloudflare
- Cloudflare administra todo el DNS (web + correo)
- Hay que recrear los registros MX de Hostinger en Cloudflare
- **Más rápido (CDN, DDoS protection, analytics)** pero requiere más cuidado

➜ **Mi recomendación: empieza con Modo A.** Si después quieres beneficios extra de Cloudflare (firewall, analytics, page rules), migras a Modo B sin urgencia.

### 2.3 Modo A · Configurar CNAME en Hostinger

En el panel de Hostinger:

1. Ve a **Dominios** → `earthas.co` → **DNS / Nameservers** → **DNS Records**
2. **Borra** el registro A o CNAME actual de `earthas.co` (el que apunta a tu hosting actual)
3. **Crea** estos registros nuevos:

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| `CNAME` | `@` (o `earthas.co`) | `eas-web.pages.dev` | 3600 |
| `CNAME` | `www` | `eas-web.pages.dev` | 3600 |

> Si Hostinger no permite CNAME en `@`, usa **CNAME flattening** o un registro `ALIAS`. La mayoría de los registrars modernos lo soportan.

4. **NO TOQUES** los registros MX (`mail.earthas.co`, `_dmarc`, `_spf`, etc.) → tu correo sigue funcionando.

### 2.4 Conectar el dominio en Cloudflare Pages

1. En el dashboard de Cloudflare Pages → tu proyecto `eas-web`
2. **Custom domains** → **Set up a custom domain**
3. Ingresa `earthas.co` → **Continue**
4. Cloudflare detecta que el CNAME ya está creado y lo verifica
5. **Activate domain**

En 5-30 minutos (propagación DNS), `https://earthas.co` carga el sitio nuevo de Cloudflare Pages con HTTPS automático.

### 2.5 Verificar que el correo sigue funcionando

Después del cambio, verifica:

```powershell
nslookup -type=mx earthas.co
```

Debe seguir mostrando los servidores MX de Hostinger (algo como `mx1.hostinger.com`).

Envía un email de prueba a `gerencia@earthas.co` desde otra cuenta. Si llega → todo OK.

---

## Rollback (si algo sale mal en Etapa 2)

Si después de cambiar DNS algo no funciona como esperas:

1. Hostinger → DNS Records
2. Borra los CNAMEs nuevos (`@` y `www`)
3. Restaura el registro A o CNAME que tenías antes (apuntando al hosting de Hostinger)
4. En 5-30 minutos vuelve a estar como antes

> El correo nunca se ve afectado porque no tocamos los registros MX.

---

## Checklist final

**Etapa 1 (hoy)**:
- [ ] Cuenta Cloudflare creada
- [ ] Repo `eas-web` en GitHub
- [ ] Cloudflare Pages conectado al repo
- [ ] Sitio funcionando en `eas-web.pages.dev`
- [ ] Probado en celular + desktop

**Etapa 2 (cuando lo decidas)**:
- [ ] Identificado el registrar de `earthas.co`
- [ ] CNAMEs configurados en Hostinger
- [ ] Custom domain agregado en Cloudflare Pages
- [ ] HTTPS funcionando en `earthas.co`
- [ ] Correo `gerencia@earthas.co` aún funciona (test)
- [ ] Backup en Wayback Machine del sitio actual (por si acaso): `https://web.archive.org/save`

---

## ¿Y si quiero hacerlo TODO HOY?

Sí se puede. Riesgo: si algo no carga bien en mobile, el sitio queda mal por 30 minutos hasta que rebobines DNS. Si prefieres ir directo:

1. Sigue toda la Etapa 1
2. Luego mismo día, Etapa 2 con Modo A

Ya tienes la guía. Cuando lo hagas, dime si necesitas ayuda en algún paso específico.
