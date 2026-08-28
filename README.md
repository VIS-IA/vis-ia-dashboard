# VIS IA Client Intelligence Dashboard

Panel funcional para clientes de VIS IA. Mismo diseño aprobado
(`VisIaPanelInicio`), ahora conectado a Supabase con login por
email/contraseña: cada cliente entra a `/login`, y solo ve sus propios
datos gracias a Row Level Security.

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**.
2. Cuando esté listo, ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

## 2. Correr el esquema de base de datos

1. En Supabase, ve a **SQL Editor → New query**.
2. Pega y ejecuta todo el contenido de `supabase/schema.sql`.
   Esto crea las tablas (`clients`, `reports`, `metrics`, `losses`,
   `opportunities`, `actions`) y las políticas de seguridad (RLS) que
   garantizan que cada cliente solo vea sus propios datos.

## 3. Crear tu primer cliente (demo)

1. En Supabase: **Authentication → Users → Add user**. Crea un usuario
   de prueba con email y contraseña (ej. `demo@visia.com`).
2. Copia su **User UID**.
3. Abre `supabase/seed_demo.sql`, reemplaza `PEGA-AQUI-EL-USER-ID` por
   ese UID (aparece 1 vez en el archivo), y ejecútalo completo en el
   SQL Editor.
4. Esto crea el negocio "Café Central Marietta" con el mismo reporte
   demo que ya conoces (VIS Score 72, etc.), pero ahora viviendo en la
   base de datos.

## 4. Configurar el proyecto localmente

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y pega tu `Project URL` y `anon key` de Supabase.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` → te redirige a `/login`. Entra con el
email/contraseña que creaste en el paso 3. Deberías ver el panel con
los datos del reporte demo.

## 5. Agregar un cliente real

Por cada cliente nuevo:

1. **Authentication → Users → Add user** — crea su login (puedes
   generar una contraseña temporal y pedirle que la cambie, o
   mandársela directamente).
2. Inserta su fila en `clients` con su `user_id`, `client_code` único
   (ej. `VIS-250601`), `business_name`, `location`.
3. Inserta su primer `report` (y los `metrics`/`losses`/
   `opportunities`/`actions` asociados) — usa `seed_demo.sql` como
   plantilla, cambiando los valores.

Cuando quieras publicar un análisis nuevo para un cliente existente,
simplemente inserta otra fila en `reports` con una `analysis_date` más
reciente (y sus filas asociadas) — el panel siempre muestra el reporte
más nuevo automáticamente.

### Íconos disponibles

Las tablas `metrics`, `losses` y `opportunities` guardan el ícono como
texto (`icon_key`) porque Supabase no puede guardar componentes de
React. Las claves válidas están en `lib/icons.ts`:

`trending-up`, `star`, `message-square`, `users`, `thumbs-down`,
`clock`, `megaphone`, `camera`.

## 6. Desplegar a Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa
   el repo.
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (los mismos valores de tu `.env.local`)
4. Deploy. Cada cliente entra con su email/contraseña en
   `https://tu-dominio.vercel.app/login`.

## Estructura del proyecto

```
app/
  login/page.tsx      → pantalla de login
  panel/page.tsx       → panel protegido, carga datos del cliente actual
  layout.tsx
components/
  VisIaPanelInicio.tsx  → el diseño aprobado, ahora recibe `data` por props
  PanelShell.tsx        → conecta el botón "Mi Cuenta" con cerrar sesión
lib/
  supabase/             → clientes de Supabase (browser, servidor, middleware)
  queries.ts             → lee cliente + último reporte + filas asociadas
  icons.ts                → mapea icon_key (texto) → ícono de lucide-react
  types.ts                 → tipos de los datos del panel
supabase/
  schema.sql             → tablas + políticas RLS (correr una vez)
  seed_demo.sql            → datos de ejemplo (Café Central Marietta)
middleware.ts            → protege /panel, redirige a /login si no hay sesión
```

## Notas sobre lo que falta para la "Versión 2"

Esto deja el panel **funcional y seguro para clientes reales** con
login real y datos por cliente. Cosas que mencionaste como futuras
(no incluidas aquí todavía):

- Panel de administración (CRUD) para que tú cargues reportes sin
  tocar SQL directamente.
- Integración automática con Google Sheets como fuente de datos.
- Botón "Descargar reporte" (actualmente es solo visual).
- Vistas de las otras secciones del menú lateral (VIS Score,
  Reputación, Plan de Acción, etc.) — hoy solo "Inicio" tiene datos
  reales.
