import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button/Button";
import {
  AlertCircle,
  ArrowLeft,
  Upload,
  X,
  MapPin,
  ChevronDown,
  Search as SearchIcon,
} from "lucide-react";
import { ticketingApi } from "../../services/ticketingApi";
import { getAllResources } from "../../services/resourceService";
import "../../styles/ticketingPagesCSS/CreateTicket.css";

// Validation rules — centralised for easy adjustment
const RULES = {
  title: { min: 5, max: 100, label: "Title" },
  description: { min: 10, max: 500, label: "Description" },
  location: { min: 3, max: 100, label: "Location" },
};

// ── Location Picker Component ────────────────────────────────────────────────
function LocationPicker({ value, onChange, onBlur, hasError }) {
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        const response = await getAllResources();
        // getAllResources returns an axios response; unwrap .data
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        // Filter to labs and lecture halls only
        const relevant = list.filter((r) => {
          const t = (r.type || "").toLowerCase();
          return (
            t.includes("lab") ||
            t.includes("lecture") ||
            t.includes("hall") ||
            t.includes("classroom") ||
            t.includes("room")
          );
        });
        setResources(relevant.length > 0 ? relevant : list); // fallback to all if none match
        setResourceError(null);
      } catch (err) {
        console.error("Failed to load resources:", err);
        setResourceError("Could not load locations from server.");
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const filteredResources = resources.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(q) ||
      (r.location || "").toLowerCase().includes(q) ||
      (r.type || "").toLowerCase().includes(q)
    );
  });

  // Group by type for better UX
  const grouped = filteredResources.reduce((acc, r) => {
    const type = r.type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(r);
    return acc;
  }, {});

  const handleSelect = (resource) => {
    // Build a descriptive location string: "Name – Location"
    const label = resource.location
      ? `${resource.name} – ${resource.location}`
      : resource.name;
    onChange(label);
    setIsOpen(false);
    setSearch("");
  };

  const handleCustomToggle = () => {
    setCustomMode(true);
    setIsOpen(false);
    onChange("");
  };

  const getTypeLabel = (type) => {
    const t = type.toLowerCase();
    if (t.includes("lab")) return "🔬 Labs";
    if (t.includes("lecture") || t.includes("hall")) return "🏛 Lecture Halls";
    if (t.includes("classroom") || t.includes("room")) return "🚪 Classrooms";
    return `📍 ${type}`;
  };

  // If in custom (free-text) mode
  if (customMode) {
    return (
      <div className="location-custom-wrapper">
        <input
          type="text"
          className={hasError ? "input-error" : ""}
          placeholder="Type location manually (e.g. IT Building, Lab 2)"
          maxLength={RULES.location.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoFocus
        />
        <button
          type="button"
          className="location-switch-btn"
          onClick={() => {
            setCustomMode(false);
            onChange("");
          }}
          title="Pick from list instead"
        >
          <MapPin size={14} /> Pick from list
        </button>
      </div>
    );
  }

  return (
    <div className="location-picker" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        className={`location-trigger ${hasError ? "input-error" : ""} ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onBlur={onBlur}
      >
        <MapPin size={16} className="location-icon" />
        <span className={value ? "location-value" : "location-placeholder"}>
          {value || "Select a lab or lecture hall…"}
        </span>
        <ChevronDown
          size={16}
          className={`location-chevron ${isOpen ? "rotated" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="location-dropdown">
          {/* Search box inside dropdown */}
          <div className="location-search">
            <SearchIcon size={14} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="location-list">
            {loadingResources ? (
              <div className="location-loading">
                <div className="location-spinner" />
                <span>Loading locations…</span>
              </div>
            ) : resourceError ? (
              <div className="location-error">
                <AlertCircle size={14} />
                <span>{resourceError}</span>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="location-empty">
                No locations match "{search}"
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="location-group">
                  <div className="location-group-label">
                    {getTypeLabel(type)}
                  </div>
                  {items.map((resource) => (
                    <button
                      key={resource.id}
                      type="button"
                      className={`location-option ${value === (resource.location ? `${resource.name} – ${resource.location}` : resource.name) ? "selected" : ""}`}
                      onClick={() => handleSelect(resource)}
                    >
                      <div className="location-option-name">
                        {resource.name}
                      </div>
                      {resource.location && (
                        <div className="location-option-meta">
                          {resource.location}
                        </div>
                      )}
                      {resource.capacity > 0 && (
                        <div className="location-option-capacity">
                          Cap: {resource.capacity}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer: type manually option */}
          <div className="location-footer">
            <button
              type="button"
              className="location-manual-btn"
              onClick={handleCustomToggle}
            >
              ✏️ Can't find it? Type manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main CreateTicket Component ───────────────────────────────────────────────
function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "";
  const basePath =
    role === "ADMIN" || role === "TECHNICIAN"
      ? "/dashboard/tickets"
      : "/dashboard/mytickets";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "HARDWARE",
    priority: "LOW",
    location: "",
    contactEmail: user?.email || "",
    contactPhone: "",
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rule = RULES[name];
    if (rule) {
      if (!value || !value.trim()) return `${rule.label} is required`;
      if (value.trim().length < rule.min)
        return `${rule.label} must be at least ${rule.min} characters`;
      if (value.trim().length > rule.max)
        return `${rule.label} must be at most ${rule.max} characters`;
    }
    if (name === "contactEmail") {
      if (!value.trim()) return "Contact email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
        return "Please enter a valid email address";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Location field handlers (used by LocationPicker)
  const handleLocationChange = (value) => {
    setFormData((prev) => ({ ...prev, location: value }));
    if (touched.location) {
      setFieldErrors((prev) => ({
        ...prev,
        location: validateField("location", value),
      }));
    }
  };

  const handleLocationBlur = () => {
    setTouched((prev) => ({ ...prev, location: true }));
    setFieldErrors((prev) => ({
      ...prev,
      location: validateField("location", formData.location),
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.attachments.length + files.length > 3) {
      setError("You can only attach up to 3 images.");
      return;
    }
    setError(null);
    const base64Files = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed as evidence.");
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
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...base64Files].slice(0, 3),
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateAll = () => {
    const errors = {};
    ["title", "description", "location", "contactEmail"].forEach((name) => {
      const msg = validateField(name, formData[name]);
      if (msg) errors[name] = msg;
    });
    return errors;
  };

  const isFormValid = () => {
    return ["title", "description", "location", "contactEmail"].every(
      (name) => !validateField(name, formData[name]),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {
      title: true,
      description: true,
      location: true,
      contactEmail: true,
    };
    setTouched((prev) => ({ ...prev, ...allTouched }));
    const errors = validateAll();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted errors before submitting.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        createdBy: user?.email || user?.sub,
      };
      await ticketingApi.post("/tickets", payload);
      navigate(basePath);
    } catch (err) {
      setError(err.message || "Failed to create ticket");
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
          <p>
            Fill out the details below to report an issue. Your ticket will be
            logged under <strong>{user?.name || user?.email}</strong>.
          </p>
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
            <label htmlFor="title">
              Issue Title <span className="req">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={
                fieldErrors.title && touched.title ? "input-error" : ""
              }
              placeholder="e.g. Broken projector in Room 4A"
              maxLength={RULES.title.max}
              required
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.title && touched.title && (
              <span className="field-error">{fieldErrors.title}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div
            className={`form-group ${role === "ADMIN" ? "half-width" : "full-width"}`}
          >
            <label htmlFor="category">
              Category <span className="req">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
            >
              <option value="HARDWARE">Hardware (Specific)</option>
              <option value="SOFTWARE">Software (Specific)</option>
              <option value="FACILITY">Facility (General/Public)</option>
            </select>
            <small className="field-hint">
              Facility tickets are visible and open to comments by everyone.
            </small>
          </div>

          {role === "ADMIN" && (
            <div className="form-group half-width">
              <label htmlFor="priority">
                Priority <span className="req">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
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
            <label htmlFor="description">
              Detailed Description <span className="req">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              className={
                fieldErrors.description && touched.description
                  ? "input-error"
                  : ""
              }
              placeholder="Describe what is happening, when it started, and who is affected."
              maxLength={RULES.description.max}
              required
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="field-footer">
              {fieldErrors.description && touched.description && (
                <span className="field-error">{fieldErrors.description}</span>
              )}
              <span className="char-counter">
                {formData.description.length}/{RULES.description.max}
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Attachments */}
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
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={formData.attachments.length >= 3}
              />
              <span className="upload-hint">
                ({formData.attachments.length}/3 attached)
              </span>
            </div>

            {formData.attachments.length > 0 && (
              <div className="attachment-preview-grid">
                {formData.attachments.map((base64, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={base64} alt={`Attachment ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeAttachment(idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact & Location */}
        <div className="form-row section-divider">
          <h3>Contact Details</h3>
        </div>

        <div className="form-row">
          {/* Location — full width, searchable dropdown */}
          <div className="form-group full-width">
            <label>
              Location / Room <span className="req">*</span>
            </label>
            <LocationPicker
              value={formData.location}
              onChange={handleLocationChange}
              onBlur={handleLocationBlur}
              hasError={!!(fieldErrors.location && touched.location)}
            />
            {fieldErrors.location && touched.location && (
              <span className="field-error">{fieldErrors.location}</span>
            )}
            <small className="field-hint">
              <MapPin size={12} style={{ display: "inline", marginRight: 4 }} />
              Select a registered lab or lecture hall, or type a custom
              location.
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactEmail">
              Contact Email <span className="req">*</span>
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              className={
                fieldErrors.contactEmail && touched.contactEmail
                  ? "input-error"
                  : ""
              }
              placeholder="your.email@university.edu"
              readOnly={role !== "ADMIN"}
              required
              value={formData.contactEmail}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.contactEmail && touched.contactEmail && (
              <span className="field-error">{fieldErrors.contactEmail}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone</label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              placeholder="071 234 5678"
              value={formData.contactPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? "Submitting…" : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;
