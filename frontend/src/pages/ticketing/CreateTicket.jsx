import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import Button from '../../components/common/Button/Button';
import { AlertCircle, ArrowLeft, Upload, X } from 'lucide-react';
import { ticketingApi } from '../../services/ticketingApi';
import '../../styles/ticketingPagesCSS/CreateTicket.css';

// Validation rules — centralised for easy adjustment
const RULES = {
  title:       { min: 5,  max: 100, label: 'Title' },
  description: { min: 10, max: 500, label: 'Description' },
  location:    { min: 3,  max: 100, label: 'Location' },
};

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Per-field validator
  const validateField = (name, value) => {
    const rule = RULES[name];
    if (rule) {
      if (!value.trim()) return `${rule.label} is required`;
      if (value.trim().length < rule.min) return `${rule.label} must be at least ${rule.min} characters`;
      if (value.trim().length > rule.max) return `${rule.label} must be at most ${rule.max} characters`;
    }
    if (name === 'contactEmail') {
      if (!value.trim()) return 'Contact email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Live-validate only after the field has been touched
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
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

  // Full-form validation on submit
  const validateAll = () => {
    const errors = {};
    ['title', 'description', 'location', 'contactEmail'].forEach(name => {
      const msg = validateField(name, formData[name]);
      if (msg) errors[name] = msg;
    });
    return errors;
  };

  // Derived: is the form currently valid? (used to disable submit)
  const isFormValid = () => {
    return ['title', 'description', 'location', 'contactEmail'].every(
      name => !validateField(name, formData[name])
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched and run full validation
    const allTouched = { title: true, description: true, location: true, contactEmail: true };
    setTouched(prev => ({ ...prev, ...allTouched }));
    const errors = validateAll();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        createdBy: currentUser.email // use email as identifier per plan
      };

      await ticketingApi.post('/tickets', payload);
      navigate('/tickets');
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
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
              className={fieldErrors.title && touched.title ? 'input-error' : ''}
              placeholder="e.g. Broken projector in Room 4A"
              maxLength={RULES.title.max}
              required value={formData.title} onChange={handleChange} onBlur={handleBlur}
            />
            {fieldErrors.title && touched.title && <span className="field-error">{fieldErrors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group ${currentUser?.role === 'ADMIN' ? 'half-width' : 'full-width'}`}>
            <label htmlFor="category">Category <span className="req">*</span></label>
            <select id="category" name="category" required value={formData.category} onChange={handleChange}>
              <option value="HARDWARE">Hardware (Specific)</option>
              <option value="SOFTWARE">Software (Specific)</option>
              <option value="FACILITY">Facility (General/Public)</option>
            </select>
            <small className="field-hint">Facility tickets are visible and open to comments by everyone.</small>
          </div>

          {currentUser?.role === 'ADMIN' && (
            <div className="form-group half-width">
              <label htmlFor="priority">Priority <span className="req">*</span></label>
              <select 
                id="priority" name="priority" required 
                value={formData.priority} onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Detailed Description <span className="req">*</span></label>
            <textarea 
              id="description" name="description" rows="5"
              className={fieldErrors.description && touched.description ? 'input-error' : ''}
              placeholder="Describe what is happening, when it started, and who is affected."
              maxLength={RULES.description.max}
              required value={formData.description} onChange={handleChange} onBlur={handleBlur}
            />
            <div className="field-footer">
              {fieldErrors.description && touched.description && <span className="field-error">{fieldErrors.description}</span>}
              <span className="char-counter">{formData.description.length}/{RULES.description.max}</span>
            </div>
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
              className={fieldErrors.location && touched.location ? 'input-error' : ''}
              placeholder="e.g. IT Building, Lab 2"
              maxLength={RULES.location.max}
              required value={formData.location} onChange={handleChange} onBlur={handleBlur}
            />
            {fieldErrors.location && touched.location && <span className="field-error">{fieldErrors.location}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email <span className="req">*</span></label>
            <input 
              id="contactEmail" name="contactEmail" type="email"
              className={fieldErrors.contactEmail && touched.contactEmail ? 'input-error' : ''}
              placeholder="your.email@university.edu"
              required value={formData.contactEmail} onChange={handleChange} onBlur={handleBlur}
            />
            {fieldErrors.contactEmail && touched.contactEmail && <span className="field-error">{fieldErrors.contactEmail}</span>}
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
          <Button variant="primary" type="submit" disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;
