import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { login, register } from '../services/api';

const Login: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await login(email, password);
        setUser(response.user);
        navigate('/dashboard');
      } else {
        await register(name, email, password);
        setError('Account created successfully. Please login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      // Extract error message from response if available
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || (isLogin ? 'Invalid credentials' : 'Registration failed'));
    }
  };

  const handleGoToAILogin = () => {
    navigate('/ai-login');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', fontSize: '2rem', animation: `float 6s ease-in-out infinite`, opacity: 0.7, animationDelay: `${i * 0.5}s` }}>
            ❤️
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', zIndex: 1, color: '#fff', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ff69b4' }}>Your App Title</h1>
        <h2>{isLogin ? 'User Login' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', maxWidth: '400px', margin: '0 auto' }}>
        {!isLogin && (
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', marginTop: '10px' }}>{isLogin ? 'Login' : 'Create Account'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#ff69b4', border: '2px solid #ff69b4', borderRadius: '50px', cursor: 'pointer', marginTop: '10px', marginRight: '10px' }}>
          {isLogin ? 'Need an account? Create one' : 'Already have an account? Login'}
        </button>
        <button onClick={handleGoToAILogin} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', marginTop: '10px' }}>
          Login as AI →
        </button>
      </div>
    </div>
  );
};

export default Login;
