import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import './CreateTicket.css';

function CreateTicket() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'HARDWARE',
    priority: 'LOW',
    location: '',
    contactEmail: '',
    contactPhone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        createdBy: currentUser.id
      };

      const response = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create ticket');
      }

      // Automatically redirect to the dashboard after creating
      navigate('/tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-ticket-container">
      <div className="create-header">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </Button>
        <div className="title-area">
          <h1>Raise a New Ticket</h1>
          <p>Fill out the details below to report an issue. Your ticket will be logged under <strong>{currentUser.name}</strong>.</p>
        </div>
      </div>

      <form className="create-ticket-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="title">Issue Title <span className="req">*</span></label>
            <input 
              id="title" name="title" type="text"
              placeholder="e.g. Broken projector in Room 4A"
              required value={formData.title} onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="category">Category <span className="req">*</span></label>
            <select id="category" name="category" required value={formData.category} onChange={handleChange}>
              <option value="HARDWARE">Hardware (Specific)</option>
              <option value="SOFTWARE">Software (Specific)</option>
              <option value="FACILITY">Facility (General/Public)</option>
            </select>
            <small className="field-hint">Facility tickets are visible and open to comments by everyone.</small>
          </div>

          <div className="form-group half-width">
            <label htmlFor="priority">Priority <span className="req">*</span></label>
            <select id="priority" name="priority" required value={formData.priority} onChange={handleChange}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Detailed Description <span className="req">*</span></label>
            <textarea 
              id="description" name="description" rows="5"
              placeholder="Describe what is happening, when it started, and who is affected."
              required value={formData.description} onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row section-divider">
          <h3>Contact Details</h3>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location / Room <span className="req">*</span></label>
            <input 
              id="location" name="location" type="text"
              placeholder="e.g. IT Building, Lab 2"
              required value={formData.location} onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email <span className="req">*</span></label>
            <input 
              id="contactEmail" name="contactEmail" type="email"
              placeholder="your.email@university.edu"
              required value={formData.contactEmail} onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone</label>
            <input 
              id="contactPhone" name="contactPhone" type="tel"
              placeholder="071 234 5678"
              value={formData.contactPhone} onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-actions">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;
