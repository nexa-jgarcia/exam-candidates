import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import React from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/exam-candidates/');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>📝 Exam System</h1>
        <nav className="nav">
          <Link to="/exam-candidates/" className="nav-link">Home</Link>
          {/* <Link to="/exam-candidates/exam" className="nav-link">Take Exam</Link> */}
          <Link to="/exam-candidates/results" className="nav-link">Results</Link>
          <Link to="/exam-candidates/admin" className="nav-link">Admin</Link>
          {user ? (
            <div className="auth-section">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/exam-candidates/login" className="nav-link login-link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
