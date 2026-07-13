# VentechStore

Catalogo web/e-commerce liviano para productos tecnologicos con consulta por WhatsApp.

VentechStore permite publicar productos, organizar categorias, mostrar fichas individuales y derivar consultas o pedidos a WhatsApp con un mensaje armado automaticamente. La tienda no procesa pagos online: el cierre comercial ocurre por WhatsApp.

## Estado actual

- MVP tecnico listo.
- Produccion activa.
- Frontend desplegado en Vercel.
- Backend desplegado en Render.
- Base de datos en Neon PostgreSQL.
- Admin operativo.
- Catalogo, busqueda, categorias, detalle de producto, WhatsApp, settings y bulk delete funcionando.
- Rama estable oficial: `main`.
- Hito estable importante: `47f2846 feat: implement product bulk delete and dynamic visual settings configuration`.

Ultima auditoria local: el repositorio estaba limpio en `main`, el health check de produccion respondia `200 OK` y Prisma validaba correctamente el schema PostgreSQL.

## URLs principales

- Web publica: https://ventech-store-prod.vercel.app/
- Admin: https://ventech-store-prod.vercel.app/admin/login
- Backend API base: https://ventech-backend-wyoc.onrender.com/api
- Health check: https://ventech-backend-wyoc.onrender.com/api/health

## Stack tecnologico

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast
- Lucide Icons
- Deploy en Vercel

### Backend

- Node.js
- Express
- Prisma ORM
- JWT
- CORS
- Bcrypt
- Multer
- Deploy en Render

### Base de datos

- Neon PostgreSQL
- Prisma como capa ORM

## Funcionalidades publicas

- Home.
- Catalogo de productos.
- Pagina de categorias.
- Busqueda case-insensitive.
- Paginacion.
- Ficha individual de producto.
- Boton flotante de WhatsApp.
- Lista de consulta/pedido por WhatsApp.
- Mensaje automatico con producto, codigo y precio.
- Diseno responsive.
- Logo dinamico desde settings, si esta configurado.
- Banner dinamico desde settings, si esta configurado.
- Titulo y subtitulo dinamicos del hero desde settings, si estan configurados.

## Funcionalidades admin

- Login protegido por JWT.
- Dashboard.
- CRUD de productos.
- CRUD de categorias.
- Borrado masivo de productos.
- Upload de imagenes de producto.
- Import/export JSON y CSV disponible en codigo.
- Settings comerciales:
  - Nombre de tienda.
  - WhatsApp.
  - Instagram.
  - Mensaje predeterminado.
  - Modo de venta.
  - Mostrar/ocultar productos sin stock.
  - Color de acento.
- Settings visuales:
  - `logoUrl`
  - `bannerUrl`
  - `heroTitle`
  - `heroSubtitle`

## Flujo de consulta

1. El cliente entra a la tienda.
2. Busca o navega productos.
3. Revisa el detalle del producto.
4. Agrega productos a la consulta o usa el boton de WhatsApp.
5. La app arma un mensaje con los datos del producto.
6. El cliente es redirigido a WhatsApp para cerrar la venta.

No hay carrito de pago ni checkout online. La web funciona como catalogo comercial con derivacion a WhatsApp.

## Estructura del repositorio

```text
ventech-ecommerce/
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- components/
|   |   |   |-- layout/
|   |   |   |-- public/
|   |   |   `-- ui/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |   |-- admin/
|   |   |   `-- public/
|   |   |-- services/
|   |   |   `-- api.js
|   |   `-- utils/
|   |-- public/
|   |-- vite.config.js
|   |-- vercel.json
|   `-- package.json
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   |-- seed.js
|   |   `-- migrations/
|   |-- src/
|   |   |-- index.js
|   |   |-- middlewares/
|   |   `-- routes/
|   |       |-- auth.js
|   |       |-- categories.js
|   |       |-- dashboard.js
|   |       |-- export.js
|   |       |-- import.js
|   |       |-- products.js
|   |       |-- settings.js
|   |       `-- upload.js
|   |-- uploads/
|   `-- package.json
|-- setup.sh
`-- README.md
```

### Carpetas clave

- `frontend/`: aplicacion React/Vite.
- `frontend/src/services/api.js`: cliente Axios, `VITE_API_URL`, token JWT e interceptores.
- `frontend/vite.config.js`: proxy local de `/api` y `/uploads` hacia `localhost:3001`.
- `frontend/vercel.json`: rewrite SPA hacia `index.html`.
- `backend/`: API Express.
- `backend/src/index.js`: entrada del servidor, CORS, rutas y health check.
- `backend/src/routes/`: endpoints de negocio.
- `backend/prisma/schema.prisma`: modelos `User`, `Category`, `Product`, `Tag`, `ProductTag` y `Setting`.
- `backend/uploads/`: imagenes subidas; los archivos reales estan ignorados por Git salvo `.gitkeep`.

Nota: existe una carpeta residual llamada `{frontend/` sin archivos relevantes detectados. Revisar antes de borrarla.

## Variables de entorno

No commitear archivos `.env` ni compartir valores reales.

### Frontend

- `VITE_API_URL`

`VITE_API_URL` apunta a la API de produccion cuando el frontend esta desplegado. En desarrollo, si no esta definida, el frontend usa `/api` y Vite lo proxyea al backend local.

