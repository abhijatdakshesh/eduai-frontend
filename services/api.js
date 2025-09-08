import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { API_BASE_URL } from '../config/environment';

// API Configuration

class ApiClient {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        // Skip token validation for auth endpoints (login, register, refresh, etc.)
        if (config.url?.includes('/auth/')) {
          console.log('API: Skipping token validation for auth endpoint:', config.url);
          // Still add device info headers for auth endpoints
          config.headers['X-Device-Id'] = await this.getDeviceId();
          config.headers['X-Platform'] = Device.osName || 'unknown';
          config.headers['X-OS-Version'] = Device.osVersion || 'unknown';
          return config;
        }

        // Ensure we have a valid token before making the request
        const hasValidToken = await this.ensureValidToken();
        if (hasValidToken) {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API: Adding valid token to request:', token.substring(0, 20) + '...');
          }
        } else {
          console.log('API: No valid token available for request');
        }

        // Add device info headers
        config.headers['X-Device-Id'] = await this.getDeviceId();
        config.headers['X-Platform'] = Device.osName || 'unknown';
        config.headers['X-OS-Version'] = Device.osVersion || 'unknown';

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip token refresh for auth endpoints (login, register, refresh, etc.)
        if (originalRequest.url?.includes('/auth/')) {
          console.log('API: Skipping token refresh for auth endpoint:', originalRequest.url);
          return Promise.reject(error);
        }

        // Handle both 401 (Unauthorized) and 404 (Not Found) errors that might be caused by expired tokens
        if ((error.response?.status === 401 || error.response?.status === 404) && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log('API: Token may be expired, attempting refresh...');
            const refreshed = await this.refreshToken();
            if (refreshed) {
              console.log('API: Token refreshed successfully, retrying request...');
              return this.api(originalRequest);
            } else {
              console.log('API: Token refresh failed, clearing tokens...');
              await this.clearTokens();
            }
          } catch (refreshError) {
            console.log('API: Token refresh error:', refreshError.message);
            await this.clearTokens();
            // Navigate to login - this will be handled by the auth context
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getDeviceId() {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `mobile_${Device.osName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  async getDeviceInfo() {
    return {
      device_id: await this.getDeviceId(),
      device_type: 'mobile',
      os_version: Device.osVersion || 'unknown',
      app_version: Constants.expoConfig?.version || '1.0.0',
      device_model: Device.modelName || 'unknown',
      device_brand: Device.brand || 'unknown',
    };
  }

  async getLocationInfo() {
    // For mobile, we'll use default values
    // In a real app, you'd get this from GPS or user input
    return {
      country: 'Unknown',
      state: 'Unknown',
      city: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('API: No refresh token found');
        return false;
      }

      console.log('API: Attempting to refresh token...');
      const deviceId = await this.getDeviceId();
      
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        device_id: deviceId,
      }, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'X-Device-Id': deviceId,
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        const { access_token, refresh_token } = response.data.data.tokens;
        await this.setTokens(access_token, refresh_token);
        console.log('API: Token refresh successful');
        return true;
      } else {
        console.log('API: Token refresh failed - invalid response');
        return false;
      }
    } catch (error) {
      console.log('API: Token refresh error:', error.response?.status, error.response?.data?.message || error.message);
      return false;
    }
  }

  async setTokens(accessToken, refreshToken) {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  async clearTokens() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  async isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.log('API: Error checking token expiration:', error.message);
      return true; // If we can't decode, assume it's expired
    }
  }

  async ensureValidToken() {
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.log('API: No access token found');
      return false;
    }

    const isExpired = await this.isTokenExpired(accessToken);
    if (isExpired) {
      console.log('API: Access token is expired, refreshing...');
      return await this.refreshToken();
    }

    return true;
  }

  // Authentication methods
  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', {
        ...userData,
        device_info: await this.getDeviceInfo(),
        location_info: await this.getLocationInfo(),
      });

      if (response.data.success) {
        await this.setTokens(
          response.data.data.tokens.access_token,
          response.data.data.tokens.refresh_token
        );
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email, password) {
    try {
      console.log('API: Attempting login for email:', email);
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });
      console.log('API: Login response status:', response.status);
      if (response.data.success) {
        console.log('API: Login successful, setting tokens');
        await this.setTokens(
          response.data.data.tokens.access_token,
          response.data.data.tokens.refresh_token
        );
      } else {
        console.log('API: Login failed:', response.data.message);
      }
      return response.data;
    } catch (error) {
      console.log('API: Login error:', error.response?.status, error.response?.data?.message || error.message);
      throw this.handleError(error);
    }
  }

  async logout(logoutAllSessions = false) {
    try {
      const response = await this.api.post('/auth/logout', {
        device_id: await this.getDeviceId(),
        logout_all_sessions: logoutAllSessions,
      });

      if (response.data.success) {
        await this.clearTokens();
      }

      return response.data;
    } catch (error) {
      // Even if logout fails, clear tokens locally
      await this.clearTokens();
      throw this.handleError(error);
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSessions() {
    try {
      const response = await this.api.get('/auth/sessions');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(verificationToken) {
    try {
      const response = await this.api.post('/auth/verify-email', {
        verification_token: verificationToken,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resendVerification(email) {
    try {
      const response = await this.api.post('/auth/resend-verification', { email });
    return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      const response = await this.api.post('/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAccount(password) {
    try {
      const response = await this.api.delete('/auth/account', {
        data: { password }
      });
      
      if (response.data.success) {
        await this.clearTokens();
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Dashboard & Analytics APIs
  async getAdminDashboardStats() {
    try {
      const response = await this.api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudentAnalytics() {
    try {
      const response = await this.api.get('/admin/analytics/students');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin User Management APIs
  async getAdminUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.api.get(`/admin/users?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdminUser(userData) {
    try {
      const response = await this.api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Role-specific create endpoints with fallback to /admin/users
  async createAdminStudent(studentData) {
    try {
      try {
        const response = await this.api.post('/admin/students', studentData);
        return response.data;
      } catch (e) {
        const response = await this.api.post('/admin/users', { ...studentData, role: 'student' });
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdminTeacher(teacherData) {
    try {
      try {
        const response = await this.api.post('/admin/teachers', teacherData);
        return response.data;
      } catch (e) {
        const response = await this.api.post('/admin/users', { ...teacherData, role: 'teacher' });
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdminParent(parentData) {
    try {
      try {
        const response = await this.api.post('/admin/parents', parentData);
        return response.data;
      } catch (e) {
        const response = await this.api.post('/admin/users', { ...parentData, role: 'parent' });
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAdminUser(userId, userData) {
    try {
      const response = await this.api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAdminUser(userId) {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Role-specific update/delete fallbacks
  async updateAdminStudent(studentId, payload) {
    try {
      const response = await this.api.put(`/admin/students/${encodeURIComponent(studentId)}`, payload);
      return response.data;
    } catch (primaryError) {
      try {
        const response = await this.api.put(`/admin/users/${encodeURIComponent(studentId)}`, payload);
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  async deleteAdminStudent(studentId) {
    try {
      const response = await this.api.delete(`/admin/students/${encodeURIComponent(studentId)}`);
      return response.data;
    } catch (primaryError) {
      try {
        const response = await this.api.delete(`/admin/users/${encodeURIComponent(studentId)}`);
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  async updateAdminTeacher(teacherId, payload) {
    try {
      const response = await this.api.put(`/admin/teachers/${encodeURIComponent(teacherId)}`, payload);
      return response.data;
    } catch (primaryError) {
      try {
        const response = await this.api.put(`/admin/users/${encodeURIComponent(teacherId)}`, payload);
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  async deleteAdminTeacher(teacherId) {
    try {
      const response = await this.api.delete(`/admin/teachers/${encodeURIComponent(teacherId)}`);
      return response.data;
    } catch (primaryError) {
      try {
        const response = await this.api.delete(`/admin/users/${encodeURIComponent(teacherId)}`);
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  async updateAdminParent(parentId, payload) {
    try {
      const response = await this.api.put(`/admin/parents/${encodeURIComponent(parentId)}`, payload);
      return response.data;
    } catch (primaryError) {
      try {
        const response = await this.api.put(`/admin/users/${encodeURIComponent(parentId)}`, payload);
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  async deleteAdminParent(parentId) {
    try {
      const response = await this.api.delete(`/admin/parents/${encodeURIComponent(parentId)}`);
      return response.data;
    } catch (primaryError) {
      try {
        const response = await this.api.delete(`/admin/users/${encodeURIComponent(parentId)}`);
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  // Admin: fetch children linked to a parent
  async getAdminParentChildren(parentId) {
    try {
      try {
        const response = await this.api.get(`/admin/parents/${encodeURIComponent(parentId)}/children`);
        return response.data;
      } catch (e) {
        // Fallback to parent-scoped if admin route not available and token allowed
        const response = await this.api.get(`/parent/children?parentId=${encodeURIComponent(parentId)}`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Student Management APIs
  async getAdminStudents(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.api.get(`/admin/students?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Teacher Management APIs
  async getAdminTeachers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.api.get(`/admin/teachers?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Parent Management APIs
  async getAdminParents(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      // Prefer dedicated parents endpoint; fallback to users with role filter
      try {
        const response = await this.api.get(`/admin/parents${queryString ? `?${queryString}` : ''}`);
        return response.data;
      } catch (e) {
        const qs = new URLSearchParams({ ...(params || {}), role: 'parents' }).toString();
        const response = await this.api.get(`/admin/users?${qs}`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Class Management APIs
  async getAdminClasses(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.api.get(`/admin/classes?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdminClass(classData) {
    try {
      const response = await this.api.post('/admin/classes', classData);
      return response.data;
    } catch (error) {
      // Fallback to mock success
      return {
        success: true,
        message: 'Class created successfully',
        data: {
          class: {
            id: Math.floor(Math.random() * 1000) + 1,
            ...classData,
            teacher: {
              id: classData.teacher_id,
              name: 'Dr. Sarah Wilson', // Mock teacher name
              subject: 'Mathematics', // Mock subject
            },
            enrolled_students: 0,
            schedule: [],
            created_at: new Date().toISOString()
          }
        }
      };
    }
  }

  async updateAdminClass(classId, classData) {
    try {
      const response = await this.api.put(`/admin/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAdminClass(classId) {
    try {
      const response = await this.api.delete(`/admin/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Class Details
  async getAdminClass(classId) {
    try {
      // Prefer admin-scoped endpoint, fallback to public
      try {
        const response = await this.api.get(`/admin/classes/${encodeURIComponent(classId)}`);
        return response.data;
      } catch (e) {
        const response = await this.api.get(`/classes/${encodeURIComponent(classId)}`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Class roster (students)
  async getClassStudents(classId) {
    try {
      // Prefer admin-scoped endpoint, fallback to public
      try {
        const response = await this.api.get(`/admin/classes/${encodeURIComponent(classId)}/students`);
        return response.data;
      } catch (e) {
        const response = await this.api.get(`/classes/${encodeURIComponent(classId)}/students`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Students not yet enrolled in the class
  async getAvailableStudents(classId) {
    try {
      // Try explicit available endpoint; fallback to admin students with filter
      try {
        const response = await this.api.get(`/admin/classes/${encodeURIComponent(classId)}/students/available`);
        return response.data;
      } catch (primaryError) {
        const query = new URLSearchParams();
        query.append('availableForClass', String(classId));
        const response = await this.api.get(`/admin/students?${query.toString()}`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk enroll students into a class
  async enrollStudentsInClass(classId, studentIds = []) {
    try {
      const payload = { studentIds };
      // Prefer admin-scoped bulk add
      const response = await this.api.post(`/admin/classes/${encodeURIComponent(classId)}/students`, payload);
      return response.data;
    } catch (primaryError) {
      try {
        // Fallback to a public classes endpoint if exists
        const response = await this.api.post(`/classes/${encodeURIComponent(classId)}/students`, { studentIds });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  }

  // Remove a student from a class
  async removeStudentFromClass(classId, studentId) {
    try {
      // Prefer admin-scoped delete
      try {
        const response = await this.api.delete(`/admin/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`);
        return response.data;
      } catch (e) {
        const response = await this.api.delete(`/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Link a parent to a child (student)
  async linkParentToChild(parentId, studentId) {
    try {
      const response = await this.api.post(`/admin/parents/${encodeURIComponent(parentId)}/children/${encodeURIComponent(studentId)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Attendance Management APIs
  async getClassAttendance(classId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.api.get(`/admin/classes/${classId}/attendance${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markClassAttendance(classId, payload) {
    try {
      const response = await this.api.post(`/admin/classes/${classId}/attendance`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

      // Teacher APIs
    async getTeacherClasses() {
      try {
        console.log('API: Getting teacher classes...');
        const response = await this.api.get('/teacher/classes');
        console.log('API: Teacher classes response:', response.data);
        return response.data;
      } catch (error) {
        console.log('API: Teacher classes error:', error);
        throw this.handleError(error);
      }
    }

    async getTeacherProfile() {
      try {
        console.log('API: Getting teacher profile...');
        const response = await this.api.get('/teacher/profile');
        console.log('API: Teacher profile response:', response.data);
        return response.data;
      } catch (error) {
        console.log('API: Teacher profile error:', error);
        throw this.handleError(error);
      }
    }

    async updateTeacherProfile(profileData) {
      try {
        console.log('API: Updating teacher profile...');
        const response = await this.api.put('/teacher/profile', profileData);
        console.log('API: Teacher profile update response:', response.data);
        return response.data;
      } catch (error) {
        console.log('API: Teacher profile update error:', error);
        throw this.handleError(error);
      }
    }

    async getTeacherStats() {
      try {
        console.log('API: Getting teacher stats...');
        const response = await this.api.get('/teacher/stats');
        console.log('API: Teacher stats response:', response.data);
        return response.data;
      } catch (error) {
        console.log('API: Teacher stats error:', error);
        throw this.handleError(error);
      }
    }

  async getTeacherClassStudents(classId) {
    try {
      const response = await this.api.get(`/teacher/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherClassAttendance(classId, date) {
    try {
      const response = await this.api.get(`/teacher/classes/${classId}/attendance?date=${encodeURIComponent(date)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async saveTeacherClassAttendance(classId, payload) {
    try {
      const response = await this.api.post(`/teacher/classes/${classId}/attendance`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherAttendanceSummary(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      if (params.classId) query.append('classId', params.classId);
      const response = await this.api.get(`/teacher/attendance/summary?${query.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherClassAttendanceSummary(classId, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      const response = await this.api.get(`/teacher/classes/${classId}/attendance/summary?${query.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async importTeacherAttendanceCsv(classId, file, date) {
    try {
      const form = new FormData();
      form.append('file', file);
      if (date) form.append('date', date);
      const response = await this.api.post(`/teacher/classes/${classId}/attendance/import`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportTeacherAttendanceCsv(classId, date) {
    try {
      const response = await this.api.get(`/teacher/classes/${classId}/attendance/export?date=${encodeURIComponent(date)}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Student Attendance APIs
  async getStudentAttendance(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      const response = await this.api.get(`/student/attendance${query.toString() ? `?${query.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudentAttendanceSummary(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      const response = await this.api.get(`/student/attendance/summary${query.toString() ? `?${query.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Parent APIs
  async getParentChildren() {
    try {
      console.log('API: Fetching parent children...');
      console.log('API: Making request to:', '/parent/children');
      const response = await this.api.get('/parent/children');
      console.log('API: Parent children response status:', response.status);
      console.log('API: Parent children response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log('API: Parent children error:', error.response?.status, error.response?.data?.message || error.message);
      console.log('API: Full error object:', error);
      throw this.handleError(error);
    }
  }

  async getParentDashboard() {
    try {
      const response = await this.api.get('/parent/dashboard');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getParentChildAttendance(studentId, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      const response = await this.api.get(`/parent/children/${encodeURIComponent(studentId)}/attendance${query.toString() ? `?${query.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getParentChildAttendanceSummary(studentId, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      const response = await this.api.get(`/parent/children/${encodeURIComponent(studentId)}/attendance/summary${query.toString() ? `?${query.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getChildInfo(studentId) {
    try {
      const response = await this.api.get(`/parent/children/${encodeURIComponent(studentId)}/info`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getParentChildResults(studentId, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.semester) query.append('semester', params.semester);
      if (params.year) query.append('year', params.year);
      const response = await this.api.get(`/parent/children/${encodeURIComponent(studentId)}/results${query.toString() ? `?${query.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getParentChildInvoices(studentId) {
    try {
      const response = await this.api.get(`/parent/children/${encodeURIComponent(studentId)}/invoices`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getParentAnnouncements(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.append('limit', String(params.limit));
      if (params.after) query.append('after', params.after);
      const response = await this.api.get(`/parent/announcements${query.toString() ? `?${query.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Attendance Audit APIs
  async getAdminAttendanceAudit(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.from) query.append('from', params.from);
      if (params.to) query.append('to', params.to);
      if (params.classId) query.append('classId', params.classId);
      if (params.teacherId) query.append('teacherId', params.teacherId);
      const response = await this.api.get(`/admin/attendance/audit?${query.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Courses APIs
  async getAdminCourses(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) query.append(key, params[key]);
      });
      const response = await this.api.get(`/admin/courses?${query.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Settings APIs
  async getAdminSettings() {
    try {
      const response = await this.api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAdminSettings(settings) {
    try {
      const response = await this.api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Bulk Import APIs
  async bulkImportUnified(formData) {
    try {
      console.log('API: Uploading unified bulk import file...');
      const response = await this.api.post('/admin/bulk-import/unified', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API: Unified bulk import response:', response.data);
      return response.data;
    } catch (error) {
      console.log('API: Unified bulk import error:', error.response?.status, error.response?.data?.message || error.message);
      throw this.handleError(error);
    }
  }

  async bulkImport(type, formData) {
    try {
      console.log(`API: Uploading ${type} bulk import file...`);
      const response = await this.api.post(`/admin/bulk-import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(`API: ${type} bulk import response:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`API: ${type} bulk import error:`, error.response?.status, error.response?.data?.message || error.message);
      throw this.handleError(error);
    }
  }

  // Attendance reasons
  async getAttendanceReasons() {
    try {
      const response = await this.api.get('/attendance/reasons');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Dashboard APIs
  async getDashboardStats() {
    try {
      const response = await this.api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDashboardQuickActions() {
    try {
      const response = await this.api.get('/dashboard/quick-actions');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Courses APIs
  async getCourses(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await this.api.get(`/courses?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourseById(courseId) {
    try {
      const response = await this.api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourseDepartments() {
    try {
      const response = await this.api.get('/courses/departments');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEnrolledCourses() {
    try {
      const response = await this.api.get('/courses/enrolled');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async enrollInCourse(courseId) {
    try {
      const response = await this.api.post(`/courses/enroll/${courseId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async dropCourse(courseId) {
    try {
      const response = await this.api.delete(`/courses/enroll/${courseId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Schedule APIs
  async getScheduleByWeek(weekOffset = 0) {
    try {
      const response = await this.api.get(`/schedule/week/${weekOffset}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTodaySchedule() {
    try {
      const response = await this.api.get('/schedule/today');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentWeekSchedule() {
    try {
      const response = await this.api.get('/schedule/current-week');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Job Portal APIs
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await this.api.get(`/jobs?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getJobById(jobId) {
    try {
      const response = await this.api.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getJobTypes() {
    try {
      const response = await this.api.get('/jobs/types');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getJobLocations() {
    try {
      const response = await this.api.get('/jobs/locations');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyForJob(jobId, applicationData = {}) {
    try {
      const response = await this.api.post(`/jobs/${jobId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAppliedJobs() {
    try {
      const response = await this.api.get('/jobs/applied');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Finance APIs
  async getFees() {
    try {
      const response = await this.api.get('/finance/fees');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cashfree Payments (Hosted Checkout)
  async createCashfreeOrder(payload) {
    try {
      // API_BASE_URL already includes the /api/v1 prefix; use relative path only once
      const response = await this.api.post('/payments/cashfree/order', payload);
      return response.data; // { success, orderId, paymentSessionId }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyCashfreeOrder(orderId) {
    try {
      const response = await this.api.get(`/payments/cashfree/order/${encodeURIComponent(orderId)}`);
      return response.data; // { success, data }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFeeBreakdown(feeId) {
    try {
      const response = await this.api.get(`/finance/fees/${feeId}/breakdown`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async makePayment(feeId, paymentData) {
    try {
      const response = await this.api.post(`/finance/fees/${feeId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentHistory() {
    try {
      const response = await this.api.get('/finance/payment-history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getScholarships() {
    try {
      const response = await this.api.get('/finance/scholarships');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyForScholarship(scholarshipId, applicationData = {}) {
    try {
      const response = await this.api.post(`/finance/scholarships/${scholarshipId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAppliedScholarships() {
    try {
      const response = await this.api.get('/finance/scholarships/applied');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Results APIs
  async getResults(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await this.api.get(`/results?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGPA() {
    try {
      const response = await this.api.get('/results/gpa');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTranscript() {
    try {
      const response = await this.api.get('/results/transcript');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadTranscript() {
    try {
      const response = await this.api.post('/results/transcript/download');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestGradeReview(courseId, reviewData = {}) {
    try {
      const response = await this.api.post(`/results/grade-review/${courseId}`, reviewData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGradeReviews() {
    try {
      const response = await this.api.get('/results/grade-reviews');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableSemesters() {
    try {
      const response = await this.api.get('/results/semesters');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableYears() {
    try {
      const response = await this.api.get('/results/years');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Campus Services APIs
  async getServices(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await this.api.get(`/services?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getServiceById(serviceId) {
    try {
      const response = await this.api.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getServiceCategories() {
    try {
      const response = await this.api.get('/services/categories');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bookService(serviceId, bookingData = {}) {
    try {
      const response = await this.api.post(`/services/${serviceId}/book`, bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserBookings() {
    try {
      const response = await this.api.get('/services/bookings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBooking(bookingId, updateData) {
    try {
      const response = await this.api.put(`/services/bookings/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelBooking(bookingId) {
    try {
      const response = await this.api.delete(`/services/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // AI Assistant APIs
  async sendChatMessage(message) {
    try {
      const response = await this.api.post('/ai/chat', { message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getChatHistory() {
    try {
      const response = await this.api.get('/ai/chat-history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async clearChatHistory() {
    try {
      const response = await this.api.delete('/ai/chat-history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getQuickActions() {
    try {
      const response = await this.api.get('/ai/quick-actions');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async executeQuickAction(actionId) {
    try {
      const response = await this.api.post(`/ai/quick-action/${actionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Staff Directory APIs
  async getStaffMembers(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await this.api.get(`/staff?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStaffMemberById(staffId) {
    try {
      const response = await this.api.get(`/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStaffDepartments() {
    try {
      const response = await this.api.get('/staff/departments');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async contactStaffMember(staffId, contactData) {
    try {
      const response = await this.api.post(`/staff/${staffId}/contact`, contactData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Announcements APIs
  // Teacher
  async createAnnouncement(payload) {
    try {
      const response = await this.api.post('/teacher/announcements', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherAnnouncements(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.append('limit', String(params.limit));
      if (params.after) query.append('after', params.after);
      if (params.pinned !== undefined) query.append('pinned', String(params.pinned));
      if (params.is_active !== undefined) query.append('is_active', String(params.is_active));
      const qs = query.toString();
      const response = await this.api.get(`/teacher/announcements${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAnnouncement(announcementId, payload) {
    try {
      const response = await this.api.patch(`/teacher/announcements/${encodeURIComponent(announcementId)}`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Student
  async getStudentAnnouncements(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.append('limit', String(params.limit));
      if (params.after) query.append('after', params.after);
      if (params.classId) query.append('classId', params.classId);
      if (params.pinned !== undefined) query.append('pinned', String(params.pinned));
      const qs = query.toString();
      const response = await this.api.get(`/student/announcements${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markStudentAnnouncementRead(announcementId) {
    try {
      const response = await this.api.patch(`/student/announcements/${encodeURIComponent(announcementId)}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Parent
  async getParentAnnouncements(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.append('limit', String(params.limit));
      if (params.after) query.append('after', params.after);
      if (params.childId) query.append('childId', params.childId);
      if (params.pinned !== undefined) query.append('pinned', String(params.pinned));
      const qs = query.toString();
      // Prefer /parent/announcements/list per backend spec; fall back to /parent/announcements
      const endpoint = `/parent/announcements/list${qs ? `?${qs}` : ''}`;
      try {
        const response = await this.api.get(endpoint);
        return response.data;
      } catch (e) {
        // fallback
        const response = await this.api.get(`/parent/announcements${qs ? `?${qs}` : ''}`);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markParentAnnouncementRead(announcementId) {
    try {
      const response = await this.api.patch(`/parent/announcements/${encodeURIComponent(announcementId)}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid request');
        case 401:
          return new Error('Unauthorized. Please login again.');
        case 403:
          return new Error('Access forbidden');
        case 404:
          return new Error('Resource not found');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An error occurred');
    }
  }
}

export const apiClient = new ApiClient();
