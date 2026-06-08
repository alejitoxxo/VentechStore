// src/routes/categories.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');
const slugify = require('slugify');

const router = express.Router();
const prisma = new PrismaClient();

const makeSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'es' });

// GET /api/categories/admin/all — MUST be before /:id
router.get('/admin/all', authenticate, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

// GET /api/categories — public, active only + product count
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { products: { where: { active: true } } } },
      },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

// POST /api/categories — admin create
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, imageUrl, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    const slug = makeSlug(name);
    const category = await prisma.category.create({
      data: {
        name: name.trim().toUpperCase(),
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        order: parseInt(order) || 0,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error creando categoría' });
  }
});

// PUT /api/categories/:id — admin update
router.put('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const { name, description, imageUrl, active, order } = req.body;
    const data = {};
    if (name !== undefined) {
      data.name = name.trim().toUpperCase();
      data.slug = makeSlug(name);
    }
    if (description !== undefined) data.description = description || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (active !== undefined) data.active = active === true || active === 'true';
    if (order !== undefined) data.order = parseInt(order) || 0;

    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Nombre duplicado' });
    res.status(500).json({ error: 'Error actualizando categoría' });
  }
});

// DELETE /api/categories/:id — admin, only if no products
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({
        error: `No se puede eliminar: tiene ${count} producto${count !== 1 ? 's' : ''} asignado${count !== 1 ? 's' : ''}`,
      });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(500).json({ error: 'Error eliminando categoría' });
  }
});

module.exports = router;
