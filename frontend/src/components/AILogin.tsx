import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AILogin: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/ai-login', { name, password });
      // Store AI session info (backend handles session via cookies)
      localStorage.setItem('aiUser', JSON.stringify(response.data.user));
      navigate('/ai-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSwitchToUserLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: '#ff69b4', textAlign: 'center', marginBottom: '10px' }}>AI Login</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Login as an AI profile to view your matches and conversations</p>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>AI Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter AI profile name"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ffb3d9',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ffb3d9',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ff69b4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            Login as AI
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>Are you a human user?</p>
          <button
            onClick={handleSwitchToUserLogin}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#ff69b4',
              border: '2px solid #ff69b4',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Go to User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AILogin;
