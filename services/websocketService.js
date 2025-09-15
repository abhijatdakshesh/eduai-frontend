import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  async connect() {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('WebSocket: No token available');
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      this.socket = io(apiUrl, {
        auth: { token },
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO: Connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.emit('connected');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO: Disconnected', reason);
        this.isConnecting = false;
        this.emit('disconnected', { reason });
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket.IO: Connection error', err.message);
        this.isConnecting = false;
        this.emit('error', err);
      });

      // Server events
      this.socket.on('attendance_marked', (payload) => this.emit('attendance_marked', payload));
      this.socket.on('attendance_updated', (payload) => this.emit('attendance_updated', payload));
      this.socket.on('assessment_published', (payload) => this.emit('assessment_published', payload));
      this.socket.on('announcement_created', (payload) => this.emit('announcement_created', payload));

    } catch (error) {
      console.error('WebSocket: Connection error', error);
      this.isConnecting = false;
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('WebSocket: Error in event callback', error);
      }
    });
  }

  // Send message to server
  send(event, payload) {
    if (this.socket?.connected) {
      this.socket.emit(event, payload);
    } else {
      console.warn('Socket.IO: Cannot emit, not connected');
    }
  }

  // Subscribe to specific events
  subscribeToAttendance(classId) {
    this.send('subscribe', { room: `class_${classId}` });
  }

  subscribeToAssessments(classId) {
    this.send('subscribe', { room: `class_${classId}_assessments` });
  }

  subscribeToAnnouncements(classId) {
    this.send('subscribe', { room: `class_${classId}_announcements` });
  }

  // Unsubscribe from events
  unsubscribeFromAttendance(classId) {
    this.send('unsubscribe', { room: `class_${classId}` });
  }

  unsubscribeFromAssessments(classId) {
    this.send('unsubscribe', { room: `class_${classId}_assessments` });
  }

  unsubscribeFromAnnouncements(classId) {
    this.send('unsubscribe', { room: `class_${classId}_announcements` });
  }

  disconnect() {
    if (this.socket) {
      try { this.socket.disconnect(); } catch {}
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected() {
    return !!this.socket?.connected;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
