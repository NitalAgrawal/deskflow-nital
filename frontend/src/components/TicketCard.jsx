import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

const TicketCard = ({ ticket, onMove, errorId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket._id,
    data: {
      ticket,
      currentStatus: ticket.status
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  const formatAge = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const renderButtons = () => {
    const status = ticket.status;
    if (status === 'open') {
      return (
        <button className="action-btn outline" onClick={() => onMove(ticket, 'in_progress')}>
          Move to In Progress
        </button>
      );
    }
    if (status === 'in_progress') {
      return (
        <>
          <button className="action-btn outline" onClick={() => onMove(ticket, 'open')}>
            Move to Open
          </button>
          <button className="action-btn outline" onClick={() => onMove(ticket, 'resolved')}>
            Move to Resolved
          </button>
        </>
      );
    }
    if (status === 'resolved') {
      return (
        <>
          <button className="action-btn outline" onClick={() => onMove(ticket, 'in_progress')}>
            Move to In Progress
          </button>
          <button className="action-btn outline" onClick={() => onMove(ticket, 'closed')}>
            Move to Closed
          </button>
        </>
      );
    }
    return null; // closed -> no buttons
  };

  return (
    <div 
      ref={setNodeRef} 
      className="ticket-card" 
      style={style}
    >
      <div {...attributes} {...listeners} style={{ cursor: 'grab', paddingBottom: '0.5rem' }}>
        <div className="subject">{ticket.subject}</div>
        <span className={`badge ${ticket.priority}`}>{ticket.priority}</span>
        <div className="meta">
          <span>{formatAge(ticket.ageMinutes)}</span>
          {ticket.slaBreached && (
            <span className="breached-indicator">
              🔴 SLA BREACHED
            </span>
          )}
        </div>
      </div>
      
      {/* Buttons (not draggable area to prevent accidental drags) */}
      <div className="card-actions">
        {renderButtons()}
      </div>

      {errorId === ticket._id && (
        <div className="snap-error">
          Invalid Transition!
        </div>
      )}
    </div>
  );
};

export default TicketCard;
