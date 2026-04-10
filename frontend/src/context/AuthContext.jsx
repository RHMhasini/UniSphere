import React, { createContext, useContext, useState } from 'react';

// MOCK USERS matching our MongoDB Seeder data
export const MOCK_USERS = [
  { id: 'u1001', name: 'Nimal Perera', role: 'STUDENT' },
  { id: 'u1002', name: 'Kasun Silva', role: 'LECTURER' },
  { id: 'u1003', name: 'Chathura Tech', role: 'TECHNICIAN' },
  { id: 'u1004', name: 'Amali Tech', role: 'TECHNICIAN' },
  { id: 'u1005', name: 'Admin User', role: 'ADMIN' }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default to the student user for initial load
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);

  // Function to easily swap mock context logic later
  const switchUser = (userId) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
