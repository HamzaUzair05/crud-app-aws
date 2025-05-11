const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const mysql = require('mysql');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hamab034',
  database: process.env.DB_NAME || 'users'
});

// @route   GET /api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const query = 'SELECT id, name, email FROM users WHERE id = ?';
    
    db.query(query, [req.user.id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      res.json(results[0]);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
      
      const user = results[0];
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
      
      const payload = {
        user: {
          id: user.id
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Server error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      
      db.query(insertQuery, [name, email, hashedPassword], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ msg: 'Server error' });
        }
        
        const payload = {
          user: {
            id: results.insertId
          }
        };
        
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
