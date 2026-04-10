import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import { AlertCircle, ArrowLeft, Upload, X } from 'lucide-react';
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
    contactPhone: '',
    attachments: [] // Stores base64 strings
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.attachments.length + files.length > 3) {
      setError('You can only attach up to 3 images.');
      return;
    }
    
    setError(null);
    const base64Files = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed as evidence.');
        return;
      }
      
      const reader = new FileReader();
      const promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      base64Files.push(await promise);
    }
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...base64Files].slice(0, 3)
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
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

        {/* Attachment Evidence section */}
        <div className="form-row section-divider">
          <h3>Evidence Attachments</h3>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Images (Max 3)</label>
            <div className="attachment-uploader">
               <label htmlFor="file-upload" className="upload-btn">
                 <Upload size={18} /> Choose Images
               </label>
               <input 
                 id="file-upload" type="file" multiple accept="image/*"
                 style={{ display: 'none' }} onChange={handleFileChange}
                 disabled={formData.attachments.length >= 3}
               />
               <span className="upload-hint">({formData.attachments.length}/3 attached)</span>
            </div>
            
            {formData.attachments.length > 0 && (
              <div className="attachment-preview-grid">
                {formData.attachments.map((base64, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={base64} alt={`Attachment ${idx+1}`} />
                    <button type="button" className="remove-btn" onClick={() => removeAttachment(idx)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
