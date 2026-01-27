/**
 * Authentication Hook
 *
 * Provides authentication state and functions throughout the app.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User data
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token, user: userData } = response.data;

        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);

        return userData;
      }
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { token, user: newUser } = response.data;

        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Update state
        setUser(newUser);
        setIsAuthenticated(true);

        return newUser;
      }
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Check if user is InterWorks consultant
   * @returns {boolean}
   */
  const isInterWorks = () => {
    return user?.role === 'interworks';
  };

  /**
   * Check if user is guest
   * @returns {boolean}
   */
  const isGuest = () => {
    return user?.role === 'guest';
  };

  /**
   * Get current user info from API
   * @returns {Promise<Object>} User data
   */
  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isInterWorks,
    isGuest,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 * @returns {Object} Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
