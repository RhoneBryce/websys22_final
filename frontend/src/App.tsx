import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Index from './components/Index';
import Login from './components/Login';
import AILogin from './components/AILogin';
import Dashboard from './components/Dashboard';
import AIDashboard from './components/AIDashboard';
import AIProfiles from './components/AIProfiles';
import Matches from './components/Matches';
import MatchDetails from './components/MatchDetails';
import Threads from './components/Threads';
import Groups from './components/Groups';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/ai-login" element={<AILogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-dashboard" element={<AIDashboard />} />
            <Route path="/ai-profiles" element={<AIProfiles />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/match-details" element={<MatchDetails />} />
            <Route path="/threads/:threadId" element={<Threads />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
