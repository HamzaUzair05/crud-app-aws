import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = ({ setIsAuthenticated }) => {
  const history = useHistory(); // Using useHistory instead of useNavigate for older react-router versions
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify({ name, email, password });
      const res = await axios.post('/api/auth/register', body, config);

      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Update authentication state
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }

      setLoading(false);
      // Redirect to dashboard after successful registration
      history.push('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Registration failed');
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>Create an Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Enter a password (6+ characters)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className="register-footer">
          <p>Already have an account? <a href="/login">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
