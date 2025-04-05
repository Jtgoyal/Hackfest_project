const express = require('express');
const http = require('http');
const cors = require('cors');
const { initWebSocketServer } = require('./websocket');
const attendeeFeedbackRoutes = require('./routes/attendeeFeedback');
const liveChatRoutes = require('./routes/liveChat');
const apiDataRoutes = require('./routes/apiData');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wss = initWebSocketServer(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/feedback', attendeeFeedbackRoutes);
app.use('/api/chats', liveChatRoutes);
app.use('/api/data', apiDataRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Event Sentiment Dashboard API',
    description: 'Backend service for Event Sentiment Dashboard',
    endpoints: ['/api/feedback', '/api/chats', '/api/data'],
    websocket: 'ws://host:port/ws',
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start the server
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

server.listen(PORT, () => {
  logger.info(`HTTP server running on port ${PORT}`);
  logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

module.exports = { app, server }; 