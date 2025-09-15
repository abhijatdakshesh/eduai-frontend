import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import websocketService from '../services/websocketService';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';

const RealtimeAttendanceContext = createContext();

export const useRealtimeAttendance = () => {
  const context = useContext(RealtimeAttendanceContext);
  if (!context) {
    throw new Error('useRealtimeAttendance must be used within a RealtimeAttendanceProvider');
  }
  return context;
};

export const RealtimeAttendanceProvider = ({ children }) => {
  const [attendanceData, setAttendanceData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useAuth();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Connect only when authenticated
    if (!isAuthenticated) {
      websocketService.disconnect();
      setIsConnected(false);
      return;
    }

    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      console.log('RealtimeAttendance: Connected to WebSocket');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      console.log('RealtimeAttendance: Disconnected from WebSocket');
    };

    const handleAttendanceUpdated = (data) => {
      console.log('RealtimeAttendance: Attendance updated', data);
      setAttendanceData(prev => ({
        ...prev,
        [data.classId]: {
          ...prev[data.classId],
          ...data.attendance,
          lastUpdated: new Date().toISOString()
        }
      }));
      setLastUpdate(new Date().toISOString());
      
      // Show notification
      addNotification({
        id: Date.now(),
        type: 'attendance_updated',
        title: 'Attendance Updated',
        message: `Attendance has been marked for ${data.className || 'your class'}`,
        timestamp: new Date().toISOString(),
        data
      });
    };

    const handleAttendanceMarked = (data) => {
      console.log('RealtimeAttendance: Attendance marked', data);
      
      // Update attendance data
      setAttendanceData(prev => ({
        ...prev,
        [data.classId]: {
          ...prev[data.classId],
          marked: true,
          markedAt: new Date().toISOString(),
          markedBy: data.teacherName,
          totalStudents: data.totalStudents,
          presentStudents: data.presentStudents,
          absentStudents: data.absentStudents
        }
      }));
      setLastUpdate(new Date().toISOString());

      // Show notification
      addNotification({
        id: Date.now(),
        type: 'attendance_marked',
        title: 'Attendance Marked',
        message: `${data.teacherName} has marked attendance for ${data.className || 'your class'}`,
        timestamp: new Date().toISOString(),
        data
      });
    };

    const handleError = (error) => {
      console.error('RealtimeAttendance: WebSocket error', error);
    };

    // Register event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('attendance_updated', handleAttendanceUpdated);
    websocketService.on('attendance_marked', handleAttendanceMarked);
    websocketService.on('error', handleError);

    // Cleanup on unmount
    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('attendance_updated', handleAttendanceUpdated);
      websocketService.off('attendance_marked', handleAttendanceMarked);
      websocketService.off('error', handleError);
    };
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const subscribeToClass = useCallback((classId) => {
    if (isConnected) {
      websocketService.subscribeToAttendance(classId);
      console.log(`RealtimeAttendance: Subscribed to class ${classId}`);
    }
  }, [isConnected]);

  const unsubscribeFromClass = useCallback((classId) => {
    if (isConnected) {
      websocketService.unsubscribeFromAttendance(classId);
      console.log(`RealtimeAttendance: Unsubscribed from class ${classId}`);
    }
  }, [isConnected]);

  const getAttendanceForClass = useCallback((classId) => {
    return attendanceData[classId] || null;
  }, [attendanceData]);

  const refreshAttendance = useCallback(async (classId) => {
    try {
      const response = await apiClient.getStudentAttendance({ classId });
      if (response?.success) {
        setAttendanceData(prev => ({
          ...prev,
          [classId]: {
            ...response.data,
            lastUpdated: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('Failed to refresh attendance:', error);
    }
  }, []);

  const markAttendanceAsRead = useCallback((classId) => {
    setAttendanceData(prev => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        read: true
      }
    }));
  }, []);

  const value = {
    // State
    attendanceData,
    isConnected,
    lastUpdate,
    notifications,
    
    // Actions
    subscribeToClass,
    unsubscribeFromClass,
    getAttendanceForClass,
    refreshAttendance,
    markAttendanceAsRead,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <RealtimeAttendanceContext.Provider value={value}>
      {children}
    </RealtimeAttendanceContext.Provider>
  );
};

export default RealtimeAttendanceContext;
