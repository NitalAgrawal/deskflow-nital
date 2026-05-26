import axios from 'axios';

// Replace with Render URL when deployed
const API_URL = import.meta.env.VITE_API_URL || 'https://deskflow-nital.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/tickets`,
});

export const getTickets = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.breached) params.append('breached', 'true');
  
  return api.get(`/?${params.toString()}`);
};

export const getStats = () => api.get('/stats');

export const createTicket = (data) => api.post('/', data);

export const updateTicketStatus = (id, status) => api.patch(`/${id}`, { status });

export const deleteTicket = (id) => api.delete(`/${id}`);

export default api;
