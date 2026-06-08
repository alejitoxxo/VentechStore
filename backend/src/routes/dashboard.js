// src/routes/dashboard.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      outOfStock,
      inactiveProducts,
      totalCategories,
      featuredProducts,
      recentProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { inStock: false, active: true } }),
      prisma.product.count({ where: { active: false } }),
      prisma.category.count({ where: { active: true } }),
      prisma.product.count({ where: { featured: true, active: true } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    ]);

    res.json({
      totalProducts,
      activeProducts,
      outOfStock,
      inactiveProducts,
      totalCategories,
      featuredProducts,
      recentProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;
