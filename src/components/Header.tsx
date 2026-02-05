import { Link } from 'react-router-dom';
import './Header.css';
import React from 'react';

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>📝 Practice Exam System</h1>
        <nav className="nav">
          <Link to="/exam-candidates/" className="nav-link">Home</Link>
          <Link to="/exam-candidates/exam" className="nav-link">Take Exam</Link>
          <Link to="/exam-candidates/results" className="nav-link">Results</Link>
          <Link to="/exam-candidates/admin" className="nav-link">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
