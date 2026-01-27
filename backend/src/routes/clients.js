/**
 * Client Routes
 *
 * API endpoints for managing client companies.
 * All routes require InterWorks role except GET single client.
 */

const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Migration = require('../models/Migration');
const { requireAuth, requireInterWorks } = require('../middleware/auth');

/**
 * POST /api/clients
 * Create a new client company
 * Access: InterWorks only
 */
router.post('/', requireAuth, requireInterWorks, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Check if client with email already exists
    const existingClient = await Client.findOne({ email: email.toLowerCase() });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'A client with this email already exists',
      });
    }

    const client = await Client.create({
      name,
      email,
    });

    res.status(201).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating client',
    });
  }
});

/**
 * GET /api/clients
 * Get all clients
 * Access: InterWorks only
 */
router.get('/', requireAuth, requireInterWorks, async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 });

    res.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clients',
    });
  }
});

/**
 * GET /api/clients/:id
 * Get a single client by ID
 * Access: Authenticated users
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching client',
    });
  }
});

/**
 * PUT /api/clients/:id
 * Update a client
 * Access: InterWorks only
 */
router.put('/:id', requireAuth, requireInterWorks, async (req, res) => {
  try {
    const { name, email } = req.body;

    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Check if email is being changed to one that already exists
    if (email && email.toLowerCase() !== client.email) {
      const existingClient = await Client.findOne({ email: email.toLowerCase() });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'A client with this email already exists',
        });
      }
    }

    // Update fields
    if (name) client.name = name;
    if (email) client.email = email;

    await client.save();

    res.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating client',
    });
  }
});

/**
 * DELETE /api/clients/:id
 * Delete a client (only if no migrations exist)
 * Access: InterWorks only
 */
router.delete('/:id', requireAuth, requireInterWorks, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Check if any migrations exist for this client
    const migrationCount = await Migration.countDocuments({ clientId: req.params.id });

    if (migrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete client. ${migrationCount} migration(s) exist for this client. Please delete migrations first.`,
      });
    }

    await client.deleteOne();

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting client',
    });
  }
});

module.exports = router;
