const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
    return cb(new Error('Only image and document files are allowed!'), false);
  }
  cb(null, true);
};

// Upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/uploads
// @desc    Upload a file
// @access  Private
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    res.json({
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

// @route   GET /api/uploads
// @desc    Get user's uploaded files
// @access  Private
router.get('/', auth, (req, res) => {
  try {
    const directoryPath = path.join(__dirname, '../uploads');
    
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error reading uploads directory:', err);
        return res.status(500).json({ msg: 'Error reading files' });
      }
      
      // Filter out metadata files, etc.
      const fileList = files.filter(file => !file.startsWith('.'));
      
      res.json(fileList.map(filename => ({
        fileName: filename,
        filePath: `/uploads/${filename}`
      })));
    });
  } catch (err) {
    console.error('Error getting uploads:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/uploads/:filename
// @desc    Delete a file
// @access  Private
router.delete('/:filename', auth, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: 'File not found' });
    }
    
    // Delete the file
    fs.unlink(filePath, err => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ msg: 'Error deleting file' });
      }
      
      res.json({ msg: 'File deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
