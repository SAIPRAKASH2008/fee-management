/**
 * Fee Management System (FMS) — Express Backend Server
 * Architecture: 3-Tier MVC RESTful API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Serve the frontend from the same origin when the API is deployed as one service.
app.use(express.static(path.join(__dirname, '..')));

// Health check & Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Fee Management System (FMS) API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 FMS Backend API Server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
