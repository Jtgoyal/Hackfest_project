const express = require('express');
const router = express.Router();
const apiData = require('../models/apiData');
const logger = require('../utils/logger');

/**
 * GET /api/data
 * Get all API data with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { page, limit, platform, processedFlag, startDate, endDate } = req.query;
    
    const filters = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    };
    
    if (platform) filters.platform = platform;
    if (processedFlag !== undefined) filters.processedFlag = processedFlag === 'true';
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    const data = await apiData.getAll(filters);
    res.json(data);
  } catch (error) {
    logger.error('Error fetching API data:', error);
    res.status(500).json({ error: 'Failed to fetch API data' });
  }
});

/**
 * GET /api/data/:id
 * Get specific API data record by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const data = await apiData.getById(req.params.id);
    
    if (!data) {
      return res.status(404).json({ error: 'API data not found' });
    }
    
    res.json(data);
  } catch (error) {
    logger.error(`Error fetching API data with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch API data' });
  }
});

/**
 * GET /api/data/unprocessed
 * Get unprocessed API data
 */
router.get('/unprocessed/list', async (req, res) => {
  try {
    const { limit } = req.query;
    const data = await apiData.getUnprocessed(limit ? parseInt(limit, 10) : 100);
    res.json(data);
  } catch (error) {
    logger.error('Error fetching unprocessed API data:', error);
    res.status(500).json({ error: 'Failed to fetch unprocessed API data' });
  }
});

/**
 * POST /api/data
 * Create new API data record
 */
router.post('/', async (req, res) => {
  try {
    const { platform, raw_data, processed_flag, retrieved_at } = req.body;
    
    // Validate required fields
    if (!platform || !raw_data) {
      return res.status(400).json({ error: 'Platform and raw data are required' });
    }
    
    // Validate raw_data is an object
    if (typeof raw_data !== 'object') {
      return res.status(400).json({ error: 'Raw data must be a JSON object' });
    }
    
    const newData = await apiData.create({
      platform,
      raw_data,
      processed_flag: processed_flag !== undefined ? processed_flag : false,
      retrieved_at: retrieved_at ? new Date(retrieved_at) : undefined
    });
    
    res.status(201).json(newData);
  } catch (error) {
    logger.error('Error creating API data record:', error);
    res.status(500).json({ error: 'Failed to create API data record' });
  }
});

/**
 * POST /api/data/batch
 * Create multiple API data records
 */
router.post('/batch', async (req, res) => {
  try {
    const { records } = req.body;
    
    // Validate records is an array
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records must be a non-empty array' });
    }
    
    // Validate each record
    for (const record of records) {
      if (!record.platform || !record.raw_data) {
        return res.status(400).json({ error: 'Each record must have platform and raw_data' });
      }
      
      if (typeof record.raw_data !== 'object') {
        return res.status(400).json({ error: 'Raw data must be a JSON object' });
      }
    }
    
    const newRecords = await apiData.batchCreate(records);
    res.status(201).json(newRecords);
  } catch (error) {
    logger.error('Error batch creating API data records:', error);
    res.status(500).json({ error: 'Failed to batch create API data records' });
  }
});

/**
 * PUT /api/data/:id
 * Update API data record
 */
router.put('/:id', async (req, res) => {
  try {
    const { raw_data, processed_flag } = req.body;
    
    // Validate raw_data is an object if provided
    if (raw_data !== undefined && typeof raw_data !== 'object') {
      return res.status(400).json({ error: 'Raw data must be a JSON object' });
    }
    
    const updatedData = await apiData.update(
      req.params.id,
      {
        raw_data,
        processed_flag
      }
    );
    
    if (!updatedData) {
      return res.status(404).json({ error: 'API data not found' });
    }
    
    res.json(updatedData);
  } catch (error) {
    logger.error(`Error updating API data with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update API data' });
  }
});

/**
 * PUT /api/data/:id/processed
 * Mark API data as processed
 */
router.put('/:id/processed', async (req, res) => {
  try {
    const updatedData = await apiData.markAsProcessed(req.params.id);
    
    if (!updatedData) {
      return res.status(404).json({ error: 'API data not found' });
    }
    
    res.json(updatedData);
  } catch (error) {
    logger.error(`Error marking API data with ID ${req.params.id} as processed:`, error);
    res.status(500).json({ error: 'Failed to mark API data as processed' });
  }
});

/**
 * DELETE /api/data/:id
 * Delete API data record
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedData = await apiData.delete(req.params.id);
    
    if (!deletedData) {
      return res.status(404).json({ error: 'API data not found' });
    }
    
    res.json({ message: 'API data deleted successfully', data: deletedData });
  } catch (error) {
    logger.error(`Error deleting API data with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete API data' });
  }
});

/**
 * GET /api/data/analytics/platform-stats
 * Get statistics by platform
 */
router.get('/analytics/platform-stats', async (req, res) => {
  try {
    const stats = await apiData.getCountByPlatform();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching platform statistics:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
});

module.exports = router; 