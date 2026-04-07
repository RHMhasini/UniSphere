import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const status = params.get('status');

    if (token && refreshToken) {
      console.log('Tokens found, status:', status);
      setTokens(token, refreshToken);
      
      // Handle redirection based on registration status
      if (status === 'PENDING_DETAILS') {
        navigate('/register/details', { replace: true });
      } else if (status === 'PENDING_APPROVAL') {
        navigate('/register/pending', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      console.log('No tokens found, redirecting to login...');
      navigate('/login?error=oauth2_failed', { replace: true });
    }
    // We only want to run this once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating with Google...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
