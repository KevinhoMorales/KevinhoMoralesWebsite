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

En **Settings** → **Environment Variables**.

### Firebase en el navegador (obligatorio si usas `/admin` o Analytics de Firebase)

Si en producción ves *“Firebase Auth can’t run here”* / *“NEXT_PUBLIC_FIREBASE_* env vars are missing”*, el build en Vercel **no tiene** la configuración del **Web app** de Firebase.

1. En [Firebase Console](https://console.firebase.google.com/) → tu proyecto → **Project settings** (engranaje) → pestaña **General** → sección **Your apps** → app **Web** (`</>`). Si no existe, crea una.
2. Copia los valores del objeto `firebaseConfig`.
3. En Vercel: **Settings** → **Environment Variables** → añade **todas** las filas de abajo (mismo **nombre**; pega el valor del console). Marca al menos **Production** (y **Preview** si quieres probar en ramas).
4. **Deployments** → **Redeploy** el último deploy (o haz un push). Las variables `NEXT_PUBLIC_*` se inyectan en **build time**; sin redeploy el cambio no se ve.

| Nombre en Vercel | Origen en Firebase (campo del SDK) |
|------------------|-------------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `measurementId` (opcional si no usas Analytics web) |

**Mínimo para que arranque Auth:** `NEXT_PUBLIC_FIREBASE_API_KEY` y `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (el resto evita errores raros en Storage/Firestore cliente).

Referencia local: copia los mismos nombres que en [`.env.example`](./.env.example).

### Firebase en el servidor (panel admin: APIs, Firestore, waitlist)

Para que `/api/admin/*` y el guardado en Firestore funcionen en producción, añade también **`FIREBASE_ADMIN_SDK_KEY`**: el JSON completo de la cuenta de servicio (Project settings → **Service accounts** → **Generate new private key**). En Vercel suele pegarse como una sola línea; si el JSON trae comillas, revisa la documentación de Vercel para valores multilínea o escapa según te indique el dashboard.

### Otras

- `YOUTUBE_API_KEY` — episodios del podcast (si aplica).
- `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`, `RESEND_*`, etc. — según features que uses (ver `.env.example`).

## 7. Protección de deployment

Si hay **Deployment Protection** (password, Vercel Auth):

- Puede que tengas que iniciar sesión para ver el sitio
- Prueba en modo incógnito o desactívala temporalmente
