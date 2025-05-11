// s3.js - S3 service for file uploads
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS with improved credential handling
try {
  // First attempt to load from environment variables
  const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1'
  };
  
  // Explicitly set credentials if provided in environment variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    awsConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    console.log('Using AWS credentials from environment variables');
  } 
  // Use profile if specified
  else if (process.env.AWS_PROFILE) {
    awsConfig.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
    console.log(`Using AWS credentials from profile: ${process.env.AWS_PROFILE}`);
  }
  // Otherwise, let SDK handle credentials (EC2 role, credentials file, etc.)
  else {
    console.log('Using default AWS credential provider chain');
  }
  
  AWS.config.update(awsConfig);
} catch (error) {
  console.error('Error configuring AWS SDK:', error);
  throw new Error('Failed to configure AWS. Check your credentials and permissions.');
}

const s3 = new AWS.S3();

// Configure S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read', // Make file publicly readable
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create unique filename with original extension
      cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
      return cb(new Error('Only image and document files are allowed!'), false);
    }
    cb(null, true);
  }
});

// List files in bucket
const listFiles = async () => {
  const params = {
    Bucket: process.env.S3_BUCKET
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents;
  } catch (err) {
    console.error('Error listing S3 files:', err);
    throw err;
  }
};

// Delete file from bucket
const deleteFile = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (err) {
    console.error('Error deleting S3 file:', err);
    throw err;
  }
};

module.exports = {
  upload,
  listFiles,
  deleteFile
};
