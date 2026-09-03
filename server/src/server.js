require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedDefaultSchemes } = require('./controllers/loanSchemeController');
const apiRoutes = require('./routes/api');

/**
 * Backend Server Setup & Architectural Blueprint:
 * 
 * 
 * 
 * Architecture Flow:
 * Client Request ──► CORS & JSON Body Parser ──► Route Dispatcher (/api/v1)
 *                     ├──► Live Gold Rate Engine (Cache + API fallback)
 *                     ├──► Lead Submission & 7-Day Deduplication Guard
 *                     └──► MongoDB Data Layer (LoanSchemes & Leads)
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Yellow Metal API Gateway',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount V1 API Routes
app.use('/api/v1', apiRoutes);

// Serve frontend production build if available
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Route Handler for unmatched API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error occurred. Please try again later.',
  });
});

// Server Initialization
const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultSchemes();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Yellow Metal Backend Server Online`);
      console.log(` Port: ${PORT}`);
      console.log(` Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`  7-Day Deduplication & 75% LTV Rules Active`);
      console.log(`====================================================`);
    });

    return server;
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
