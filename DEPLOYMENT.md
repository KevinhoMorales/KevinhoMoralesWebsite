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

## 8. Recomendaciones del panel «Deployment settings» (builds y runtime)

Parte de lo que muestra Vercel en **Project → Settings** (pestañas tipo **Build and Deployment**, **Deployment Settings** o **Advanced**) **no se configura en el repo**: hay que activarlo en el dashboard (y a menudo requiere plan **Pro** u **Enterprise**). Este proyecto ya usa **Next.js 14.2.x**, compatible con [Skew Protection](https://vercel.com/docs/deployments/skew-protection) sin cambios de código extra.

### Builds más rápidos y sin cola

1. **On-Demand Concurrent Builds** (evitar builds encolados)  
   - Ruta típica: **Settings** del proyecto → **Build and Deployment** → sección **On-Demand Concurrent Builds**.  
   - Elige *Run all builds immediately* o *up to one build per branch* según tu flujo.  
   - Documentación: [Managing builds / On-demand concurrent builds](https://vercel.com/docs/deployments/concurrent-builds#on-demand-concurrent-builds).

2. **Máquina de build más grande** (hasta ~40 % más rápido según Vercel)  
   - Misma área: **Build Machine** a nivel de [proyecto](https://vercel.com/docs/deployments/concurrent-builds#larger-build-machines) o [equipo](https://vercel.com/docs/deployments/concurrent-builds).  
   - Opciones comunes: **Enhanced**, **Turbo** o **Elastic** (más vCPU/RAM; pueden implicar coste según plan).  
   - Si estás en **Hobby**, muchas de estas opciones no aplican; [upgrade a Pro](https://vercel.com/docs/plans/pro-plan) es lo que sugiere Vercel para builds paralelos y máquinas mayores.

3. **Prioritize Production Builds**  
   - Si ya está **Enabled**, no hace falta tocar nada. Si no, actívalo en **Build and Deployment** para que producción no quede detrás de muchos previews.  
   - [Prioritize production builds](https://vercel.com/docs/deployments/concurrent-builds#prioritize-production-builds).

### Evitar desajuste cliente / servidor (Skew Protection)

Útil cuando despliegas seguido y quieres que las peticiones del navegador sigan apuntando al **mismo deployment** que sirvió la página.

1. **Settings** → **Advanced** → **Skew Protection** → activar.  
2. Comprueba que esté habilitado [exponer automáticamente las variables de entorno del sistema](https://vercel.com/docs/environment-variables/system-environment-variables#automatically-expose-system-environment-variables) en el proyecto.  
3. Vuelve a desplegar producción tras el cambio.  
4. Guía: [Skew Protection](https://vercel.com/docs/deployments/skew-protection).

> En planes **Pro/Enterprise**; en proyectos nuevos a partir de cierta fecha puede venir activado por defecto.

### Runtime (Fluid Compute, région, etc.)

- **Node.js**: en el dashboard puedes fijar **24.x** (o la LTS que prefieras); alinea con `engines.node` en `package.json` si quieres paridad local/CI.  
- **Cold Start Prevention**: opcional; sube el coste o el uso de cómpute a cambio de menos cold starts en funciones. Actívalo solo si notas latencia al despertar rutas/serverless.  
- **Function region** (`iad1`, etc.): déjala cerca de tus usuarios o de tus APIs si la latencia importa.

### Resumen rápido

| Sugerencia en Vercel | Dónde | Nota |
|----------------------|--------|------|
| Builds en paralelo | Project → Settings → Build and Deployment | Suele requerir Pro |
| Máquina Enhanced / Turbo / Elastic | Misma sección (o Team settings) | Revisa facturación |
| Skew Protection | Project → Settings → Advanced | Next 14.1.4+ OK en esta app |
| Priorizar producción | Build and Deployment | Recomendado si hay muchos previews |
