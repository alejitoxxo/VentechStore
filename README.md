# 🚀 Ventech E-commerce

Plataforma de catálogo/e-commerce para Ventech.  
Stack: **React + Vite + Tailwind** (frontend) · **Node.js + Express + Prisma + SQLite** (backend)

---

## ⚡ Inicio rápido (local)

### 1. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# ⚠️  Editá .env: cambiá JWT_SECRET por una cadena larga y aleatoria

# Generar cliente Prisma
npx prisma generate

# Crear la base de datos y tablas
npx prisma migrate dev --name init

# Cargar datos iniciales (admin + categorías + productos de prueba)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

Backend corriendo en → **http://localhost:3001**

---

### 2. Frontend (nueva terminal)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

Frontend corriendo en → **http://localhost:5173**

---

## 🔐 Acceso al panel admin

```
URL:       http://localhost:5173/admin
Email:     admin@ventech.store
Password:  Admin123456
```

> ⚠️ **Cambiá la contraseña después del primer acceso** desde Configuración → Cambiar contraseña.

---

## 📦 Cómo importar tus 1228 productos

### Opción A — Panel admin (recomendado)

1. Ir a **Admin → Importar**
2. Preparar un archivo `productos.json`:

```json
[
  {
    "code": "12253",
    "name": "AURICULAR AITECH FLAT AI-300 ML",
    "category": "AURICULARES",
    "price": 1194,
    "stock": true,
    "active": true,
    "featured": false
  },
  {
    "code": "10293",
    "name": "COMBO INALAMBRICO NOGA METALIZADO S5600",
    "category": "TECLADOS Y MOUSE",
    "price": 19750,
    "stock": true,
    "active": true,
    "featured": true
  }
]
```

3. Subir el archivo → ver reporte de importación
4. Las categorías que no existan **se crean automáticamente**

### Opción B — CSV

```
code,name,category,price,stock,active,featured
12253,AURICULAR AITECH FLAT AI-300 ML,AURICULARES,1194,true,true,false
10293,COMBO INALAMBRICO NOGA S5600,TECLADOS Y MOUSE,19750,true,true,true
```

---

## 🌐 Endpoints de la API

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login, devuelve JWT |
| GET | `/api/auth/me` | ✅ | Usuario actual |
| POST | `/api/auth/logout` | ❌ | (client-side) |
| POST | `/api/auth/change-password` | ✅ | Cambiar contraseña |

### Productos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products` | ❌ | Listado público con filtros |
| GET | `/api/products/:id` | ❌ | Producto público por id/slug/code |
| GET | `/api/products/admin/all` | ✅ | Listado admin (todos los estados) |
| GET | `/api/products/admin/:id` | ✅ | Producto admin por id |
| POST | `/api/products` | ✅ | Crear producto |
| PUT | `/api/products/:id` | ✅ | Editar producto |
| DELETE | `/api/products/:id` | ✅ | Eliminar producto |
| PATCH | `/api/products/:id/toggle-active` | ✅ | Activar/desactivar |
| PATCH | `/api/products/:id/toggle-stock` | ✅ | Cambiar stock |
| PATCH | `/api/products/:id/featured` | ✅ | Destacar/quitar destaque |

### Categorías
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/categories` | ❌ | Listado público activo |
| GET | `/api/categories/admin/all` | ✅ | Listado admin completo |
| POST | `/api/categories` | ✅ | Crear categoría |
| PUT | `/api/categories/:id` | ✅ | Editar categoría |
| DELETE | `/api/categories/:id` | ✅ | Eliminar (si no tiene productos) |

### Import / Export / Upload
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/import/products/json` | ✅ | Importar archivo JSON |
| POST | `/api/import/products/csv` | ✅ | Importar archivo CSV |
| GET | `/api/export/products/json` | ✅ | Exportar JSON |
| GET | `/api/export/products/csv` | ✅ | Exportar CSV (con BOM Excel) |
| POST | `/api/upload/product-image` | ✅ | Subir imagen (max 5MB) |

