import { Platform } from 'react-native';

// Web navigation utilities
export const webNavigation = {
  // Check if running on web
  isWeb: Platform.OS === 'web',

  // Handle browser back button
  handleBrowserBack: (callback) => {
    if (Platform.OS === 'web') {
      const handlePopState = (event) => {
        if (callback) {
          callback(event);
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
    return () => {};
  },

  // Handle page unload (refresh, close tab, etc.)
  handlePageUnload: (callback) => {
    if (Platform.OS === 'web') {
      const handleBeforeUnload = (event) => {
        if (callback) {
          callback(event);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
    return () => {};
  },

  // Add to browser history
  pushHistory: (path, title = '') => {
    if (Platform.OS === 'web' && window.history) {
      window.history.pushState({ path }, title, path);
    }
  },

  // Replace current history entry
  replaceHistory: (path, title = '') => {
    if (Platform.OS === 'web' && window.history) {
      window.history.replaceState({ path }, title, path);
    }
  },

  // Go back in browser history
  goBack: () => {
    if (Platform.OS === 'web' && window.history) {
      window.history.back();
    }
  },

  // Go forward in browser history
  goForward: () => {
    if (Platform.OS === 'web' && window.history) {
      window.history.forward();
    }
  },

  // Get current URL
  getCurrentUrl: () => {
    if (Platform.OS === 'web') {
      return window.location.href;
    }
    return null;
  },

  // Get current path
  getCurrentPath: () => {
    if (Platform.OS === 'web') {
      return window.location.pathname;
    }
    return null;
  },

  // Show browser confirmation dialog
  showConfirm: (message) => {
    if (Platform.OS === 'web') {
      return window.confirm(message);
    }
    return false;
  },

  // Show browser alert
  showAlert: (message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    }
  },

  // Close browser tab/window
  closeWindow: () => {
    if (Platform.OS === 'web') {
      window.close();
    }
  },

  // Open new tab/window
  openWindow: (url, target = '_blank') => {
    if (Platform.OS === 'web') {
      window.open(url, target);
    }
  },

  // Set page title
  setPageTitle: (title) => {
    if (Platform.OS === 'web' && document) {
      document.title = title;
    }
  },

  // Get page title
  getPageTitle: () => {
    if (Platform.OS === 'web' && document) {
      return document.title;
    }
    return null;
  },

  // Check if user is about to leave the page
  preventPageLeave: (message = 'Are you sure you want to leave this page?') => {
    if (Platform.OS === 'web') {
      const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = message;
        return message;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
    return () => {};
  },

  // Enable/disable browser back button
  enableBackButton: (enabled = true) => {
    if (Platform.OS === 'web') {
      if (enabled) {
        // Re-enable back button
        window.history.pushState(null, '', window.location.href);
      } else {
        // Disable back button by pushing a new state
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', () => {
          window.history.pushState(null, '', window.location.href);
        });
      }
    }
  },

  // Get browser user agent
  getUserAgent: () => {
    if (Platform.OS === 'web' && navigator) {
      return navigator.userAgent;
    }
    return null;
  },

  // Check if browser supports specific features
  supports: {
    history: () => Platform.OS === 'web' && !!window.history,
    localStorage: () => Platform.OS === 'web' && !!window.localStorage,
    sessionStorage: () => Platform.OS === 'web' && !!window.sessionStorage,
    geolocation: () => Platform.OS === 'web' && !!navigator.geolocation,
    notifications: () => Platform.OS === 'web' && !!window.Notification,
  }
};

export default webNavigation;
