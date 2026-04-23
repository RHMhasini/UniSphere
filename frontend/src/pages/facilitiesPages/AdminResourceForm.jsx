import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Building2,
  Search,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
} from '../../services/resourceService';

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

const statusBadgeClass = (status) => {
  if (status === 'ACTIVE') {
    return 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
  return 'bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300';
};

const typeBadgeClass = (type) => {
  const map = {
    LECTURE_HALL: 'bg-indigo-50 text-indigo-800 ring-indigo-600/15 dark:bg-indigo-950/40 dark:text-indigo-300',
    LAB: 'bg-purple-50 text-purple-800 ring-purple-600/15 dark:bg-purple-950/40 dark:text-purple-300',
    MEETING_ROOM: 'bg-sky-50 text-sky-800 ring-sky-600/15 dark:bg-sky-950/40 dark:text-sky-300',
    EQUIPMENT: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
  };
  return map[type] || 'bg-slate-50 text-slate-800 ring-slate-600/15 dark:bg-slate-800 dark:text-slate-300';
};

export default function AdminResourceForm() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setListLoading(true);
    try {
      const response = await getAllResources();
      setResources(response.data || []);
    } catch (err) {
      toast.error('Unable to load resources. Please try again.');
    } finally {
      setListLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const normalized = searchTerm.trim().toLowerCase();
    const typeMatch = typeFilter === 'ALL' || resource.type === typeFilter;
    if (!normalized) return typeMatch;
    
    const searchMatch = (
      resource.name?.toLowerCase().includes(normalized) ||
      resource.location?.toLowerCase().includes(normalized) ||
      resource.capacity?.toString().toLowerCase().includes(normalized)
    );
    return typeMatch && searchMatch;
  });

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
        toast.success('Resource updated successfully!');
      } else {
        await createResource(payload);
        toast.success('Resource added successfully!');
      }

      closeForm();
      await loadResources();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save resource. Please try again.';
      toast.error(errorMessage);
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
    if (!window.confirm('Are you sure you want to permanently delete this resource?')) {
      return;
    }

    try {
      await deleteResource(id);
      toast.success('Resource deleted successfully!');
      await loadResources();
    } catch (err) {
      toast.error('Unable to delete resource. Please try again.');
    }
  };

  const getWindowDisplay = (resource) => {
    return resource.availabilityWindows?.join(', ') || '—';
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Resource Management
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View, add, edit, and remove campus facilities and equipment.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        )}
      </div>

      {isFormOpen ? (
        /* FORM SECTION (MODAL ALTERNATIVE) */
        <div className="card-premium overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {selectedResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedResource ? 'Update the details below.' : 'Fill out the details to register a new resource.'}
              </p>
            </div>
            <button
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Lab A-203"
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      errors.name 
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-900' 
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      errors.type 
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-900' 
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700'
                    }`}
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="mt-1 text-xs text-rose-500">{errors.type}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 40"
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      errors.capacity 
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-900' 
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700'
                    }`}
                  />
                  {errors.capacity && <p className="mt-1 text-xs text-rose-500">{errors.capacity}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Block A, Floor 2, Room 203"
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      errors.location 
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-900' 
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700'
                    }`}
                  />
                  {errors.location && <p className="mt-1 text-xs text-rose-500">{errors.location}</p>}
                </div>
              </div>

              {/* Row 3 - Timings */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Availability Windows
                </label>
                <div className="space-y-3">
                  {form.availabilityWindows.map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">From</span>
                        <input
                          type="time"
                          value={w.start}
                          onChange={(e) => handleWindowChange(i, 'start', e.target.value)}
                          className={`rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                            errors[`availabilityWindows.${i}.start`] ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">To</span>
                        <input
                          type="time"
                          value={w.end}
                          onChange={(e) => handleWindowChange(i, 'end', e.target.value)}
                          className={`rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                            errors[`availabilityWindows.${i}.end`] ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                          }`}
                        />
                      </div>
                      {form.availabilityWindows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWindow(i)}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.availabilityWindows && <p className="mt-1 text-xs text-rose-500">{errors.availabilityWindows}</p>}
                {Object.keys(errors)
                  .filter((key) => key.includes('availabilityWindows.') && key.endsWith('.range'))
                  .map((key) => (
                    <p key={key} className="mt-1 text-xs text-rose-500">{errors[key]}</p>
                  ))}
                
                <button
                  type="button"
                  onClick={addWindow}
                  className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Time Window
                </button>
              </div>

              {/* Status Radio options */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                        form.status === option
                          ? option === 'ACTIVE'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30'
                            : 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/30'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option}
                        checked={form.status === option}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {option === 'ACTIVE' ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                      {option === 'ACTIVE' ? 'Active' : 'Out of Service'}
                    </label>
                  ))}
                </div>
                {errors.status && <p className="mt-1 text-xs text-rose-500">{errors.status}</p>}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-70 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {selectedResource ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>

            </form>
          </div>
        </div>
      ) : (
        <>
          {/* SEARCH AND FILTERS SECTION */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, capacity, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', ...RESOURCE_TYPES].map((role) => (
                <button
                  key={role}
                  onClick={() => setTypeFilter(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    typeFilter === role
                      ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Resource</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Capacity</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Time Window</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {listLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-500" />
                      </td>
                    </tr>
                  ) : filteredResources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm italic text-slate-500 dark:text-slate-400">
                        <AlertTriangle className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                        No resources match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredResources.map((resource) => (
                      <tr key={resource.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900 dark:text-white">{resource.name}</p>
                          <p className="text-xs text-slate-500">{resource.location}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${typeBadgeClass(resource.type)}`}>
                            {resource.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          {resource.capacity} pax
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs">
                          {getWindowDisplay(resource)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(resource.status)}`}>
                            {resource.status === 'ACTIVE' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                            {resource.status === 'ACTIVE' ? 'Active' : 'OOS'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(resource)}
                              className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
