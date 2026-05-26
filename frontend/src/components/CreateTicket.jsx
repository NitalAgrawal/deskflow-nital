import React, { useState } from 'react';
import api from '../api';

const CreateTicket = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'low'
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.subject) newErrors.subject = 'subject is required';
    if (!formData.description) newErrors.description = 'description is required';
    if (!formData.customerEmail) {
      newErrors.customerEmail = 'customerEmail is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'customerEmail must be a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await api.post('/', formData);
      onSuccess(res.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setApiError(err.response.data.error);
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create Ticket</h2>
        {apiError && <div className="error-message" style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
            {errors.subject && <div className="error-message">{errors.subject}</div>}
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label>Customer Email</label>
            <input 
              type="text" 
              value={formData.customerEmail}
              onChange={e => setFormData({...formData, customerEmail: e.target.value})}
            />
            {errors.customerEmail && <div className="error-message">{errors.customerEmail}</div>}
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select 
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ flex: 1 }}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
