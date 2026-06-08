// src/routes/import.js
const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');
const slugify = require('slugify');

const router = express.Router();
const prisma = new PrismaClient();

// Store files in memory for parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const makeSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'es' });

// Get or create a category by name
async function getOrCreateCategory(name) {
  const cleanName = String(name || 'GENERAL').trim().toUpperCase();
  const slug = makeSlug(cleanName);

  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    // Also try by name
    category = await prisma.category.findUnique({ where: { name: cleanName } });
  }
  if (!category) {
    category = await prisma.category.create({
      data: { name: cleanName, slug, active: true, order: 99 },
    });
    return { category, created: true };
  }
  return { category, created: false };
}

// Core import logic — shared by JSON and CSV
async function importProducts(products) {
  const result = {
    created: 0,
    updated: 0,
    errors: [],
    newCategories: [],
  };

  for (const p of products) {
    try {
      // Validate required fields
      if (!p.code && p.code !== 0) {
        result.errors.push({ item: p, error: 'Campo "code" requerido' });
        continue;
      }
      if (!p.name) {
        result.errors.push({ item: p, error: `Código ${p.code}: falta "name"` });
        continue;
      }
      if (p.price === undefined || p.price === null || p.price === '') {
        result.errors.push({ item: p, error: `Código ${p.code}: falta "price"` });
        continue;
      }

      const parsedPrice = parseFloat(p.price);
      if (isNaN(parsedPrice)) {
        result.errors.push({ item: p, error: `Código ${p.code}: precio inválido "${p.price}"` });
        continue;
      }

      // Get/create category
      const { category, created: catCreated } = await getOrCreateCategory(
        p.category || p.categoria || 'GENERAL'
      );
      if (catCreated && !result.newCategories.includes(category.name)) {
        result.newCategories.push(category.name);
      }

      // Build slug
      const codeStr = String(p.code);
      let slug = makeSlug(String(p.name) + '-' + codeStr);

      // Parse booleans robustly
      const parseBool = (val, def = true) => {
        if (val === undefined || val === null || val === '') return def;
        if (typeof val === 'boolean') return val;
        return String(val).toLowerCase() === 'true' || val === '1';
      };

      const data = {
        code: codeStr,
        name: String(p.name).trim(),
        slug,
        price: parsedPrice,
        categoryId: category.id,
        inStock: parseBool(p.stock !== undefined ? p.stock : p.inStock, true),
        active: parseBool(p.active, true),
        featured: parseBool(p.featured, false),
        isNew: parseBool(p.isNew || p.is_new, false),
        imageUrl: p.image || p.imageUrl || p.imagen || null,
        description: p.description || p.descripcion || null,
        shortDescription: p.shortDescription || p.short_description || null,
      };

      const existing = await prisma.product.findUnique({ where: { code: data.code } });
      if (existing) {
        // On update, don't change slug to avoid breaking links
        delete data.slug;
        await prisma.product.update({ where: { code: data.code }, data });
        result.updated++;
      } else {
        // Ensure slug is unique
        const slugExists = await prisma.product.findUnique({ where: { slug: data.slug } });
        if (slugExists) {
          data.slug = data.slug + '-' + Date.now();
        }
        await prisma.product.create({ data });
        result.created++;
      }
    } catch (err) {
      console.error('Import error for product:', p.code, err.message);
      result.errors.push({
        item: { code: p.code, name: p.name },
        error: err.message,
      });
    }
  }

  return result;
}

// POST /api/import/products/json
router.post('/products/json', authenticate, upload.single('file'), async (req, res) => {
  try {
    let products;

    if (req.file) {
      // Uploaded as multipart file
      const text = req.file.buffer.toString('utf8').trim();
      products = JSON.parse(text);
    } else if (req.body && req.body.products) {
      // Sent as JSON body field
      products = typeof req.body.products === 'string'
        ? JSON.parse(req.body.products)
        : req.body.products;
    } else if (req.body && Array.isArray(req.body)) {
      products = req.body;
    } else {
      return res.status(400).json({
        error: 'Se requiere un archivo JSON o un array de productos en el body',
      });
    }

    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: 'El contenido debe ser un array JSON de productos',
      });
    }

    if (products.length === 0) {
      return res.status(400).json({ error: 'El array está vacío' });
    }

    const result = await importProducts(products);
    res.json({
      success: true,
      total: products.length,
      created: result.created,
      updated: result.updated,
      errorCount: result.errors.length,
      errors: result.errors,
      newCategories: result.newCategories,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error procesando JSON: ' + err.message });
  }
});

// POST /api/import/products/csv
router.post('/products/csv', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere un archivo CSV' });
    }

    const text = req.file.buffer.toString('utf8');
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ error: 'El CSV debe tener encabezado y al menos una fila' });
    }

    // Parse CSV header (handle quoted fields)
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9_]/g, '')
    );

    const products = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] !== undefined ? values[i] : '';
      });

      // Normalize field names (handle Spanish aliases)
      return {
        code: obj.code || obj.codigo || obj.cod || '',
        name: obj.name || obj.nombre || obj.producto || '',
        category: obj.category || obj.categoria || obj.cat || 'GENERAL',
        price: obj.price || obj.precio || '0',
        stock: obj.stock !== undefined ? obj.stock : 'true',
        active: obj.active !== undefined ? obj.active : (obj.activo || 'true'),
        featured: obj.featured || obj.destacado || 'false',
        isNew: obj.isnew || obj.is_new || obj.nuevo || 'false',
        image: obj.image || obj.imagen || obj.imageurl || '',
        description: obj.description || obj.descripcion || '',
        shortDescription: obj.shortdescription || obj.short_description || obj.descripconcorta || '',
      };
    }).filter((p) => p.code && p.name); // skip empty rows

    if (products.length === 0) {
      return res.status(400).json({ error: 'No se encontraron productos válidos en el CSV' });
    }

    const result = await importProducts(products);
    res.json({
      success: true,
      total: products.length,
      created: result.created,
      updated: result.updated,
      errorCount: result.errors.length,
      errors: result.errors,
      newCategories: result.newCategories,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error procesando CSV: ' + err.message });
  }
});

module.exports = router;
