import { apiClient } from './api';

// Standard API response wrapper
class ApiResponse {
  constructor(success, data, message, error = null) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(true, data, message);
  }

  static error(message, error = null) {
    return new ApiResponse(false, null, message, error);
  }
}

// Standard error handler
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return ApiResponse.error(data?.message || 'Bad request');
      case 401:
        return ApiResponse.error('Unauthorized. Please login again.');
      case 403:
        return ApiResponse.error('Access denied');
      case 404:
        return ApiResponse.error('Resource not found');
      case 422:
        return ApiResponse.error(data?.message || 'Validation error');
      case 500:
        return ApiResponse.error('Server error. Please try again later.');
      default:
        return ApiResponse.error(data?.message || defaultMessage);
    }
  } else if (error.request) {
    // Network error
    return ApiResponse.error('Network error. Please check your connection.');
  } else {
    // Other error
    return ApiResponse.error(error.message || defaultMessage);
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      return ApiResponse.success(response.data, 'Login successful');
    } catch (error) {
      return handleApiError(error, 'Login failed');
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.logout();
      return ApiResponse.success(response.data, 'Logout successful');
    } catch (error) {
      return handleApiError(error, 'Logout failed');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.forgotPassword(email);
      return ApiResponse.success(response.data, 'Password reset email sent');
    } catch (error) {
      return handleApiError(error, 'Failed to send reset email');
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.resetPassword(token, newPassword);
      return ApiResponse.success(response.data, 'Password reset successful');
    } catch (error) {
      return handleApiError(error, 'Password reset failed');
    }
  },
};

// Course API
export const courseAPI = {
  getCourses: async () => {
    try {
      const response = await apiClient.getCourses();
      return ApiResponse.success(response.data, 'Courses fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch courses');
    }
  },

  getCourseDepartments: async () => {
    try {
      const response = await apiClient.getCourseDepartments();
      return ApiResponse.success(response.data, 'Departments fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch departments');
    }
  },

  enrollInCourse: async (courseId) => {
    try {
      const response = await apiClient.enrollInCourse(courseId);
      return ApiResponse.success(response.data, 'Successfully enrolled in course');
    } catch (error) {
      return handleApiError(error, 'Failed to enroll in course');
    }
  },

  dropCourse: async (courseId) => {
    try {
      const response = await apiClient.dropCourse(courseId);
      return ApiResponse.success(response.data, 'Successfully dropped course');
    } catch (error) {
      return handleApiError(error, 'Failed to drop course');
    }
  },

  getCourseDetails: async (courseId) => {
    try {
      const response = await apiClient.getCourseDetails(courseId);
      return ApiResponse.success(response.data, 'Course details fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch course details');
    }
  },
};

// Attendance API
export const attendanceAPI = {
  getAttendance: async (filters = {}) => {
    try {
      const response = await apiClient.getAttendance(filters);
      return ApiResponse.success(response.data, 'Attendance fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch attendance');
    }
  },

  markAttendance: async (data) => {
    try {
      const response = await apiClient.markAttendance(data);
      return ApiResponse.success(response.data, 'Attendance marked successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to mark attendance');
    }
  },

  getAttendanceSummary: async (filters = {}) => {
    try {
      const response = await apiClient.getAttendanceSummary(filters);
      return ApiResponse.success(response.data, 'Attendance summary fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch attendance summary');
    }
  },

  getAttendanceReport: async (filters = {}) => {
    try {
      const response = await apiClient.getAttendanceReport(filters);
      return ApiResponse.success(response.data, 'Attendance report fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch attendance report');
    }
  },
};

// User Management API
export const userAPI = {
  getUsers: async (filters = {}) => {
    try {
      const response = await apiClient.getUsers(filters);
      return ApiResponse.success(response.data, 'Users fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch users');
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.createUser(userData);
      return ApiResponse.success(response.data, 'User created successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to create user');
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.updateUser(userId, userData);
      return ApiResponse.success(response.data, 'User updated successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to update user');
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiClient.deleteUser(userId);
      return ApiResponse.success(response.data, 'User deleted successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to delete user');
    }
  },

  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.getUserProfile(userId);
      return ApiResponse.success(response.data, 'User profile fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch user profile');
    }
  },
};

