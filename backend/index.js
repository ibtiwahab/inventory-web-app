const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Importing routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

// Using routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // adjust for production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// Attach io to app for use in routes
app.set('io', io);

// Function to fetch low stock items and emit to all clients or a specific socket
async function emitLowStockUpdate(targetSocket = null) {
  try {
    // Get products with quantity below threshold (e.g., 10)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        quantity: {
          lte: 5 // Low stock threshold
        }
      },
      select: {
        id: true,
        name: true,
        quantity: true
      }
    });
    
    // Emit to specific socket or broadcast to all
    if (targetSocket) {
      targetSocket.emit('lowStockUpdate', lowStockProducts);
    } else {
      io.emit('lowStockUpdate', lowStockProducts);
    }
  } catch (err) {
    console.error('Error fetching low stock products:', err);
  }
}

// Make the emitLowStockUpdate function global for use in route handlers
global.emitLowStockUpdate = emitLowStockUpdate;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
