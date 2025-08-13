import { Alert } from 'react-native';

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || defaultMessage;
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || defaultMessage;
  }
};

export const showError = (error, defaultMessage = 'An error occurred') => {
  const message = handleApiError(error, defaultMessage);
  Alert.alert('Error', message);
};

export const showSuccess = (message) => {
  Alert.alert('Success', message);
};

export const showConfirmation = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'OK',
        onPress: onConfirm,
      },
    ]
  );
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  if (strength < 2) return { level: 'weak', color: '#d32f2f' };
  if (strength < 4) return { level: 'medium', color: '#f57c00' };
  return { level: 'strong', color: '#388e3c' };
};

