import React, { useEffect, useState } from 'react';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { getTickets, getStats, updateTicketStatus } from './api';
import Board from './components/Board';
import CreateTicket from './components/CreateTicket';

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    totalBreached: 0
  });
  
  const [filters, setFilters] = useState({ priority: 'all', breached: false });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorId, setErrorId] = useState(null);

  const fetchTickets = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        getTickets(filters),
        getStats()
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [filters]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id;
    const newStatus = over.id;
    const ticket = tickets.find(t => t._id === ticketId);
    
    if (ticket.status === newStatus) return;

    // Validate transition
    const order = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
    const currentIdx = order[ticket.status];
    const newIdx = order[newStatus];
    
    if (newIdx !== currentIdx + 1 && newIdx !== currentIdx - 1) {
      // Invalid transition -> snap back and show error on card
      setErrorId(ticketId);
      setTimeout(() => setErrorId(null), 2000);
      return;
    }

    await handleMove(ticket, newStatus);
  };

  const handleMove = async (ticket, newStatus) => {
    // Optimistic update
    const previousTickets = [...tickets];
    setTickets(tickets.map(t => 
      t._id === ticket._id ? { ...t, status: newStatus } : t
    ));

    try {
      await updateTicketStatus(ticket._id, newStatus);
      fetchTickets(); // Refresh to get precise ageMinutes and slaBreached
    } catch (err) {
      setTickets(previousTickets);
      setErrorId(ticket._id);
      setTimeout(() => setErrorId(null), 2000);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>DeskFlow</h1>
        <button onClick={() => setShowCreate(true)}>+ New Ticket</button>
      </header>

      <div className="stats-strip">
        <div className="stat-item">
          <div className="label">Open</div>
          <div className="value">{stats.byStatus.open}</div>
        </div>
        <div className="stat-item">
          <div className="label">In Progress</div>
          <div className="value">{stats.byStatus.in_progress}</div>
        </div>
        <div className="stat-item">
          <div className="label">Resolved</div>
          <div className="value">{stats.byStatus.resolved}</div>
        </div>
        <div className="stat-item">
          <div className="label">Closed</div>
          <div className="value">{stats.byStatus.closed}</div>
        </div>
        <div className="stat-item breached">
          <div className="label">Breached</div>
          <div className="value">{stats.totalBreached}</div>
        </div>
      </div>

      <div className="filters">
        <div>
          <label style={{ marginRight: '0.5rem' }}>Priority:</label>
          <select 
            value={filters.priority} 
            onChange={e => setFilters({...filters, priority: e.target.value})}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filters.breached}
              onChange={e => setFilters({...filters, breached: e.target.checked})}
              style={{ width: 'auto' }}
            />
            Show only SLA breached
          </label>
        </div>
      </div>

      {loading ? (
        <div>Loading tickets...</div>
      ) : (
        <DndContext 
          collisionDetection={pointerWithin} 
          onDragEnd={handleDragEnd}
        >
          <Board tickets={tickets} onMove={handleMove} errorId={errorId} />
        </DndContext>
      )}

      {showCreate && (
        <CreateTicket 
          onClose={() => setShowCreate(false)} 
          onSuccess={() => {
            setShowCreate(false);
            fetchTickets();
          }} 
        />
      )}
    </div>
  );
}

export default App;
