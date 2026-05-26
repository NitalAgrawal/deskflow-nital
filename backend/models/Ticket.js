const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'subject is required']
  },
  description: {
    type: String,
    required: [true, 'description is required']
  },
  customerEmail: {
    type: String,
    required: [true, 'customerEmail is required'],
    match: [/^\S+@\S+\.\S+$/, 'customerEmail must be a valid email']
  },
  priority: {
    type: String,
    required: [true, 'priority is required'],
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'priority must be one of: low, medium, high, urgent'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed'],
      message: 'status must be one of: open, in_progress, resolved, closed'
    },
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
