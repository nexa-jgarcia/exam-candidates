import React from 'react';
import { Link } from 'react-router-dom';
import { useFirestoreExams } from '../hooks/useFirestoreExams';
import './Home.css';

export function Home() {
  const { examMetadata, loading } = useFirestoreExams();

  return (
    <div className="home">
      <div className="hero">
        <h2>Welcome to Exam System</h2>
        <p className="subtitle">Test your knowledge and improve your skills</p>
        
        {/* Available Exams Section */}
        <div className="available-exams-section">
          <h3>Available Exams</h3>
          
          {loading ? (
            <p className="loading-text">Loading exams...</p>
          ) : examMetadata.length === 0 ? (
            <div className="no-exams">
              <p>No exams available yet.</p>
              <Link to="/exam-candidates/admin" className="cta-button">Create First Exam</Link>
            </div>
          ) : (
            <div className="exams-grid">
              {examMetadata.map((exam) => (
                <div key={exam.id} className="exam-card">
                  <h4>{exam.name}</h4>
                  <p className="exam-card-description">{exam.description}</p>
                  <div className="exam-card-info">
                    <span>⏱️ {Math.floor(exam.timeLimit / 60)} min</span>
                    <span>❓ {exam.questionCount} questions</span>
                    <span>📊 {exam.passingScore}% passing</span>
                  </div>
                  <Link 
                    to={`/exam-candidates/exam/${exam.id}`} 
                    className="exam-start-button"
                  >
                    Start Exam
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cta-section">
          <Link to="/exam-candidates/admin" className="cta-button secondary">Manage Exams</Link>
        </div>

        {/* <div className="features">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Custom Exams</h3>
            <p>Take exams with tailored questions for different topics</p>
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
            <p>Create and manage custom exams and questions</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
