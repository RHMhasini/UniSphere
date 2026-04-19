import React, { createContext, useContext, useState } from 'react';

// MOCK USERS matching our MongoDB Seeder data
export const MOCK_USERS = [
  { id: 'u1001', name: 'Nimal Perera', role: 'STUDENT', email: 'nimal.p@sliit.lk' },
  { id: 'u1002', name: 'Kasun Silva', role: 'LECTURER', email: 'kasun.s@sliit.lk' },
  { id: 'u1003', name: 'Chathura Tech', role: 'TECHNICIAN', email: 'chathura.t@sliit.lk' },
  { id: 'u1004', name: 'Amali Tech', role: 'TECHNICIAN', email: 'amali.t@sliit.lk' },
  { id: 'u1005', name: 'Admin User', role: 'ADMIN', email: 'admin@sliit.lk' }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize from localStorage if available, else default to first mock user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('unisphere_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
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
