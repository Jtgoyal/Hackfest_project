const express = require('express');
const router = express.Router();
const liveChat = require('../models/liveChat');
const logger = require('../utils/logger');

/**
 * GET /api/chats
 * Get all live chats with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { page, limit, userId, sessionId, minSentiment, maxSentiment, startDate, endDate } = req.query;
    
    const filters = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    };
    
    if (userId) filters.userId = userId;
    if (sessionId) filters.sessionId = sessionId;
    if (minSentiment !== undefined) filters.minSentiment = parseFloat(minSentiment);
    if (maxSentiment !== undefined) filters.maxSentiment = parseFloat(maxSentiment);
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    const chats = await liveChat.getAll(filters);
    res.json(chats);
  } catch (error) {
    logger.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

/**
 * GET /api/chats/:id
 * Get specific chat by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const chat = await liveChat.getById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    logger.error(`Error fetching chat with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

/**
 * GET /api/chats/session/:sessionId
 * Get all chats from a specific session
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const chats = await liveChat.getBySessionId(req.params.sessionId);
    res.json(chats);
  } catch (error) {
    logger.error(`Error fetching chats for session ID ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to fetch session chats' });
  }
});

/**
 * POST /api/chats
 * Create new chat message
 */
router.post('/', async (req, res) => {
  try {
    const { user_id, session_id, message, sentiment_score, timestamp } = req.body;
    
    // Validate required fields
    if (!user_id || !session_id || !message) {
      return res.status(400).json({ error: 'User ID, session ID, and message are required' });
    }
    
    // Validate sentiment score if provided
    if (sentiment_score !== undefined) {
      const score = parseFloat(sentiment_score);
      if (isNaN(score) || score < -1 || score > 1) {
        return res.status(400).json({ error: 'Sentiment score must be a number between -1 and 1' });
      }
    }
    
    const newChat = await liveChat.create({
      user_id,
      session_id,
      message,
      sentiment_score: sentiment_score !== undefined ? parseFloat(sentiment_score) : 0,
      timestamp: timestamp ? new Date(timestamp) : undefined
    });
    
    res.status(201).json(newChat);
  } catch (error) {
    logger.error('Error creating chat message:', error);
    res.status(500).json({ error: 'Failed to create chat message' });
  }
});

/**
 * PUT /api/chats/:id
 * Update existing chat message
 */
router.put('/:id', async (req, res) => {
  try {
    const { message, sentiment_score } = req.body;
    
    // Validate sentiment score if provided
    if (sentiment_score !== undefined) {
      const score = parseFloat(sentiment_score);
      if (isNaN(score) || score < -1 || score > 1) {
        return res.status(400).json({ error: 'Sentiment score must be a number between -1 and 1' });
      }
    }
    
    const updatedChat = await liveChat.update(
      req.params.id,
      {
        message,
        sentiment_score: sentiment_score !== undefined ? parseFloat(sentiment_score) : undefined
      }
    );
    
    if (!updatedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(updatedChat);
  } catch (error) {
    logger.error(`Error updating chat with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

/**
 * DELETE /api/chats/:id
 * Delete chat message
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedChat = await liveChat.delete(req.params.id);
    
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully', data: deletedChat });
  } catch (error) {
    logger.error(`Error deleting chat with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

/**
 * GET /api/chats/analytics/by-session
 * Get sentiment analysis grouped by session
 */
router.get('/analytics/by-session', async (req, res) => {
  try {
    const sessionData = await liveChat.getSentimentBySession();
    res.json(sessionData);
  } catch (error) {
    logger.error('Error fetching sentiment by session:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analysis by session' });
  }
});

/**
 * GET /api/chats/analytics/trend
 * Get sentiment trend over time
 */
router.get('/analytics/trend', async (req, res) => {
  try {
    const { interval, limit } = req.query;
    const trend = await liveChat.getSentimentTrend(
      interval || 'hour',
      limit ? parseInt(limit, 10) : 24
    );
    res.json(trend);
  } catch (error) {
    logger.error('Error fetching sentiment trend:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment trend' });
  }
});

module.exports = router; 