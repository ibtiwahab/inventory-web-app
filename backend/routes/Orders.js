// Updated Order.js route with WebSocket integration for low stock notifications

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth'); // Import the auth middleware

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// Create new order (now just creates a pending order)
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Now req.user should be defined

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Create order and connect product (status PENDING by default)
    const order = await prisma.order.create({
      data: {
        createdById: userId, // Set the creator
        products: {
          create: {
            productId,
            quantity
          }
        }
      },
      include: { 
        products: {
          include: { product: true }
        },
        createdBy: {
          select: { id: true, username: true }
        }
      }
    });

    res.json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get orders with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || undefined;
    const skip = (page - 1) * limit;
    
    // Filter condition
    const where = status ? { status } : {};
    
    // Get total count for pagination info
    const totalCount = await prisma.order.count({ where });
    
    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc' // Most recent first
      },
      include: {
        products: {
          include: { product: true }
        },
        createdBy: {
          select: { id: true, username: true }
        },
        approvedBy: {
          select: { id: true, username: true }
        }
      }
    });

    res.json({
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (approve/reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approverId = req.user.id; // Now req.user should be defined
    
    // Check if status is valid
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }
    
    // Get the order with products
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { products: true }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If status is changing to APPROVED, update product quantities
    if (status === 'APPROVED') {
      // Update product quantities in a transaction
      await prisma.$transaction(
        order.products.map(item => 
          prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.quantity }
            }
          })
        )
      );
      
      // Check for low stock after order approval and emit socket update
      if (global.emitLowStockUpdate) {
        global.emitLowStockUpdate();
      }
    }
    
    // Update order status and approver
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status,
        approvedById: approverId
      },
      include: {
        products: {
          include: { product: true }
        },
        createdBy: {
          select: { id: true, username: true }
        },
        approvedBy: {
          select: { id: true, username: true }
        }
      }
    });
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;