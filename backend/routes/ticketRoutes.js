const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { mapTicketToResponse, validateTransition, getAllowedNextStatuses, PRIORITY_TARGETS } = require('../utils/ticketUtils');

// Helper to format mongoose errors
const formatErrors = (err) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return messages[0]; // Return the first error message as per requirements format
  }
  return 'Server Error';
};

// GET /tickets
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    if (breached === 'true') {
      query.$expr = {
        $gt: [
          {
            $cond: {
              if: { $eq: ["$status", "resolved"] },
              then: { $subtract: ["$resolvedAt", "$createdAt"] },
              else: { $subtract: [new Date(), "$createdAt"] }
            }
          },
          {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "urgent"] }, then: 60 * 60 * 1000 },
                { case: { $eq: ["$priority", "high"] }, then: 240 * 60 * 1000 },
                { case: { $eq: ["$priority", "medium"] }, then: 1440 * 60 * 1000 },
                { case: { $eq: ["$priority", "low"] }, then: 4320 * 60 * 1000 }
              ],
              default: 9999999999999
            }
          }
        ]
      };
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets.map(mapTicketToResponse));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /tickets/stats
router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const stats = {
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      totalBreached: 0
    };

    tickets.forEach(t => {
      const mapped = mapTicketToResponse(t);
      if (stats.byStatus[mapped.status] !== undefined) {
        stats.byStatus[mapped.status]++;
      }
      if (stats.byPriority[mapped.priority] !== undefined) {
        stats.byPriority[mapped.priority]++;
      }
      if (mapped.slaBreached && mapped.status !== 'closed') {
        stats.totalBreached++;
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /tickets
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket({
      subject: req.body.subject,
      description: req.body.description,
      customerEmail: req.body.customerEmail,
      priority: req.body.priority
    });
    
    await ticket.save();
    res.status(201).json(mapTicketToResponse(ticket));
  } catch (err) {
    res.status(400).json({ error: formatErrors(err) });
  }
});

// PATCH /tickets/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'status must be one of: open, in_progress, resolved, closed' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!validateTransition(ticket.status, status)) {
      return res.status(400).json({ 
        error: `Invalid transition: ${ticket.status} -> ${status}. Allowed next statuses: ${getAllowedNextStatuses(ticket.status)}`
      });
    }

    // Handle resolvedAt logic
    if (status === 'resolved' && ticket.status !== 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (ticket.status === 'resolved' && status !== 'resolved') {
      ticket.resolvedAt = null;
    }

    ticket.status = status;
    await ticket.save();
    
    res.json(mapTicketToResponse(ticket));
  } catch (err) {
    res.status(400).json({ error: formatErrors(err) });
  }
});

// DELETE /tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

module.exports = router;
