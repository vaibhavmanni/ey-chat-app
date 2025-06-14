// client/src/stores/auth.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser]   = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // whenever token changes, persist/clear it and (re)fetch the user
    if (token) {
      localStorage.setItem('token', token);

      api.get('/me')      
         .then(res => setUser(res.data))
         .catch(() => {
           setToken(null);
           setUser(null);
         })
         .finally(() => setInitializing(false));
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setInitializing(false);
    }
  }, [token]);

  const login  = newToken => setToken(newToken);
  const logout = ()       => setToken(null);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
