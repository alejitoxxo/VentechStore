// src/routes/products.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');
const slugify = require('slugify');

const router = express.Router();
const prisma = new PrismaClient();

const makeSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'es' });

// ─── IMPORTANT: static routes BEFORE /:id ────────────────────────────────────

// GET /api/products/admin/all — admin, ALL products with filters
router.get('/admin/all', authenticate, async (req, res) => {
  try {
    const {
      search, category, active, inStock,
      page = 1, limit = 50,
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { slug: category };
    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;
    if (inStock === 'true') where.inStock = true;
    if (inStock === 'false') where.inStock = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

// GET /api/products/admin/:id — admin, single product (no active filter)
router.get('/admin/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
});

// ─── PUBLIC routes ────────────────────────────────────────────────────────────

// GET /api/products — public listing
router.get('/', async (req, res) => {
  try {
    const {
      category, search, inStock, featured, isNew,
      sortBy = 'createdAt', sortDir = 'desc',
      page = 1, limit = 24,
    } = req.query;

    const where = { active: true };

    if (category) where.category = { slug: category };
    if (inStock === 'true') where.inStock = true;
    if (featured === 'true') where.featured = true;
    if (isNew === 'true') where.isNew = true;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Check showOutOfStock setting
    const showOutOfStock = await prisma.setting.findUnique({
      where: { key: 'showOutOfStock' },
    });
    // Only force hide if setting is explicitly 'false' AND no inStock filter is set
    if (
      (!showOutOfStock || showOutOfStock.value === 'false') &&
      inStock === undefined
    ) {
      where.inStock = true;
    }

    const validSortFields = ['price', 'name', 'createdAt', 'code'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDir = sortDir === 'asc' ? 'asc' : 'desc';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100); // cap at 100

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { [orderField]: orderDir },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

// GET /api/products/:id — public single product
router.get('/:id', async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const numericId = parseInt(idOrSlug);

    const product = await prisma.product.findFirst({
      where: {
        active: true,
        OR: [
          ...(isNaN(numericId) ? [] : [{ id: numericId }]),
          { slug: idOrSlug },
          { code: idOrSlug },
        ],
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
});

// ─── ADMIN CRUD ───────────────────────────────────────────────────────────────

// POST /api/products — create
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      code, name, price, categoryId,
      description, shortDescription, imageUrl,
      active, inStock, featured, isNew,
    } = req.body;

    if (!code || !name || price === undefined || !categoryId) {
      return res.status(400).json({
        error: 'Campos requeridos: code, name, price, categoryId',
      });
    }

    let slug = makeSlug(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${code}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const product = await prisma.product.create({
      data: {
        code: String(code),
        name: String(name),
        slug,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        description: description || null,
        shortDescription: shortDescription || null,
        imageUrl: imageUrl || null,
        active: active !== false && active !== 'false',
        inStock: inStock !== false && inStock !== 'false',
        featured: featured === true || featured === 'true',
        isNew: isNew === true || isNew === 'true',
      },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código' });
    }
    res.status(500).json({ error: 'Error creando producto' });
  }
});

// PUT /api/products/:id — update
router.put('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const {
      name, price, categoryId, description,
      shortDescription, imageUrl, active,
      inStock, featured, isNew, code,
    } = req.body;

    const data = {};
    if (name !== undefined) {
      data.name = String(name);
      data.slug = makeSlug(name + '-' + id);
    }
    if (price !== undefined) data.price = parseFloat(price);
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
    if (description !== undefined) data.description = description || null;
    if (shortDescription !== undefined) data.shortDescription = shortDescription || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (active !== undefined) data.active = active === true || active === 'true';
    if (inStock !== undefined) data.inStock = inStock === true || inStock === 'true';
    if (featured !== undefined) data.featured = featured === true || featured === 'true';
    if (isNew !== undefined) data.isNew = isNew === true || isNew === 'true';
    if (code !== undefined) data.code = String(code);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Producto no encontrado' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Código duplicado' });
    res.status(500).json({ error: 'Error actualizando producto' });
  }
});

// DELETE /api/products/bulk
router.delete('/bulk', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de IDs no vacío' });
    }

    // Normalizar y validar que todos los IDs sean enteros válidos
    const parsedIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (parsedIds.length === 0) {
      return res.status(400).json({ error: 'IDs provistos son inválidos' });
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: { in: parsedIds }
      }
    });

    res.json({ message: 'Productos eliminados', count: result.count });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Error eliminando productos en lote' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(500).json({ error: 'Error eliminando producto' });
  }
});

// PATCH toggle active
router.patch('/:id/toggle-active', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Producto no encontrado' });
    const product = await prisma.product.update({
      where: { id },
      data: { active: !current.active },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// PATCH toggle stock
router.patch('/:id/toggle-stock', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Producto no encontrado' });
    const product = await prisma.product.update({
      where: { id },
      data: { inStock: !current.inStock },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// PATCH toggle featured
router.patch('/:id/featured', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Producto no encontrado' });
    const product = await prisma.product.update({
      where: { id },
      data: { featured: !current.featured },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

module.exports = router;
