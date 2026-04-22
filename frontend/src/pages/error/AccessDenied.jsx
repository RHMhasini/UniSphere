import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="access-denied">
      <div className="access-denied__content">
        <div className="access-denied__icon">🚫</div>
        <h1 className="access-denied__title">Access Denied</h1>
        <p className="access-denied__message">
          You do not have permission to view this page. If you believe this is an error,
          please contact your system administrator.
        </p>
        <button className="access-denied__btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
