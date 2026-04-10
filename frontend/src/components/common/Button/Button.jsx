import React from 'react';
import './Button.css';

/**
 * Modern Button component aligned with LandingPage themes.
 * variant: 'primary' | 'secondary' | 'outline' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`custom-btn btn-${variant} btn-${size} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
