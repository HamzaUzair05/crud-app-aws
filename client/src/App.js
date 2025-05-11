import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Register from './Register';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './Navigation';
import FileUpload from './FileUpload';
import { testBackendConnection } from './utils/debug';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Initial auth check, token exists:', !!token);
      
      if (token) {
        try {
          // Verify token validity by making a request to the server
          const response = await fetch('/api/auth', {
            headers: {
              'x-auth-token': token
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
            console.log('User authenticated successfully:', userData);
          } else {
            // Token is invalid, remove it
            console.log('Token validation failed, removing token');
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Auth check error:', err);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // Test the backend connection (for debugging)
    testBackendConnection().then(result => {
      console.log('Backend connection test result:', result);
    });
  }, []);
  
  // Fetch contacts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);
  
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching contacts with token:', !!token);
      
      const response = await fetch('/contacts', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('Contacts fetched successfully:', data.length);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts: ' + error.message);
    }
  };

  const handleLogin = () => {
    console.log('Login successful, setting authenticated state');
    setIsAuthenticated(true);
    
    // We'll fetch user data separately
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth', {
        headers: {
          'x-auth-token': token
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to get user data');
      })
      .then(userData => {
        console.log('User data fetched:', userData);
        setUser(userData);
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
      });
    }
  };

  const handleLogout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setContacts([]);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <div className="loading-screen">Loading application...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          {isAuthenticated && <Navigation user={user} onLogout={handleLogout} />}
          
          <Switch>
            <Route exact path="/">
              {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
            </Route>
            
            <Route path="/login">
              {isAuthenticated ? <Redirect to="/dashboard" /> : <Login onLogin={handleLogin} />}
            </Route>
            
            <Route path="/register">
              {isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
            </Route>
            
            <Route path="/dashboard">
              {!isAuthenticated ? <Redirect to="/login" /> : (
                <div className="dashboard">
                  <h1>Dashboard</h1>
                  {error && <div className="error">{error}</div>}
                  
                  {contacts.length === 0 ? (
                    <p>No contacts found. Add some contacts to get started.</p>
                  ) : (
                    <table className="contacts-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map(contact => (
                          <tr key={contact.id}>
                            <td>{contact.Ime} {contact.Prezime}</td>
                            <td>{contact.Email}</td>
                            <td>{contact.Telefon}</td>
                            <td>{contact.Adresa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </Route>
            
            <Route path="/files">
              {!isAuthenticated ? <Redirect to="/login" /> : <FileUpload />}
            </Route>
          </Switch>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;