import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import '../../styles/loginPagesCSS/MockLogin.css';

function MockLogin() {
  const navigate = useNavigate();
  const { switchUser, MOCK_USERS } = useAuth();
  
  const handleLogin = (userId) => {
    switchUser(userId);
    navigate('/tickets');
  };

  return (
    <div className="mock-login-container">
      <div className="mock-login-card">
        <div className="logo-area">
           <span className="logo-icon">◈</span>
           <h2>UniSphere Dev Login</h2>
        </div>
        <p className="login-desc">
          Because the central authentication module is pending, please select a simulated role to access the system workflow correctly.
        </p>

        <div className="role-grid">
          {MOCK_USERS.map((user) => (
            <div className="role-option" key={user.id} onClick={() => handleLogin(user.id)}>
              <div className="role-avatar">{user.name.charAt(0)}</div>
              <div className="role-info">
                <h4>{user.name}</h4>
                <span className="role-badge">{user.role}</span>
              </div>
              <Button variant="outline" size="sm">Login</Button>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" onClick={() => navigate('/')} className="back-btn">
          Return to Landing Page
        </Button>
      </div>
    </div>
  );
}

export default MockLogin;
