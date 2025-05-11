-- Create database if not exists
CREATE DATABASE IF NOT EXISTS users;

-- Use the database
USE users;

-- Drop tables if they exist
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ime VARCHAR(100),
  prezime VARCHAR(100),
  email VARCHAR(100),
  telefon VARCHAR(20),
  adresa VARCHAR(255),
  linkedin VARCHAR(255),
  skype VARCHAR(100),
  instagram VARCHAR(100),
  datumRodjenja DATE,
  jmbg VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create uploads folder if it doesn't exist
-- Note: This is a SQL comment, we'll handle this in the Node.js code
