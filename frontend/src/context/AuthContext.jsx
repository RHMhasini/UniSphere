import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mockUser');
    return savedUser ? JSON.parse(savedUser) : {
      id: 'userId123',
      name: 'John Doe',
      role: 'USER',
    };
  });

  useEffect(() => {
    localStorage.setItem('mockUser', JSON.stringify(user));
  }, [user]);

  const toggleRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'USER' ? 'ADMIN' : 'USER',
      id: prev.role === 'USER' ? 'adminId123' : 'userId123',
      name: prev.role === 'USER' ? 'Admin User' : 'John Doe'
    }));
  };

  return (
    <AuthContext.Provider value={{ user, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
