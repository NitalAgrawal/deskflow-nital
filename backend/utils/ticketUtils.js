const PRIORITY_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

const STATUS_ORDER = {
  open: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3
};

const mapTicketToResponse = (ticket) => {
  const doc = ticket.toObject();
  const now = new Date();
  
  const endT = doc.status === 'resolved' && doc.resolvedAt ? doc.resolvedAt : now;
  const diffMs = endT - doc.createdAt;
  const ageMinutes = Math.floor(diffMs / (1000 * 60));
  
  doc.ageMinutes = ageMinutes;
  
  const target = PRIORITY_TARGETS[doc.priority];
  doc.slaBreached = doc.ageMinutes > target;
  
  return doc;
};

const validateTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true;
  
  const currentIdx = STATUS_ORDER[currentStatus];
  const newIdx = STATUS_ORDER[newStatus];
  
  if (newIdx === currentIdx + 1) return true; // Forward 1 step
  if (newIdx === currentIdx - 1) return true; // Backward 1 step allowed
  
  return false;
};

const getAllowedNextStatuses = (status) => {
  const currentIdx = STATUS_ORDER[status];
  const allowed = [];
  for (const [key, idx] of Object.entries(STATUS_ORDER)) {
    if (idx === currentIdx + 1 || (idx === currentIdx - 1)) {
      allowed.push(key);
    }
  }
  return allowed.join(', ');
};

module.exports = {
  mapTicketToResponse,
  validateTransition,
  getAllowedNextStatuses,
  PRIORITY_TARGETS
};
