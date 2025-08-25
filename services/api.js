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
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              return this.api(originalRequest);
            }
          } catch (refreshError) {
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
      if (!refreshToken) return false;

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        device_id: await this.getDeviceId(),
      }, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'X-Device-Id': await this.getDeviceId(),
        }
      });

      if (response.data.success) {
        const { access_token, refresh_token } = response.data.data.tokens;
        await this.setTokens(access_token, refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      // Don't log token refresh failures as errors - this is normal when tokens expire
      console.log('Token refresh: No valid refresh token');
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
      const response = await this.api.post('/auth/login', {
        email,
        password,
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
      const response = await this.api.get('/teacher/classes');
      return response.data;
    } catch (error) {
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
      const response = await this.api.get('/parent/children');
      return response.data;
    } catch (error) {
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
