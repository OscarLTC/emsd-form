# Formulario móvil de contingencia

Registro manual de pedidos para repartidores en ruta. Pensado para usarse desde el celular cuando
el sistema principal no está disponible, con o sin señal: el pedido se guarda en el dispositivo y
sube solo cuando hay red.

Stack: React 19 + TypeScript, Vite, React Router, Supabase y service worker vía `vite-plugin-pwa`.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

Necesita un proyecto Supabase configurado para arrancar; el paso siguiente lo detalla.

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. Expuesto en la red local para probar desde el celular |
| `npm run build` | Verifica tipos con `tsc` y genera `dist/` |
| `npm run preview` | Sirve `dist/` para revisar el build de producción |

## Variables de entorno

`.env` está ignorado por git; `.env.example` es la plantilla versionada. Solo dos son
obligatorias; el resto tiene valores por defecto en `src/config/env.ts`.

| Requerida | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto, sin rutas ni barra final (Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Clave `anon` / `public`, nunca la `service_role` |

| Opcional | Descripción |
| --- | --- |
| `VITE_APP_NAME` | Nombre mostrado en el encabezado y el login |
| `VITE_SUPABASE_BUCKET` | Bucket de evidencias fotográficas |
| `VITE_SESSION_TTL_HOURS` | Vigencia de la sesión cacheada |
| `VITE_SYNC_INTERVAL_MS` | Cada cuánto se reintenta vaciar la cola |
| `VITE_SYNC_MAX_ATTEMPTS` | Intentos antes de marcar un pedido como fallido |
| `VITE_PHOTO_MAX_COUNT` | Máximo de fotos de evidencia por pedido |
| `VITE_PHOTO_MAX_WIDTH` / `VITE_PHOTO_QUALITY` | Compresión aplicada a cada foto |
| `VITE_REQUEST_TIMEOUT_MS` | Corte de una petición normal a Supabase |
| `VITE_UPLOAD_TIMEOUT_MS` | Corte de la subida de una foto, más amplio a propósito |

En `.env.example` quedan comentadas dos más, que no van a producción: `VITE_DEBUG`, para ver los
logs de sincronización en un build productivo —en desarrollo ya están activos—, y el trío
`VITE_API_MODE` / `VITE_API_URL` / `VITE_API_TIMEOUT_MS`, que solo aplica si se usa una API propia
en vez de Supabase.

Todas las `VITE_*` se resuelven en tiempo de build y quedan dentro del bundle. No pongas secretos
ahí: la `anon key` de Supabase es pública por diseño y la protección real son las políticas RLS.
La `service_role` key no debe aparecer nunca en el frontend.

## Supabase

1. Copiar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` al `.env`.
2. Ejecutar `supabase/schema.sql` completo en el SQL Editor. Crea `profiles`,
   `contingency_orders`, el bucket privado `evidence` y las políticas RLS.
3. Crear los usuarios en Authentication → Users con *Auto Confirm User* activado. El trigger
   `handle_new_user` genera el perfil; `name`, `role` y `zone` se leen de `raw_user_meta_data`
   si se envían al crear la cuenta.

El primer bloque de `schema.sql` elimina el esquema anterior, así que correrlo sobre una base con
datos los borra. El bucket viejo hay que eliminarlo desde Storage en el dashboard: Postgres no
permite borrar buckets por SQL.

Las políticas son "cada usuario ve y escribe lo suyo", comparando contra `auth.uid()`. Un
supervisor que deba ver la zona completa necesita una política adicional.

Un pedido descartado después de que sus fotos subieron deja archivos sin fila que los referencie.
Como esta base es temporal y los registros se consolidan luego en el sistema principal, se pueden
limpiar cada cierto tiempo. Esta consulta los identifica:

```sql
select o.name, o.created_at
from storage.objects o
where o.bucket_id = 'evidence'
  and not exists (
    select 1 from public.contingency_orders c
    where c.id::text = (storage.foldername(o.name))[2]
  );
```

El borrado va por la API de Storage o el dashboard: Postgres bloquea el `delete` directo sobre
`storage.objects`.

La base usa nomenclatura en inglés y el código está en español. La traducción de columnas y de los
valores de `result` (`entregado` → `delivered`) vive en `pedidosService.supabase.ts`, único punto
de contacto con los nombres de la base.

## Deploy en Vercel

`vercel.json` ya trae lo necesario: build con Vite hacia `dist/`, rewrite de todas las rutas a
`index.html` para que React Router funcione al entrar directo a `/pendientes`, y cabeceras de
caché — los assets con hash quedan inmutables y el service worker sin caché, para que una versión
nueva llegue al celular sin desinstalar la app.

Antes del primer deploy hay que cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Project
Settings → Environment Variables, porque `.env` no se versiona. Las opcionales solo si quieres
cambiar un valor por defecto, y `VITE_DEBUG` no debería cargarse nunca ahí. Como se leen en build,
modificar cualquiera exige redeploy.

No hace falta configurar redirect URLs en Supabase: el login es por correo y contraseña, sin OAuth
ni magic links. Si más adelante se agrega recuperación de contraseña, ahí sí habrá que registrar
el dominio en Authentication → URL Configuration.

## Arquitectura

```
src/
  config/          variables de entorno tipadas y catálogos administrables
  core/            sin dominio: IndexedDB, http, supabase, storage, red, logging
  features/
    auth/          login, sesión persistida, guard de rutas
    orders/        formulario, cola offline y sincronización
  routes/          definición de rutas
  shared/          componentes y estilos transversales
```

El código está en inglés —identificadores, tipos, archivos y clases CSS—. Lo único en español son
los textos que ve el usuario final y los mensajes de error que se le muestran. La excepción es
`outboxRepository.ts`, que conserva los nombres de campo antiguos para poder leer los pedidos que
quedaron encolados con una versión previa de la app.

Auth y pedidos exponen las interfaces `AuthService` y `PedidosService`, con dos implementaciones
cada una: `supabase` y `http`. El barril de cada `services/` elige según `VITE_API_MODE`. Cambiar
de backend no toca la UI ni la lógica de sincronización.

## Cómo funciona offline

Enviar nunca depende de la conexión. El pedido se guarda primero en IndexedDB —las fotos como
`Blob`, sin base64— y recién después se intenta subir. El flujo es idéntico con o sin señal; solo
cambia el mensaje de confirmación.

La sincronización se dispara sola al guardar, al recuperar señal, al volver la app a primer plano
y cada `VITE_SYNC_INTERVAL_MS`. Distingue dos fallos: si es de red corta el ciclo sin gastar
intento, y si el servidor responde con error marca el pedido y suma uno. Al llegar al tope queda
esperando el botón *Reintentar ahora* en **Pendientes**, donde también se puede descartar.

Con señal muy débil `navigator.onLine` sigue diciendo `true` y las peticiones se cuelgan en vez de
fallar. Por eso el cliente de Supabase usa un `fetch` propio que las corta por tiempo, y el ciclo
libera su bandera en un `finally`: si un envío queda colgado, el siguiente intento entra igual en
lugar de dejar la cola congelada.

Cada pedido lleva un UUID generado en el cliente, que es su *primary key*, y cada foto el suyo,
generado al capturarla. Todas las escrituras son `upsert` sobre rutas fijas
(`evidence/<user_id>/<pedido>/<foto>.jpg`), así que reintentar no duplica registros ni imágenes.

Supabase no aporta cola ni reintentos: si no hay señal la llamada falla y punto. El outbox es
independiente del backend. El service worker cachea la app para que abra sin red, y la sesión se
guarda en `localStorage` con vencimiento para no exigir login en cada arranque.

## Conectar una API propia

Con `VITE_API_MODE=http` y `VITE_API_URL`, los contratos esperados son:

- `POST /auth/login` → `{ token, usuario }`
- `POST /auth/logout`
- `POST /orders` — multipart con `id`, `record` en JSON y un campo `photos` repetido por evidencia

Si difieren, se ajustan `authService.http.ts` y `pedidosService.http.ts` sin tocar nada más.

## Pendiente

- No se solicita `navigator.storage.persist()`: el navegador puede desalojar IndexedDB bajo presión
  de almacenamiento y perder pedidos sin sincronizar.
- Un `401` por sesión vencida consume los reintentos como si fuera un error del pedido, en lugar de
  cortar el ciclo como hace la falta de red.
- Sin `ErrorBoundary`: un error de render deja la pantalla en blanco.
- Los reintentos no tienen backoff. Son N intentos seguidos cada 30 s.
- Sin tests.
