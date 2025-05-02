// routes/admin.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Create a new admin user (superadmin only)
router.post('/create', async (req, res) => {
  try {
    // Check if the requester is a superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmins can create admin accounts' });
    }

    const { username, password, role } = req.body;

    // Validate role - allow superadmins to create superadmins
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(400).json({ error: 'Role must be superadmin or admin' });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        role: true
      }
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Create admin error:', err);
    // You can print out err.meta if you need further debugging info
    res.status(500).json({ error: err.message, meta: err.meta });
  }
});

// Get all users (superadmin only)
router.get('/users', async (req, res) => {
  try {
    // Check if the requester is a superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmins can view all users' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
      }
    });

    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a user (superadmin only)
router.delete('/users/:id', async (req, res) => {
  try {
    // Check if the requester is a superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmins can delete users' });
    }

    const { id } = req.params;
    
    // Prevent superadmin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;