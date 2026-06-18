import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    const handleAuthExpired = () => {
      logoutState();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, refreshToken, id, username: resUser, email, roles, profileImagePath } = response.data;
    
    const userObj = { id, username: resUser, email, roles, profileImagePath };
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Error during API logout call", e);
    }
    logoutState();
  };

  const logoutState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserProfile = (newUsername) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, username: newUsername };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfileImage = (filename) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, profileImagePath: filename };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        logout,
        updateUserProfile,
        updateProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
