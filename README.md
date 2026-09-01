# Formulario móvil de contingencia

Registro manual de pedidos para uso en ruta, con soporte online/offline.

## Ejecutar

```bash
npm install
npm run dev
```

Con `VITE_API_MODE=mock` no hace falta backend: `operador / 123456` o `supervisor / 123456`.

## Supabase

1. Pegar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env` (Project Settings → API).
2. Ejecutar `supabase/schema.sql` en el SQL Editor: crea `profiles`, `contingency_orders`,
   el bucket privado `evidence` y todas las políticas RLS. El archivo empieza borrando el esquema
   anterior, así que correrlo sobre una base con datos los elimina.
3. Crear los usuarios en Authentication → Users. El trigger genera su perfil; `name`, `role` y
   `zone` se leen de `raw_user_meta_data` si se envían al crear la cuenta.

El login usa correo y contraseña. La `anon key` es pública por diseño y va en el bundle: la
seguridad la dan las políticas RLS, no la clave. La `service_role` key nunca debe ponerse en un
`VITE_*`.

Cada pedido se guarda con el UUID que genera el cliente como *primary key*, y sus fotos en
`evidence/<user_id>/<uuid del pedido>/<uuid de la foto>.jpg`; la tabla guarda las rutas en
`photo_paths text[]`. Todas las escrituras son `upsert` y los UUID se generan al capturar, así que
reintentar un envío de la cola nunca duplica el registro ni las imágenes.

La base usa nomenclatura en inglés y el código está en español: la traducción de nombres de
columna y de los valores de `result` (`entregado` → `delivered`) vive en
`features/pedidos/services/pedidosService.supabase.ts`, que es el único punto de contacto.

## Variables de entorno

`.env` está ignorado por git; `.env.example` es la plantilla versionada.

| Variable | Descripción |
| --- | --- |
| `VITE_API_MODE` | `mock`, `http` o `supabase` |
| `VITE_API_URL` | Base de la API real (modo `http`) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Credenciales del proyecto Supabase |
| `VITE_SUPABASE_BUCKET` | Bucket de evidencias fotográficas |
| `VITE_API_TIMEOUT_MS` | Timeout de cada request |
| `VITE_SESSION_STORAGE_KEY` | Clave de la sesión persistida |
| `VITE_SESSION_TTL_HOURS` | Vigencia de la sesión antes de pedir login otra vez |
| `VITE_SYNC_INTERVAL_MS` | Cada cuánto se reintenta vaciar la cola |
| `VITE_SYNC_MAX_ATTEMPTS` | Intentos antes de marcar un pedido como fallido |
| `VITE_PHOTO_MAX_COUNT` | Máximo de fotos de evidencia por pedido |
| `VITE_PHOTO_MAX_WIDTH` / `VITE_PHOTO_QUALITY` | Compresión de la evidencia fotográfica |

## Estructura

```
src/
  config/          lectura tipada de variables de entorno
  core/            piezas sin dominio: IndexedDB, http, supabase, storage, red, utils
  features/
    auth/          login, sesión persistida, guard de rutas
    pedidos/       formulario, cola offline y sincronización
  routes/          definición de rutas
  shared/          componentes e estilos transversales
```

## Cómo funciona el modo contingencia

El envío nunca depende de la conexión: al pulsar **Enviar** el pedido se guarda en IndexedDB
(incluida la foto como Blob) y recién después se intenta subir. La sincronización se dispara sola
al guardar, al recuperar señal (`online`), al volver a primer plano y cada `VITE_SYNC_INTERVAL_MS`.

Si falla la red, la cola se conserva y se reintenta; si el servidor responde con error, el pedido
queda marcado como fallido y se puede reintentar o descartar desde **Pendientes**. La barra bajo
el encabezado muestra el estado real (sin conexión / pendientes / sincronizando / al día).

El service worker cachea la app, así que abre sin señal. La sesión se guarda en `localStorage`
con vencimiento configurable para no exigir login en cada arranque.

Supabase no aporta reintentos ni cola: si no hay señal, la llamada falla y el pedido se queda en
IndexedDB hasta que vuelva la conexión. Por eso el outbox es independiente del backend elegido.

## Conectar una API propia en vez de Supabase

Cambiar `VITE_API_MODE=http` y `VITE_API_URL`. Los contratos esperados son:

- `POST /auth/login` → `{ token, usuario }`
- `POST /auth/logout`
- `POST /pedidos` (multipart: `id`, `registro` en JSON, y un campo `fotos` repetido por evidencia)

Cada modo es un adaptador detrás de las mismas interfaces `AuthService` y `PedidosService`
(`features/*/services/`); cambiar de backend no toca la UI ni la lógica de sincronización.