### Backend

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV`
- `FRONTEND_URL`
- `PORT`

El backend actual usa PostgreSQL. No usar valores SQLite antiguos en entornos actuales salvo que se este preparando una instancia local aislada y consciente.

## Instalacion local

### Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

El backend local queda disponible en:

```text
http://localhost:3001
```

Health check local:

```text
http://localhost:3001/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend local queda disponible en:

```text
http://localhost:5173
```

## Desarrollo local

- Levantar primero el backend en `localhost:3001`.
- Levantar despues el frontend en `localhost:5173`.
- El frontend consume `/api` y `/uploads`; Vite redirige esas rutas al backend local.
- Si se cambia el schema Prisma, ejecutar `npx prisma generate`.
- No ejecutar `npm run seed` contra una base real sin confirmar primero: puede crear o alterar datos iniciales.
- No ejecutar migraciones destructivas ni reset de base sin backup y aprobacion explicita.

## Build

### Frontend

```bash
cd frontend
npm run build
```

Salida esperada:

```text
frontend/dist
```

### Backend

El backend no tiene paso de build. En produccion se usa:

```bash
cd backend
npm start
```

Antes de iniciar en un entorno nuevo:

```bash
npx prisma generate
```

## Deploy

### Frontend: Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Variable requerida: `VITE_API_URL`

### Backend: Render

- Start command: `npm start`
- Variables requeridas:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `NODE_ENV`
  - `FRONTEND_URL`
  - `PORT`

Importante: el plan gratuito de Render puede dormir el servicio. El primer request despues de inactividad puede tardar aproximadamente 10 a 15 segundos.

### Base de datos: Neon

- PostgreSQL gestionado.
- Prisma se conecta usando `DATABASE_URL`.
- Rotar credenciales si fueron expuestas o compartidas fuera de un entorno seguro.

## Endpoints principales

- `GET /api/health`: health check.
- `GET /api/products`: listado publico de productos con filtros/paginacion.
- `GET /api/products/:id`: producto publico por id, slug o codigo.
- `POST /api/products`: crear producto, requiere auth.
- `PUT /api/products/:id`: editar producto, requiere auth.
- `DELETE /api/products/:id`: eliminar producto, requiere auth.
- `DELETE /api/products/bulk`: borrado masivo, requiere auth.
- `GET /api/categories`: categorias publicas activas.
- `GET /api/categories/admin/all`: categorias admin, requiere auth.
- `GET /api/settings`: settings publicos.
- `PUT /api/settings`: actualizar settings, requiere auth.
- `POST /api/auth/login`: login admin.
- `GET /api/auth/me`: usuario actual, requiere auth.
- `GET /api/dashboard/stats`: dashboard admin, requiere auth.

## Seguridad

- No commitear `.env`.
- No compartir `DATABASE_URL`.
- No compartir `JWT_SECRET`.
- No imprimir tokens completos en logs, issues, commits o documentacion.
- Cambiar la contrasena final del admin antes de publicitar fuerte.
- Rotar credenciales de Neon si alguna vez fueron expuestas.
- Hacer backup/export antes de limpiar productos reales.
- No borrar categorias, settings, usuarios ni credenciales sin aprobacion explicita.

## Estado comercial pendiente

La base tecnica esta lista. Antes de publicitar fuerte conviene cerrar:

- Nombre comercial final.
- WhatsApp definitivo.
- Instagram.
- Logo real.
- Banner real.
- `heroTitle` y `heroSubtitle` finales.
- Imagenes de productos principales.
- Limpieza de productos de prueba o no deseados, siempre con backup/export previo.
- Contrasena final del admin.
- Rotacion de credenciales sensibles.
- Posible upgrade de Render para evitar espera por cold start.

## Checklist QA rapido

- Abrir web publica.
- Probar catalogo.
- Probar busqueda.
- Probar categorias.
- Probar producto individual.
- Probar boton/lista de WhatsApp.
- Verificar mensaje automatico con producto, codigo y precio.
- Probar login admin.
- Probar dashboard.
- Crear/editar un producto de prueba.
- Probar bulk delete solo con producto de prueba.
- Probar settings comerciales.
- Probar settings visuales: `logoUrl`, `bannerUrl`, `heroTitle`, `heroSubtitle`.
- Verificar responsive en mobile y desktop.
- Verificar `/api/health`.

## Cosas que no conviene tocar sin un bug real

- Logica de WhatsApp.
- Busqueda.
- Prisma schema principal.
- CORS.
- Deploy de Vercel/Render.
- Variables de entorno.
- Credenciales.
- Usuarios admin.
- Categorias reales.
- Settings reales.

## Historial breve de hitos

- Migracion a PostgreSQL/Neon.
- Deploy de frontend en Vercel.
- Deploy de backend en Render.
- Fix de `VITE_API_URL` para produccion.
- Implementacion de bulk delete.
- Settings visuales dinamicos: `logoUrl`, `bannerUrl`, `heroTitle`, `heroSubtitle`.
- Ajustes de banner/asset en Vite y rewrites de Vercel.

## Reglas para futuros agentes

- Partir siempre desde `main` para trabajo nuevo.
- Crear una rama nueva para cambios no triviales.
- Hacer cambios pequenos y faciles de revisar.
- Probar antes de proponer commit.
- No hacer merge a `main` sin aprobacion.
- No hacer deploy manual sin avisar.
- No ejecutar seed, migraciones destructivas ni limpieza de catalogo sin confirmacion.
- No incluir secretos en README, issues, commits, logs ni respuestas.
