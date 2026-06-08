// src/routes/export.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/export/products/json
router.get('/products/json', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { code: 'asc' },
    });

    const data = products.map((p) => ({
      code: p.code,
      name: p.name,
      category: p.category.name,
      price: p.price,
      stock: p.inStock,
      active: p.active,
      featured: p.featured,
      isNew: p.isNew,
      image: p.imageUrl || '',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
    }));

    res.setHeader('Content-Disposition', `attachment; filename="ventech-productos-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error exportando productos' });
  }
});

// GET /api/export/products/csv
router.get('/products/csv', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { code: 'asc' },
    });

    const escapeCSV = (val) => {
      const str = String(val === null || val === undefined ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'code', 'name', 'category', 'price',
      'stock', 'active', 'featured', 'isNew',
      'image', 'description', 'shortDescription',
    ];

    const rows = products.map((p) =>
      [
        escapeCSV(p.code),
        escapeCSV(p.name),
        escapeCSV(p.category.name),
        escapeCSV(p.price),
        escapeCSV(p.inStock),
        escapeCSV(p.active),
        escapeCSV(p.featured),
        escapeCSV(p.isNew),
        escapeCSV(p.imageUrl || ''),
        escapeCSV(p.description || ''),
        escapeCSV(p.shortDescription || ''),
      ].join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ventech-productos-${Date.now()}.csv"`
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // BOM for Excel compatibility
    res.send('\uFEFF' + csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error exportando productos' });
  }
});

module.exports = router;
