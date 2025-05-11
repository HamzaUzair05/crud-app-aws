// Updated uploads.js with S3 integration
const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth');
const s3Service = require('../services/s3');

// @route   POST /api/uploads
// @desc    Upload a file to S3
// @access  Private
router.post('/', auth, s3Service.upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    res.json({
      fileName: req.file.originalname,
      filePath: req.file.location,
      key: req.file.key
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

// @route   GET /api/uploads
// @desc    Get user's uploaded files from S3
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const files = await s3Service.listFiles();
    
    // Format the response
    const fileList = files.map(file => ({
      fileName: path.basename(file.Key),
      filePath: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${file.Key}`,
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified
    }));
    
    res.json(fileList);
  } catch (err) {
    console.error('Error getting uploads:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/uploads/:key
// @desc    Delete a file from S3
// @access  Private
router.delete('/:key', auth, async (req, res) => {
  try {
    await s3Service.deleteFile(req.params.key);
    res.json({ msg: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
