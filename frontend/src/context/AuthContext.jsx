import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { decodeToken } from '../utils/jwtUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      // The API returns an ApiResponse, so the actual user profile is in response.data.data
      const userData = response.data?.data || response.data; 
      
      const token = localStorage.getItem('accessToken');
      const decoded = decodeToken(token);
      
      setUser({
        ...userData,
        role: userData.role || decoded?.role || 'STUDENT'
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      // Only fully logout if there's no token at all (truly unauthenticated)
      // Don't logout on temporary network errors when user data may already be set
      const token = localStorage.getItem('accessToken');
      if (!token) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const setTokens = useCallback((accessToken, refreshToken, registrationStatus) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Decode and set initial user data immediately before fetching
    const decoded = decodeToken(accessToken);
    if (decoded) {
      setUser({
        email: decoded.sub || decoded.email,
        role: decoded.role || 'STUDENT',
        registrationStatus: registrationStatus || 'PENDING_DETAILS'
      });
    }
    
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      setLoading(true);
      await authAPI.deleteAccount();
      logout();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const googleLogin = useCallback(() => {
    window.location.href = 'http://localhost:8081/api/oauth2/authorization/google';
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, registrationStatus } = response.data;
      setTokens(accessToken, refreshToken, registrationStatus);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setTokens]);

  const register = useCallback(async (details) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(details);
      const { accessToken, refreshToken, registrationStatus } = response.data;
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken, registrationStatus);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setTokens]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        logout,
        login,
        register,
        updateProfile,
        deleteAccount,
        setTokens,
        googleLogin,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
