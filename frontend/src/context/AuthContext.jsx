/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

// MOCK USERS matching our MongoDB Seeder data
export const MOCK_USERS = [
  { id: 'u1001', name: 'Nimal Perera', role: 'STUDENT', email: 'nimal.perera@university.edu' },
  { id: 'u1002', name: 'Kasun Silva', role: 'LECTURER', email: 'kasun.silva@university.edu' },
  { id: 'u1003', name: 'Chathura Jayasinghe', role: 'TECHNICIAN', email: 'chathura.tech@university.edu' },
  { id: 'u1004', name: 'Amali Fernando', role: 'TECHNICIAN', email: 'amali.tech@university.edu' },
  { id: 'u1005', name: 'Admin User', role: 'ADMIN', email: 'admin@university.edu' }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize from localStorage if available, else default to first mock user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('unisphere_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_USERS[0];
      }
    }
    return null; // Start as null to force login page if no session
  });

  const switchUser = (userId) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('unisphere_auth', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('unisphere_auth');
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, logout, MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
