import { useState } from 'react';
import { createResource } from '../services/resourceService';
import './AdminResourceForm.css';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const defaultWindow = { start: '08:00', end: '17:00' };

export default function AdminResourceForm() {
  const [form, setForm] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    availabilityWindows: [{ ...defaultWindow }],
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWindowChange = (index, field, value) => {
    const updated = [...form.availabilityWindows];
    updated[index][field] = value;
    setForm({ ...form, availabilityWindows: updated });
  };

  const addWindow = () => {
    setForm({ ...form, availabilityWindows: [...form.availabilityWindows, { ...defaultWindow }] });
  };

  const removeWindow = (index) => {
    const updated = form.availabilityWindows.filter((_, i) => i !== index);
    setForm({ ...form, availabilityWindows: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity, 10),
        availabilityWindows: form.availabilityWindows.map((w) => `${w.start}-${w.end}`),
      };
      await createResource(payload);
      showToast('✅ Resource registered successfully!');
      setForm({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        availabilityWindows: [{ ...defaultWindow }],
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save resource. Please check the API connection and try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <div className="admin-header__icon">🏛️</div>
        <div>
          <h1 className="admin-header__title">Register New Resource</h1>
          <p className="admin-header__sub">Add facilities and assets to the UniSphere catalogue</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>

        {/* Resource Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">Resource Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            placeholder="e.g. Lab A-203"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          {/* Resource Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="type">Resource Type</label>
            <select id="type" name="type" className="form-input form-select" value={form.type} onChange={handleChange}>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label className="form-label" htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              className="form-input"
              placeholder="e.g. 40"
              value={form.capacity}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label" htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            className="form-input"
            placeholder="e.g. Block A, Floor 2, Room 203"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        {/* Availability Windows */}
        <div className="form-group">
          <label className="form-label">Availability Windows</label>
          <div className="windows-list">
            {form.availabilityWindows.map((w, i) => (
              <div key={i} className="window-row">
                <span className="window-label">From</span>
                <input
                  type="time"
                  className="form-input time-input"
                  value={w.start}
                  onChange={(e) => handleWindowChange(i, 'start', e.target.value)}
                />
                <span className="window-label">To</span>
                <input
                  type="time"
                  className="form-input time-input"
                  value={w.end}
                  onChange={(e) => handleWindowChange(i, 'end', e.target.value)}
                />
                {form.availabilityWindows.length > 1 && (
                  <button type="button" className="btn-remove-window" onClick={() => removeWindow(i)}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn-add-window" onClick={addWindow}>
            + Add Time Window
          </button>
        </div>

        {/* Status Toggle */}
        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="status-toggle">
            <label className={`status-option ${form.status === 'ACTIVE' ? 'status-option--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={form.status === 'ACTIVE'}
                onChange={handleChange}
              />
              <span className="status-dot status-dot--active" />
              Active
            </label>
            <label className={`status-option ${form.status === 'OUT_OF_SERVICE' ? 'status-option--oos' : ''}`}>
              <input
                type="radio"
                name="status"
                value="OUT_OF_SERVICE"
                checked={form.status === 'OUT_OF_SERVICE'}
                onChange={handleChange}
              />
              <span className="status-dot status-dot--oos" />
              Out of Service
            </label>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <span className="spinner" /> : '🚀 Register Resource'}
        </button>
      </form>
    </div>
  );
}
