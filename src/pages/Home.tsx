import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h2>Welcome to Practice Exam System</h2>
        <p className="subtitle">Test your knowledge and improve your skills</p>
        
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Multiple Categories</h3>
            <p>Practice questions across JavaScript, React, TypeScript, and more</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Timed Exams</h3>
            <p>Simulate real exam conditions with countdown timers</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>View detailed results and explanations for each question</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Admin Panel</h3>
            <p>Manage questions and customize exam settings</p>
          </div>
        </div>

        <div className="cta-section">
          <Link to="/exam-candidates/exam" className="cta-button">Start Practice Exam</Link>
          <Link to="/exam-candidates/admin" className="cta-button secondary">Manage Questions</Link>
        </div>
      </div>
    </div>
  );
}
