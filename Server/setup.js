const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hamab034'
});

// Read SQL setup file
const sqlScript = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');

// Split SQL commands
const commands = sqlScript.split(';').filter(cmd => cmd.trim() !== '');

// Execute SQL commands
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  
  console.log('Connected to MySQL server');
  
  // Execute each command
  commands.forEach(command => {
    if (command.trim()) {
      connection.query(command + ';', (err, results) => {
        if (err) {
          console.error(`Error executing command: ${command}`);
          console.error(err);
        } else {
          console.log(`Command executed successfully: ${command.substring(0, 50)}...`);
        }
      });
    }
  });
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
  }
  
  console.log('Database setup completed');
  
  // Close connection after all queries are completed
  setTimeout(() => {
    connection.end();
    console.log('MySQL connection closed');
  }, 1000);
});
