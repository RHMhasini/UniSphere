import { useEffect, useState } from 'react';
import {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
} from '../services/resourceService';
import './AdminResourceForm.css';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUS_OPTIONS = ['ACTIVE', 'OUT_OF_SERVICE'];
const defaultWindow = { start: '08:00', end: '17:00' };

const emptyForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  status: 'ACTIVE',
  availabilityWindows: [{ ...defaultWindow }],
};

export default function AdminResourceForm() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadResources = async () => {
    setListLoading(true);
    try {
      const response = await getAllResources();
      setResources(response.data || []);
    } catch (err) {
      showToast('Unable to load resources. Please try again.', 'error');
    } finally {
      setListLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setSelectedResource(null);
  };

  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  };

  const handleWindowChange = (index, field, value) => {
    const updated = [...form.availabilityWindows];
    updated[index][field] = value;
    setForm({ ...form, availabilityWindows: updated });
    setErrors({ ...errors, [`availabilityWindows.${index}.${field}`]: undefined });
  };

  const addWindow = () => {
    setForm({ ...form, availabilityWindows: [...form.availabilityWindows, { ...defaultWindow }] });
  };

  const removeWindow = (index) => {
    const updated = form.availabilityWindows.filter((_, i) => i !== index);
    setForm({ ...form, availabilityWindows: updated });
  };

  const validateForm = () => {
    const validation = {};

    if (!form.name.trim()) validation.name = 'Resource Name is required.';
    if (!form.location.trim()) validation.location = 'Location is required.';
    if (!form.type) validation.type = 'Category is required.';
    if (!form.status) validation.status = 'Status is required.';

    const capacityValue = Number(form.capacity);
    if (!form.capacity.toString().trim()) {
      validation.capacity = 'Capacity is required.';
    } else if (Number.isNaN(capacityValue) || capacityValue <= 0) {
      validation.capacity = 'Capacity must be a positive number.';
    }

    if (!form.availabilityWindows.length) {
      validation.availabilityWindows = 'At least one time window is required.';
    } else {
      form.availabilityWindows.forEach((window, index) => {
        if (!window.start) validation[`availabilityWindows.${index}.start`] = 'Start time is required.';
        if (!window.end) validation[`availabilityWindows.${index}.end`] = 'End time is required.';
        if (window.start && window.end && window.start >= window.end) {
          validation[`availabilityWindows.${index}.range`] = 'Start time must be before end time.';
        }
      });
    }

    return validation;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity, 10),
        availabilityWindows: form.availabilityWindows.map((w) => `${w.start}-${w.end}`),
      };

      if (selectedResource) {
        await updateResource(selectedResource.id, payload);
        showToast('Resource updated successfully!');
      } else {
        await createResource(payload);
        showToast('Resource added successfully!');
      }

      closeForm();
      await loadResources();
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

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setForm({
      name: resource.name || '',
      type: resource.type || 'LECTURE_HALL',
      capacity: resource.capacity?.toString() || '',
      location: resource.location || '',
      status: resource.status || 'ACTIVE',
      availabilityWindows:
        resource.availabilityWindows?.map((window) => {
          const [start = defaultWindow.start, end = defaultWindow.end] = window.split('-');
          return { start, end };
        }) || [{ ...defaultWindow }],
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource permanently?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteResource(id);
      showToast('Resource deleted successfully!');
      await loadResources();
    } catch (err) {
      showToast('Unable to delete resource. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getWindowDisplay = (resource) => {
    return resource.availabilityWindows?.join(', ') || '—';
  };

  return (
    <div className="admin-page">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <div className="admin-header__icon">🛠️</div>
        <div>
          <h1 className="admin-header__title">Resource Management</h1>
          <p className="admin-header__sub">View, add, edit, and remove lecture halls, labs, meeting rooms, and equipment.</p>
        </div>
      </div>

      <div className="admin-actions">
        <button type="button" className="btn-add-resource" onClick={openForm}>
          + Add Resource
        </button>
      </div>

      <div className="admin-content">
        <section className="admin-table-card">
          <div className="table-header">
            <h2>All Resources</h2>
            <span>{resources.length} total</span>
          </div>

          {listLoading ? (
            <div className="table-empty">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="table-empty">No resources found. Click &ldquo;Add Resource&rdquo; to begin.</div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Time Window</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td>{resource.name}</td>
                      <td>{resource.capacity}</td>
                      <td>{resource.location}</td>
                      <td>{getWindowDisplay(resource)}</td>
                      <td>
                        <span className={`status-chip status-chip--${resource.status === 'ACTIVE' ? 'active' : 'oos'}`}>
                          {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button type="button" className="btn-table btn-table--edit" onClick={() => handleEdit(resource)}>
                          Edit
                        </button>
                        <button type="button" className="btn-table btn-table--delete" onClick={() => handleDelete(resource.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isFormOpen && (
          <section className="admin-form-card">
            <div className="form-card-header">
              <div>
                <h2>{selectedResource ? 'Edit Resource' : 'Add Resource'}</h2>
                <p>{selectedResource ? 'Update the resource and save changes.' : 'Create a new resource and assign it to the correct category.'}</p>
              </div>
              <button type="button" className="btn-form-cancel" onClick={closeForm}>
                Cancel
              </button>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Resource Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Lab A-203"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Category</label>
                  <select
                    id="type"
                    name="type"
                    className={`form-input form-select ${errors.type ? 'input-error' : ''}`}
                    value={form.type}
                    onChange={handleChange}
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="field-error">{errors.type}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="capacity">Capacity</label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    className={`form-input ${errors.capacity ? 'input-error' : ''}`}
                    placeholder="e.g. 40"
                    value={form.capacity}
                    onChange={handleChange}
                  />
                  {errors.capacity && <p className="field-error">{errors.capacity}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className={`form-input ${errors.location ? 'input-error' : ''}`}
                  placeholder="e.g. Block A, Floor 2, Room 203"
                  value={form.location}
                  onChange={handleChange}
                />
                {errors.location && <p className="field-error">{errors.location}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Availability Windows</label>
                <div className="windows-list">
                  {form.availabilityWindows.map((w, i) => (
                    <div key={i} className="window-row">
                      <span className="window-label">From</span>
                      <input
                        type="time"
                        className={`form-input time-input ${errors[`availabilityWindows.${i}.start`] ? 'input-error' : ''}`}
                        value={w.start}
                        onChange={(e) => handleWindowChange(i, 'start', e.target.value)}
                      />
                      <span className="window-label">To</span>
                      <input
                        type="time"
                        className={`form-input time-input ${errors[`availabilityWindows.${i}.end`] ? 'input-error' : ''}`}
                        value={w.end}
                        onChange={(e) => handleWindowChange(i, 'end', e.target.value)}
                      />
                      {form.availabilityWindows.length > 1 && (
                        <button type="button" className="btn-remove-window" onClick={() => removeWindow(i)}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.availabilityWindows && <p className="field-error">{errors.availabilityWindows}</p>}
                {Object.keys(errors)
                  .filter((key) => key.includes('availabilityWindows.') && key.endsWith('.range'))
                  .map((key) => (
                    <p key={key} className="field-error">{errors[key]}</p>
                  ))}
                <button type="button" className="btn-add-window" onClick={addWindow}>
                  + Add Time Window
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="status-toggle">
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`status-option ${form.status === option ? `status-option--${option === 'ACTIVE' ? 'active' : 'oos'}` : ''}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option}
                        checked={form.status === option}
                        onChange={handleChange}
                      />
                      <span className={`status-dot status-dot--${option === 'ACTIVE' ? 'active' : 'oos'}`} />
                      {option === 'ACTIVE' ? 'Active' : 'Out of Service'}
                    </label>
                  ))}
                </div>
                {errors.status && <p className="field-error">{errors.status}</p>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : selectedResource ? 'Save Changes' : 'Create Resource'}
                </button>
                <button type="button" className="btn-form-cancel-secondary" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
