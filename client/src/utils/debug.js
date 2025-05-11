/**
 * Debug utility functions for AWS Cloud Deployment
 * Provides environment-aware logging, monitoring, and error handling
 */

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isAWSEnvironment = !!process.env.REACT_APP_AWS_DEPLOYMENT;

/**
 * Log a message with environment context
 * @param {string} message - Message to log
 * @param {any} data - Optional data to include
 */
const log = (message, data = null) => {
  if (!isProduction) {
    const prefix = isAWSEnvironment ? '[AWS-DEV]' : '[LOCAL]';
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
};

/**
 * Log error with environment context
 * @param {string} message - Error message
 * @param {Error|any} error - Error object or data
 */
const logError = (message, error = null) => {
  // Always log errors, but with different detail levels based on environment
  const prefix = isProduction ? '[PROD-ERROR]' : isAWSEnvironment ? '[AWS-ERROR]' : '[LOCAL-ERROR]';
  
  if (error instanceof Error) {
    if (isProduction) {
      // Limited info in production
      console.error(`${prefix} ${message}: ${error.message}`);
    } else {
      // Full stack trace in non-production
      console.error(`${prefix} ${message}`, error.message, error.stack);
    }
  } else if (error) {
    console.error(`${prefix} ${message}`, error);
  } else {
    console.error(`${prefix} ${message}`);
  }
};

/**
 * Track API requests for debugging AWS connectivity issues
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 */
const trackApiRequest = (endpoint, params = {}) => {
  if (!isProduction) {
    const prefix = isAWSEnvironment ? '[AWS-API]' : '[LOCAL-API]';
    console.log(`${prefix} Request to ${endpoint}`, params);
  }
};

/**
 * Track API responses
 * @param {string} endpoint - API endpoint
 * @param {any} response - Response data
 */
const trackApiResponse = (endpoint, response) => {
  if (!isProduction) {
    const prefix = isAWSEnvironment ? '[AWS-API]' : '[LOCAL-API]';
    console.log(`${prefix} Response from ${endpoint}:`, response);
  }
};

/**
 * Format API error messages for display
 * @param {Error|any} error - Error from API call
 * @param {string} fallback - Default message if no error details
 * @returns {string} User-friendly error message
 */
const formatApiError = (error, fallback = 'An error occurred') => {
  if (!error) return fallback;
  
  if (error.response) {
    // Axios error format
    if (error.response.data?.msg) return error.response.data.msg;
    if (error.response.data?.message) return error.response.data.message;
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.status === 403) return 'Access denied. Please check your permissions.';
    if (error.response.status === 401) return 'Authentication required. Please log in again.';
    if (error.response.status >= 500) return 'Server error. Our team has been notified.';
  }
  
  if (error.message?.includes('Network Error')) {
    return 'Cannot connect to server. Please check your internet connection.';
  }
  
  if (error.message) return error.message;
  
  return fallback;
};

/**
 * Get auth debugging details
 * @returns {Object|null} Auth debug info or null in production
 */
const getAuthDebugInfo = () => {
  if (isProduction) return null;
  
  return {
    hasToken: !!localStorage.getItem('token'),
    environment: isAWSEnvironment ? 'AWS' : 'Local',
    timestamp: new Date().toISOString()
  };
};

/**
 * Report AWS-specific deployment issues
 * @param {string} service - AWS service name (S3, RDS, etc.)
 * @param {string} operation - Operation being performed
 * @param {any} error - Error details
 */
const reportAWSIssue = (service, operation, error) => {
  logError(`AWS ${service} ${operation} failed`, error);
  
  // In a real app, you might send this to a monitoring service
  if (isProduction && typeof window !== 'undefined') {
    // Example: report to monitoring service
    console.error(`[AWS-MONITOR] ${service}:${operation} failed`);
  }
};

// Export individual functions for selective imports
export {
  log,
  logError,
  trackApiRequest,
  trackApiResponse,
  formatApiError,
  getAuthDebugInfo,
  reportAWSIssue,
  isProduction,
  isAWSEnvironment
};

// Default export for convenience
export default {
  log,
  logError,
  trackApiRequest,
  trackApiResponse,
  formatApiError,
  getAuthDebugInfo,
  reportAWSIssue,
  isProduction,
  isAWSEnvironment
};
