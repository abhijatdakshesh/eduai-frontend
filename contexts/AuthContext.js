import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const response = await apiClient.getProfile();
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          await clearAuth();
        }
      }
    } catch (error) {
      // Don't log auth check failures as errors - this is normal when tokens expire
      console.log('Auth check: No valid session found');
      await clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.clear(); // Clear all storage to ensure complete logout
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { 
          success: true, 
          message: 'Registration successful!',
          requiresVerification: response.data.requires_verification || false
        };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (logoutAllSessions = false) => {
    try {
      await apiClient.logout(logoutAllSessions);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuth();
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole: user?.role || null,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    checkAuthStatus,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

