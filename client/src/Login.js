import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const history = useHistory(); // Using useHistory instead of useNavigate
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify({ email, password });
      const res = await axios.post('/api/auth/login', body, config);

      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Update authentication state
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }

      setLoading(false);
      // Redirect to dashboard after successful login
      history.push('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Authentication failed');
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Login to Your Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit}>
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
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-footer">
          <p>Don't have an account? <a href="/register">Register</a></p>
          <p><a href="/forgot-password">Forgot Password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
