import React from 'react';
import './Badge.css';

/**
 * Modern Badge component for indicating statuses or priorities.
 * variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
 */
function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`custom-badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
