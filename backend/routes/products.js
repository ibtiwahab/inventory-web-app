// routes/products.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all product routes
router.use(authMiddleware);

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get products with low stock
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        quantity: {
          lte: 10 // Low stock threshold
        }
      },
      select: {
        id: true,
        name: true,
        quantity: true
      }
    });
    res.json(lowStockProducts);
  } catch (err) {
    console.error('Get low stock products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, quantity, price } = req.body;
    
    // Simple validation
    if (!name || !quantity || !price) {
      return res.status(400).json({ error: 'Name, quantity, and price are required' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        quantity: parseInt(quantity),
        price: parseFloat(price)
      }
    });
    
    // Check if the new product is low on stock and emit update
    if (newProduct.quantity <= 5) {
      // Call the global function defined in server.js
      if (global.emitLowStockUpdate) {
        global.emitLowStockUpdate();
      }
    }
    
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;
    
    // Validate required fields based on what's being updated
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!price) {
      return res.status(400).json({ error: 'Price is required' });
    }

    // Prepare the update object
    let updateData = {
      name,
      description,
      price: parseFloat(price),
      updatedAt: new Date()
    };

    // Only include quantity if it's provided (for the Edit form we don't update quantity)
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    // Notify clients about the update
    if (global.emitInventoryUpdate) {
      global.emitInventoryUpdate();
    }
    
    // Check if low stock conditions need updating
    if (global.emitLowStockUpdate) {
      global.emitLowStockUpdate();
    }
    
    res.json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    
    // Always emit low stock update after deleting a product
    if (global.emitLowStockUpdate) {
      global.emitLowStockUpdate();
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;