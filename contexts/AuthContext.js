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

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    const inferredRole =
      rawUser.role ||
      rawUser.user_type ||
      rawUser.userType ||
      rawUser.type ||
      rawUser.role_name ||
      rawUser.roleName ||
      null;
    const role = inferredRole ? String(inferredRole).toLowerCase() : null;
    return { ...rawUser, role };
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Debug authentication state changes
  useEffect(() => {
    console.log('AuthContext - Authentication state changed:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const response = await apiClient.getProfile();
        if (response.success) {
          setUser(normalizeUser(response.data.user));
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
    console.log('Clearing authentication state...');
    console.log('Before clear - user:', user, 'isAuthenticated:', isAuthenticated);
    
    setUser(null);
    setIsAuthenticated(false);
    
    try {
      await AsyncStorage.clear(); // Clear all storage to ensure complete logout
      console.log('AsyncStorage cleared successfully');
    } catch (error) {
      console.log('Error clearing AsyncStorage:', error);
    }
    
    console.log('Authentication state cleared - user should be null, isAuthenticated should be false');
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        setUser(normalizeUser(response.data.user));
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
    console.log('Logout function called');
    
    // Clear all stored data first
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
    } catch (error) {
      console.log('Error clearing AsyncStorage:', error);
    }
    
    // Try to call the API logout endpoint (but don't wait for it)
    try {
      apiClient.logout(logoutAllSessions).catch(error => {
        console.log('API logout failed (this is normal if backend is not running):', error.message);
      });
    } catch (error) {
      console.log('API logout error:', error.message);
    }
    
    // Immediately clear authentication state
    console.log('Setting user to null and isAuthenticated to false');
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('Logout completed successfully');
    return { success: true, message: 'Logout successful!' };
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success) {
        setUser(normalizeUser(response.data.user));
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

