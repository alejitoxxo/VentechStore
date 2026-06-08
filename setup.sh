#!/bin/bash
# setup.sh — instala y configura Ventech localmente

set -e

echo ""
echo "🚀 Setup de Ventech E-commerce"
echo "================================"
echo ""

# ── Backend ──────────────────────────────────────────────────────────────────
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✅ .env creado desde .env.example"
  echo "⚠️  Editá backend/.env y cambiá JWT_SECRET antes de continuar"
fi

echo ""
echo "🗄️  Configurando base de datos..."
npx prisma generate
npx prisma migrate dev --name init
npm run seed

cd ..

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup completado!"
echo ""
echo "Para iniciar el proyecto:"
echo "  Terminal 1 → cd backend && npm run dev"
echo "  Terminal 2 → cd frontend && npm run dev"
echo ""
echo "URLs:"
echo "  Tienda:  http://localhost:5173"
echo "  Admin:   http://localhost:5173/admin"
echo "  API:     http://localhost:3001/api/health"
echo ""
echo "Credenciales admin:"
echo "  Email:    admin@ventech.store"
echo "  Password: Admin123456"
echo ""
