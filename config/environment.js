// Environment configuration
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api/v1',
    ENVIRONMENT: 'development',
    USE_MOCKS: false,
    ALLOW_DEMO_LOGINS: true,
  },
  production: {
    API_BASE_URL: 'https://your-production-domain.com/api/v1',
    ENVIRONMENT: 'production',
    USE_MOCKS: false,
    ALLOW_DEMO_LOGINS: false,
  },
};

// Get current environment
const getEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

// Export current environment config
export const config = ENV[getEnvironment()];

// Export individual config values
export const API_BASE_URL = config.API_BASE_URL;
export const ENVIRONMENT = config.ENVIRONMENT;
export const USE_MOCKS = config.USE_MOCKS;
export const ALLOW_DEMO_LOGINS = config.ALLOW_DEMO_LOGINS;

