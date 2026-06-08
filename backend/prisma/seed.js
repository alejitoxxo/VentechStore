// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin user
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@ventech.store' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123456', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@ventech.store',
        passwordHash,
        role: 'admin',
      },
    });
    console.log('✅ Usuario admin creado: admin@ventech.store / Admin123456');
  }

  // Settings
  const defaultSettings = [
    { key: 'businessName', value: 'Ventech' },
    { key: 'whatsappNumber', value: '5491100000000' },
    { key: 'instagram', value: '@ventech' },
    { key: 'email', value: 'ventech@gmail.com' },
    { key: 'showOutOfStock', value: 'false' },
    { key: 'whatsappMessage', value: 'Hola, quiero consultar por estos productos:' },
    { key: 'mode', value: 'minorista' },
    { key: 'accentColor', value: '#2563EB' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('✅ Settings configurados');

  // Categories
  const categoriesData = [
    { name: 'AURICULARES', slug: 'auriculares', order: 1 },
    { name: 'CABLES', slug: 'cables', order: 2 },
    { name: 'TECLADOS Y MOUSE', slug: 'teclados-y-mouse', order: 3 },
    { name: 'CARGADORES', slug: 'cargadores', order: 4 },
    { name: 'PARLANTES', slug: 'parlantes', order: 5 },
    { name: 'GAMING', slug: 'gaming', order: 6 },
    { name: 'CELULARES', slug: 'celulares', order: 7 },
    { name: 'ACCESORIOS', slug: 'accesorios', order: 8 },
  ];

  const createdCats = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCats[cat.name] = c.id;
  }
  console.log('✅ Categorías creadas');

  // Sample products
  const products = [
    {
      code: '12253',
      name: 'AURICULAR AITECH FLAT AI-300 ML',
      slug: 'auricular-aitech-flat-ai-300-ml',
      price: 1194,
      inStock: true,
      active: true,
      featured: true,
      isNew: true,
      categoryName: 'AURICULARES',
    },
    {
      code: '11009',
      name: 'AURICULAR EARBUDS BT NETMAK',
      slug: 'auricular-earbuds-bt-netmak',
      price: 24803,
      inStock: true,
      active: true,
      featured: false,
      isNew: false,
      categoryName: 'AURICULARES',
    },
    {
      code: '12248',
      name: 'AURICULAR KARSEN MARS IPHONE ML',
      slug: 'auricular-karsen-mars-iphone-ml',
      price: 3790,
      inStock: true,
      active: true,
      featured: false,
      isNew: true,
      categoryName: 'AURICULARES',
    },
    {
      code: '10293',
      name: 'COMBO INALAMBRICO NOGA METALIZADO S5600',
      slug: 'combo-inalambrico-noga-metalizado-s5600',
      price: 19750,
      inStock: true,
      active: true,
      featured: true,
      isNew: false,
      categoryName: 'TECLADOS Y MOUSE',
    },
    {
      code: '12191',
      name: 'CABLE 2 A 1 PLUG A RCA NOGA 5 MTS',
      slug: 'cable-2-a-1-plug-a-rca-noga-5-mts',
      price: 1739,
      inStock: false,
      active: true,
      featured: false,
      isNew: false,
      categoryName: 'CABLES',
    },
    {
      code: '10001',
      name: 'PARLANTE BLUETOOTH AIWA PORTÁTIL',
      slug: 'parlante-bluetooth-aiwa-portatil',
      price: 32500,
      inStock: true,
      active: true,
      featured: true,
      isNew: false,
      categoryName: 'PARLANTES',
    },
    {
      code: '10002',
      name: 'CARGADOR RÁPIDO USB-C 65W',
      slug: 'cargador-rapido-usb-c-65w',
      price: 8900,
      inStock: true,
      active: true,
      featured: false,
      isNew: true,
      categoryName: 'CARGADORES',
    },
    {
      code: '10003',
      name: 'MOUSE GAMER RGB NOGA XT-900',
      slug: 'mouse-gamer-rgb-noga-xt-900',
      price: 15200,
      inStock: true,
      active: true,
      featured: false,
      isNew: false,
      categoryName: 'GAMING',
    },
  ];

  for (const p of products) {
    const { categoryName, ...data } = p;
    await prisma.product.upsert({
      where: { code: data.code },
      update: {},
      create: { ...data, categoryId: createdCats[categoryName] },
    });
  }
  console.log('✅ Productos de prueba creados');
  console.log('\n🚀 Seed completado exitosamente!');
  console.log('📧 Admin: admin@ventech.store');
  console.log('🔑 Password: Admin123456');
  console.log('⚠️  ¡Cambia la contraseña en producción!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
