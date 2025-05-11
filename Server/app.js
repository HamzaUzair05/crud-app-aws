require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var uploadsRouter = require('./routes/uploads');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

// Make sure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Middleware setup - using standard express middleware
app.use(logger('dev'));
app.use(express.json());  // Using express.json instead of bodyParser for JSON
app.use(express.urlencoded({ extended: true }));  // Using express.urlencoded for URL encoding
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware to log ALL requests (move this earlier in the middleware chain)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  
  // Log headers for debugging
  console.log('Request headers:', req.headers);
  
  // Log request body for appropriate methods
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Serve uploaded files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enhanced CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    // Allow all localhost origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Health check endpoint
app.get('/healthcheck', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Make these debug routes available directly from app.js for easier testing
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

app.get('/auth/test', (req, res) => {
  res.json({ msg: 'Auth route test endpoint' });
});

// Application routes
// CRITICALLY IMPORTANT: Make sure routes are defined in the correct order
// Note: the order of these matters for route matching
app.use('/api/auth', authRouter);       // Auth routes must come first
app.use('/api/uploads', uploadsRouter); // Then upload routes
app.use('/', indexRouter);              // Then general routes

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// error handler
app.use(function(err, req, res, next) {
  console.error('Error handler:', err);
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send a JSON response
  res.status(err.status || 500);
  res.json({
    error: err.message,
    status: err.status || 500
  });
});

module.exports = app;