// Class Management API
export const classAPI = {
  getClasses: async (filters = {}) => {
    try {
      const response = await apiClient.getClasses(filters);
      return ApiResponse.success(response.data, 'Classes fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch classes');
    }
  },

  createClass: async (classData) => {
    try {
      const response = await apiClient.createClass(classData);
      return ApiResponse.success(response.data, 'Class created successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to create class');
    }
  },

  updateClass: async (classId, classData) => {
    try {
      const response = await apiClient.updateClass(classId, classData);
      return ApiResponse.success(response.data, 'Class updated successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to update class');
    }
  },

  deleteClass: async (classId) => {
    try {
      const response = await apiClient.deleteClass(classId);
      return ApiResponse.success(response.data, 'Class deleted successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to delete class');
    }
  },

  getClassStudents: async (classId) => {
    try {
      const response = await apiClient.getClassStudents(classId);
      return ApiResponse.success(response.data, 'Class students fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch class students');
    }
  },
};

// Results API
export const resultsAPI = {
  getResults: async (filters = {}) => {
    try {
      const response = await apiClient.getResults(filters);
      return ApiResponse.success(response.data, 'Results fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch results');
    }
  },

  uploadResults: async (resultsData) => {
    try {
      const response = await apiClient.uploadResults(resultsData);
      return ApiResponse.success(response.data, 'Results uploaded successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to upload results');
    }
  },

  getResultDetails: async (resultId) => {
    try {
      const response = await apiClient.getResultDetails(resultId);
      return ApiResponse.success(response.data, 'Result details fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch result details');
    }
  },
};

// Announcements API
export const announcementsAPI = {
  // Teacher create announcement
  createForTeacher: async (payload) => {
    try {
      const response = await apiClient.createAnnouncement(payload);
      return ApiResponse.success(response.data, 'Announcement created');
    } catch (error) {
      return handleApiError(error, 'Failed to create announcement');
    }
  },

  // Teacher list announcements
  listForTeacher: async (params = {}) => {
    try {
      const response = await apiClient.getTeacherAnnouncements(params);
      return ApiResponse.success(response.data, 'Announcements fetched');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch announcements');
    }
  },
};

// Reports API
export const reportsAPI = {
  getReports: async (filters = {}) => {
    try {
      const response = await apiClient.getReports(filters);
      return ApiResponse.success(response.data, 'Reports fetched successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to fetch reports');
    }
  },

  generateReport: async (reportType, filters = {}) => {
    try {
      const response = await apiClient.generateReport(reportType, filters);
      return ApiResponse.success(response.data, 'Report generated successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to generate report');
    }
  },

  exportReport: async (reportId, format = 'pdf') => {
    try {
      const response = await apiClient.exportReport(reportId, format);
      return ApiResponse.success(response.data, 'Report exported successfully');
    } catch (error) {
      return handleApiError(error, 'Failed to export report');
    }
  },
};

// Utility functions
export const apiUtils = {
  // Debounce function for search inputs
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Retry function for failed requests
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiUtils.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  },

  // Cache function for API responses
  cache: new Map(),
  
  cachedRequest: async (key, requestFn, ttl = 5 * 60 * 1000) => {
    const cached = apiUtils.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const data = await requestFn();
    apiUtils.cache.set(key, { data, timestamp: Date.now() });
    return data;
  },

  // Clear cache
  clearCache: () => {
    apiUtils.cache.clear();
  },
};

export default {
  authAPI,
  courseAPI,
  attendanceAPI,
  userAPI,
  classAPI,
  resultsAPI,
  reportsAPI,
  apiUtils,
  ApiResponse,
};
