# Guía de deployment en Vercel

Si el sitio muestra 404 en Vercel (tanto en `*.vercel.app` como en el dominio custom), revisa lo siguiente:

## Test rápido

Después de hacer deploy, prueba: **https://tu-proyecto.vercel.app/vercel-test.html**

- Si **carga**: Vercel sirve archivos pero Next.js no. Revisa Root Directory y Output Directory.
- Si **404**: El deployment no está sirviendo nada. Revisa que el build termine bien y que Root Directory esté vacío.

## 1. Root Directory (MUY IMPORTANTE)

**Settings** → **General** → **Root Directory**

- Debe estar **vacío** si el `package.json` y `app/` están en la raíz del repo.
- Si el proyecto está en una subcarpeta (ej: `apps/website`), pon esa ruta.

Si Root Directory está mal, el build puede “completarse” pero Vercel sirve desde una carpeta vacía o incorrecta.

## 2. Output Directory

**Settings** → **General** → **Build & Development Settings**

- Para Next.js, **Output Directory** debe estar **vacío** (Vercel lo detecta).
- No uses `out`, `dist` ni `build`.

## 3. Framework Preset

- **Framework Preset**: Next.js
- **Build Command**: vacío (usa `next build` por defecto)
- **Install Command**: vacío (usa `npm install` por defecto)

## 4. Redeploy con caché limpia

1. **Deployments** → último deployment → **⋮** (tres puntos)
2. **Redeploy**
3. Activa **Clear build cache**
4. Confirma

## 5. Revisar Build Logs

En el deployment, abre **Building** y comprueba que:

- `npm run build` termine sin errores
- Aparezca algo como `Route (app) ... / ...`
- No haya errores de rutas o de compilación

## 6. Variables de entorno

En **Settings** → **Environment Variables**:

- `NEXT_PUBLIC_FIREBASE_*` (para Firebase client)
- `YOUTUBE_API_KEY` o `FIREBASE_ADMIN_SDK_KEY` (si se usan)

## 7. Protección de deployment

Si hay **Deployment Protection** (password, Vercel Auth):

- Puede que tengas que iniciar sesión para ver el sitio
- Prueba en modo incógnito o desactívala temporalmente
