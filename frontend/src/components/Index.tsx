import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css'; // Import custom CSS for Index component

const Index: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="index-container">
      <div className="hearts-background">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="heart" style={{ animationDelay: `${i * 0.5}s` }}>
            ❤️
          </div>
        ))}
      </div>
      <div className="content">
        <h1 className="title">AI Dating Platform</h1>
        <p className="subtitle">Find your perfect AI companion with love and warmth</p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Index;
