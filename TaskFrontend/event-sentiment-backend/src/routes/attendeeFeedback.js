const express = require('express');
const router = express.Router();
const attendeeFeedback = require('../models/attendeeFeedback');
const logger = require('../utils/logger');

/**
 * GET /api/feedback
 * Get all attendee feedback with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { page, limit, source, sentiment, startDate, endDate } = req.query;
    
    const filters = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    };
    
    if (source) filters.source = source;
    if (sentiment) filters.sentiment = sentiment;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    const feedback = await attendeeFeedback.getAll(filters);
    res.json(feedback);
  } catch (error) {
    logger.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * GET /api/feedback/:id
 * Get specific feedback item by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const feedback = await attendeeFeedback.getById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (error) {
    logger.error(`Error fetching feedback with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * POST /api/feedback
 * Create new feedback item
 */
router.post('/', async (req, res) => {
  try {
    const { source, sentiment, message, timestamp } = req.body;
    
    // Validate required fields
    if (!source || !sentiment || !message) {
      return res.status(400).json({ error: 'Source, sentiment, and message are required' });
    }
    
    // Validate sentiment value
    if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
      return res.status(400).json({ error: 'Sentiment must be positive, neutral, or negative' });
    }
    
    const newFeedback = await attendeeFeedback.create({
      source,
      sentiment,
      message,
      timestamp: timestamp ? new Date(timestamp) : undefined
    });
    
    res.status(201).json(newFeedback);
  } catch (error) {
    logger.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

/**
 * PUT /api/feedback/:id
 * Update existing feedback item
 */
router.put('/:id', async (req, res) => {
  try {
    const { source, sentiment, message, timestamp } = req.body;
    
    // Validate sentiment value if provided
    if (sentiment && !['positive', 'neutral', 'negative'].includes(sentiment)) {
      return res.status(400).json({ error: 'Sentiment must be positive, neutral, or negative' });
    }
    
    const updatedFeedback = await attendeeFeedback.update(
      req.params.id,
      {
        source,
        sentiment,
        message,
        timestamp: timestamp ? new Date(timestamp) : undefined
      }
    );
    
    if (!updatedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json(updatedFeedback);
  } catch (error) {
    logger.error(`Error updating feedback with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

/**
 * DELETE /api/feedback/:id
 * Delete feedback item
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedFeedback = await attendeeFeedback.delete(req.params.id);
    
    if (!deletedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully', data: deletedFeedback });
  } catch (error) {
    logger.error(`Error deleting feedback with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

/**
 * GET /api/feedback/analytics/distribution
 * Get sentiment distribution by time period
 */
router.get('/analytics/distribution', async (req, res) => {
  try {
    const { timeframe } = req.query;
    const distribution = await attendeeFeedback.getSentimentDistribution(timeframe);
    res.json(distribution);
  } catch (error) {
    logger.error('Error fetching sentiment distribution:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment distribution' });
  }
});

module.exports = router; 