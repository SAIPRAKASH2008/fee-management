/**
 * Fee Management System (FMS) — Express Backend Server
 * Architecture: 3-Tier MVC RESTful API
 */

const express = require('express');
const cors = require('cors');
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
  res.send(`
    <html>
      <head><title>FMS Backend API</title></head>
      <body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#f8fafc">
        <h1>🏛️ Fee Management System (FMS) — REST API</h1>
        <p>API Server is running successfully on port ${PORT}.</p>
        <ul>
          <li><strong>Auth:</strong> <code>POST /api/auth/login</code></li>
          <li><strong>Students:</strong> <code>GET /api/students</code>, <code>POST /api/students</code></li>
          <li><strong>Fee Structures:</strong> <code>GET /api/fees/structures</code></li>
          <li><strong>Payments:</strong> <code>GET /api/payments</code>, <code>POST /api/payments</code></li>
          <li><strong>Reports:</strong> <code>GET /api/reports/stats</code>, <code>GET /api/reports/defaulters</code></li>
        </ul>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 FMS Backend API Server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
