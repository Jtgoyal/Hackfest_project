const WebSocket = require('ws');
const logger = require('../utils/logger');

// Map to store active WebSocket connections
const clients = new Map();

// Initialize WebSocket server
const initWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });
  
  logger.info('WebSocket server initialized');
  
  // Connection handler
  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    const clientId = Date.now().toString();
    
    logger.info(`WebSocket client connected: ${ip}, ID: ${clientId}`);
    
    // Store client connection
    clients.set(clientId, {
      id: clientId,
      ws,
      subscriptions: new Set(['alerts']) // Default subscription
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      clientId,
      message: 'Connected to Event Sentiment WebSocket server'
    }));
    
    // Message handler
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleMessage(clientId, data);
      } catch (error) {
        logger.error(`Error parsing WebSocket message: ${error.message}`);
        sendToClient(clientId, {
          type: 'error',
          message: 'Invalid message format'
        });
      }
    });
    
    // Close handler
    ws.on('close', () => {
      logger.info(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
    
    // Error handler
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });
  });
  
  return wss;
};

// Handle incoming WebSocket messages
const handleMessage = (clientId, data) => {
  const client = clients.get(clientId);
  
  if (!client) {
    logger.warn(`Received message for unknown client: ${clientId}`);
    return;
  }
  
  switch (data.type) {
    case 'ping':
      sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
      break;
      
    case 'subscribe':
      if (data.channels && Array.isArray(data.channels)) {
        data.channels.forEach(channel => client.subscriptions.add(channel));
        sendToClient(clientId, { 
          type: 'subscription', 
          status: 'success',
          channels: Array.from(client.subscriptions)
        });
      }
      break;
      
    case 'unsubscribe':
      if (data.channels && Array.isArray(data.channels)) {
        data.channels.forEach(channel => client.subscriptions.delete(channel));
        sendToClient(clientId, { 
          type: 'subscription', 
          status: 'success',
          channels: Array.from(client.subscriptions)
        });
      }
      break;
      
    default:
      logger.warn(`Unknown message type: ${data.type}`);
      sendToClient(clientId, {
        type: 'error',
        message: 'Unknown message type'
      });
  }
};

// Send message to specific client
const sendToClient = (clientId, data) => {
  const client = clients.get(clientId);
  
  if (!client) {
    logger.warn(`Attempted to send message to unknown client: ${clientId}`);
    return false;
  }
  
  try {
    client.ws.send(JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error(`Error sending message to client ${clientId}:`, error);
    return false;
  }
};

// Broadcast message to all clients with matching subscription
const broadcast = (channel, data) => {
  let recipients = 0;
  
  clients.forEach((client, clientId) => {
    if (client.subscriptions.has(channel)) {
      if (sendToClient(clientId, {
        type: 'broadcast',
        channel,
        data,
        timestamp: Date.now()
      })) {
        recipients++;
      }
    }
  });
  
  logger.debug(`Broadcast to channel ${channel} sent to ${recipients} clients`);
  return recipients;
};

// Broadcast alert to all subscribed clients
const broadcastAlert = (alert) => {
  return broadcast('alerts', {
    type: 'alert',
    ...alert
  });
};

// Broadcast feedback to all subscribed clients
const broadcastFeedback = (feedback) => {
  return broadcast('feedback', {
    type: 'feedback',
    ...feedback
  });
};

// Broadcast chat message to all subscribed clients
const broadcastChat = (chat) => {
  return broadcast('chats', {
    type: 'chat',
    ...chat
  });
};

// Get count of connected clients
const getClientCount = () => {
  return clients.size;
};

module.exports = {
  initWebSocketServer,
  broadcast,
  broadcastAlert,
  broadcastFeedback,
  broadcastChat,
  getClientCount
}; 