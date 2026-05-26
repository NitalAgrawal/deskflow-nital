import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TicketCard from './TicketCard';

const Column = ({ title, status, tickets, onMove, errorId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status }
  });

  return (
    <div className="column" ref={setNodeRef} style={{ borderColor: isOver ? 'var(--accent)' : 'var(--border)' }}>
      <div className="column-header">
        {title}
        <span>{tickets.length}</span>
      </div>
      <div className="ticket-list">
        {tickets.map(t => (
          <TicketCard key={t._id} ticket={t} onMove={onMove} errorId={errorId} />
        ))}
      </div>
    </div>
  );
};

const Board = ({ tickets, onMove, errorId }) => {
  const columns = [
    { title: 'Open', status: 'open' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Resolved', status: 'resolved' },
    { title: 'Closed', status: 'closed' }
  ];

  return (
    <div className="board">
      {columns.map(col => (
        <Column 
          key={col.status}
          title={col.title}
          status={col.status}
          tickets={tickets.filter(t => t.status === col.status)}
          onMove={onMove}
          errorId={errorId}
        />
      ))}
    </div>
  );
};

export default Board;
