import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token on initial mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get('/api/auth/verify');
        setUser(res.data);
      } catch (err) {
        console.error('[AuthContext] Token verification failed, clearing auth details', err);
        await AsyncStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Login handler
  const login = async (usernameOrEmail, password) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { usernameOrEmail, password });
      await AsyncStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed, please check your credentials';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/register', { username, email, password });
      await AsyncStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed, please try again';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('[AuthContext] Error removing token', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
