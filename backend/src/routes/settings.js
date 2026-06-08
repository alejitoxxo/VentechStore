// src/routes/settings.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/settings — public (needed by frontend for WhatsApp number, name, etc.)
router.get('/', async (req, res) => {
  try {
    const rows = await prisma.setting.findMany();
    const obj = {};
    rows.forEach((s) => {
      obj[s.key] = s.value;
    });
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

// PUT /api/settings — admin only
router.put('/', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Se esperan pares clave/valor' });
    }

    // Upsert each key
    for (const [key, value] of Object.entries(updates)) {
      if (typeof key !== 'string' || key.trim() === '') continue;
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    // Return updated settings
    const rows = await prisma.setting.findMany();
    const obj = {};
    rows.forEach((s) => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando configuración' });
  }
});

module.exports = router;