### Otros
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/settings` | ❌ | Configuración pública |
| PUT | `/api/settings` | ✅ | Actualizar configuración |
| GET | `/api/dashboard/stats` | ✅ | Estadísticas del panel |
| GET | `/api/health` | ❌ | Health check |

---

## 🏗️ Estructura del proyecto

```
ventech-ecommerce/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        ← Modelos DB (User, Product, Category, Setting, Tag)
│   │   └── seed.js              ← Admin inicial + categorías + productos de prueba
│   ├── src/
│   │   ├── index.js             ← Entry point Express
│   │   ├── middlewares/
│   │   │   └── auth.js          ← Verificación JWT
│   │   └── routes/
│   │       ├── auth.js          ← Login, me, change-password
│   │       ├── products.js      ← CRUD + toggles
│   │       ├── categories.js    ← CRUD categorías
│   │       ├── upload.js        ← Upload de imágenes
│   │       ├── import.js        ← Importador JSON/CSV
│   │       ├── export.js        ← Exportador JSON/CSV
│   │       ├── settings.js      ← Configuración del negocio
│   │       └── dashboard.js     ← Estadísticas admin
│   ├── uploads/                 ← Imágenes subidas (gitignored)
│   ├── .env                     ← Variables locales (gitignored)
│   ├── .env.example             ← Plantilla de variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx              ← Router principal (React Router v6)
    │   ├── main.jsx             ← Entry point React
    │   ├── index.css            ← Tailwind + estilos globales
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── PublicLayout.jsx   ← Navbar + Footer + WhatsApp float
    │   │   │   └── AdminLayout.jsx    ← Sidebar admin + topbar
    │   │   ├── public/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── ProductCard.jsx    ← Tarjeta de producto con acciones
    │   │   │   └── WhatsAppFloat.jsx  ← Botón flotante WhatsApp
    │   │   └── ui/
    │   │       ├── Skeleton.jsx       ← Loaders shimmer
    │   │       ├── EmptyState.jsx     ← Estado vacío
    │   │       ├── ConfirmDialog.jsx  ← Confirmación antes de eliminar
    │   │       └── Pagination.jsx     ← Paginación
    │   ├── pages/
    │   │   ├── public/
    │   │   │   ├── HomePage.jsx       ← Hero + categorías + destacados + novedades
    │   │   │   ├── CatalogPage.jsx    ← Catálogo con filtros + paginación
    │   │   │   ├── ProductPage.jsx    ← Detalle de producto
    │   │   │   ├── CategoriesPage.jsx ← Grilla de categorías
    │   │   │   ├── CartPage.jsx       ← Lista de consulta WhatsApp
    │   │   │   └── NotFoundPage.jsx   ← 404
    │   │   └── admin/
    │   │       ├── LoginPage.jsx
    │   │       ├── DashboardPage.jsx
    │   │       ├── AdminProductsPage.jsx    ← Tabla con edición rápida
    │   │       ├── AdminProductFormPage.jsx ← Crear/editar producto
    │   │       ├── AdminCategoriesPage.jsx  ← CRUD categorías inline
    │   │       ├── AdminImportPage.jsx      ← Importar/exportar
    │   │       └── AdminSettingsPage.jsx    ← Configuración del negocio
    │   ├── hooks/
    │   │   ├── useAuth.js        ← Contexto de autenticación
    │   │   ├── useCart.js        ← Carrito/lista de consulta (localStorage)
    │   │   └── useSettings.js    ← Configuración global del negocio
    │   ├── services/
    │   │   └── api.js            ← Axios con interceptores JWT
    │   └── utils/
    │       └── format.js         ← formatPrice, formatDate, downloadBlob
    ├── index.html
    ├── vite.config.js            ← Proxy /api → localhost:3001
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Deploy a producción

### Backend — Railway / Render / Hostinger VPS

**Variables de entorno requeridas:**
```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="cadena-aleatoria-muy-larga-minimo-32-caracteres"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://tu-dominio.com"
```

**Comandos de build:**
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
```

**Comando de inicio:**
```bash
npm start
```

### Migrar a PostgreSQL (producción)

En `backend/prisma/schema.prisma`, cambiar:
```prisma
datasource db {
  provider = "postgresql"   # ← antes era "sqlite"
  url      = env("DATABASE_URL")
}
```

Y usar una URL de PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:5432/ventech?schema=public"
```

### Frontend — Vercel / Netlify

1. Build command: `npm run build`
2. Output directory: `dist`
3. Agregar variable de entorno si el backend está en otro dominio:

En `frontend/vite.config.js`, el proxy ya está configurado para desarrollo.  
En producción, crear `frontend/.env.production`:
```env
VITE_API_URL=https://tu-backend.onrender.com
```

Y actualizar `frontend/src/services/api.js`:
```js
baseURL: import.meta.env.VITE_API_URL || '/api',
```

---

## 🐛 Troubleshooting

**Error: `@prisma/client did not initialize`**
```bash
cd backend && npx prisma generate
```

**Error: `Table not found`**
```bash
cd backend && npx prisma migrate dev --name init
```

**Error de CORS**
- Verificar que `FRONTEND_URL` en `.env` coincida exactamente con la URL del frontend

**Ver base de datos visualmente**
```bash
cd backend && npx prisma studio
# Abre http://localhost:5555
```

---

## 🔮 Mejoras futuras

| Feature | Descripción |
|---------|-------------|
| MercadoPago | Integración de pagos online |
| Multi-usuario | Roles: admin, operador, vendedor |
| Estadísticas | Consultas por producto, conversión |
| PDF importer | Extraer productos directo del PDF de Distriphone |
| Instagram | Auto-publicar productos como stories/posts |
| Flyers IA | Generación automática con Claude/GPT |
| Cupones | Sistema de descuentos por código |
| Historial | Registro de consultas por WhatsApp |

---

*Ventech © 2025*
