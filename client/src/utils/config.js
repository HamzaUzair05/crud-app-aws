// Configuration file for frontend application
const config = {
  // API Endpoints
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:9000',
  
  // S3 Configuration
  s3: {
    bucket: process.env.REACT_APP_S3_BUCKET || 'your-name-contacts-bucket',
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    baseUrl: process.env.REACT_APP_S3_URL || 'https://your-name-contacts-bucket.s3.amazonaws.com'
  },
  
  // Auth configuration
  auth: {
    tokenStorageKey: 'token',
    tokenExpiryHours: 24
  }
};

export default config;
