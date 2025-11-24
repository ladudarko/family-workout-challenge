import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Countdown from './components/Countdown';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      axios.get('/api/profile')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header" style={{ position: 'relative' }}>
        <h1>🏃‍♀️ Family Workout Challenge</h1>
        <div style={{ margin: '10px 0' }}>
          <Countdown endDate={'2025-11-28T23:59:59-05:00'} label="Challenge ends in:" />
        </div>
        <div style={{
          background: '#222',
          color: '#fff',
          border: '1px solid #444',
          padding: '12px 16px',
          borderRadius: '6px',
          display: 'inline-block',
          fontSize: '20px',
          fontWeight: 700,
          marginTop: '10px'
        }}>
          3 day water fast begins in: <Countdown startDate={'2025-11-26T00:00:00-05:00'} />
        </div>
        {user && (
          <button className="logout-btn-header" onClick={handleLogout}>
            🚪 Sign Out ({user.name})
            {user.is_admin && <span style={{ marginLeft: '5px' }}>👑</span>}
          </button>
        )}
      </div>

      {user ? (
        <Dashboard user={user} />
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

