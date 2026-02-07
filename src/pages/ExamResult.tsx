import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFirestoreExams } from '../hooks/useFirestoreExams';
import { useFirestoreResults } from '../hooks/useFirestoreResults';
import type { ExamResult as ExamResultType } from '../hooks/useFirestoreResults';
import './Results.css';

export function ExamResult() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { exams } = useFirestoreExams();
  const { getResultById, loading } = useFirestoreResults();
  const [result, setResult] = useState<ExamResultType | null>(null);

  useEffect(() => {
    if (!resultId || loading) return;

    const resultData = getResultById(resultId);
    if (resultData) {
      setResult(resultData);
    } else {
      alert('Result not found');
      navigate('/exam-candidates/');
    }
  }, [resultId, loading, getResultById, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScorePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#48bb78';
    if (percentage >= 60) return '#ed8936';
    return '#e53e3e';
  };

  if (loading || !result) {
    return (
      <div className="results-container">
        <div className="no-results">
          <h2>Loading result...</h2>
        </div>
      </div>
    );
  }

  const percentage = getScorePercentage(result.score, result.totalQuestions);
  const exam = exams.find(e => e.id === result.examId);

  return (
    <div className="results-container">
      <div className="result-header-main">
        <Link to="/exam-candidates/" className="back-link">← Back to Home</Link>
        <h2>Exam Result</h2>
      </div>

      <div className="results-detail single-result">
        <div className="result-header">
          <h3>{result.examName}</h3>
          <div className="result-subheader">
            <span>{result.candidateName || 'Anonymous'}</span>
            <span className="result-date">{formatDate(result.date)}</span>
          </div>
        </div>

        <div className="result-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Score</div>
              <div 
                className="stat-value"
                style={{ color: getScoreColor(percentage) }}
              >
                {percentage}%
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Correct</div>
              <div className="stat-value">{result.score}/{result.totalQuestions}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-label">Time Spent</div>
              <div className="stat-value">{formatTime(result.timeSpent)}</div>
            </div>
          </div>
        </div>

        {percentage >= (exam?.passingScore || 70) ? (
          <div className="result-message success">
            <div className="message-icon">🎉</div>
            <h4>Congratulations!</h4>
            <p>You passed the exam with a score of {percentage}%</p>
          </div>
        ) : (
          <div className="result-message failure">
            <div className="message-icon">📚</div>
            <h4>Keep Learning!</h4>
            <p>You scored {percentage}%. The passing score is {exam?.passingScore || 70}%. Review the answers below and try again!</p>
          </div>
        )}

        <div className="answers-review">
          <h4>Answer Review</h4>
          {result.answers.map((answer) => {
            const question = exam?.questions.find((q) => q.id === answer.questionId);
            
            if (!question) {
              return (
                <div key={answer.questionId} className="answer-card">
                  <p>Question not found (ID: {answer.questionId})</p>
                </div>
              );
            }

            return (
              <div key={answer.questionId} className={`answer-card ${answer.correct ? 'correct' : 'incorrect'}`}>
                <div className="answer-header">
                  <span className="answer-status">
                    {answer.correct ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                  {question.category && (
                    <span className="answer-category">{question.category}</span>
                  )}
                </div>

                <div className="answer-question">{question.question}</div>

                <div className="answer-options">
                  {question.options.map((option, index) => {
                    const isUserAnswer = index === answer.userAnswer;
                    const isCorrectAnswer = index === question.correctAnswer;
                    
                    let className = 'answer-option';
                    if (isCorrectAnswer) className += ' correct-answer';
                    if (isUserAnswer && !answer.correct) className += ' user-wrong-answer';

                    return (
                      <div key={index} className={className}>
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span>{option}</span>
                        {isUserAnswer && <span className="label">Your answer</span>}
                        {isCorrectAnswer && <span className="label">Correct answer</span>}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className="answer-explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <Link to={`/exam-candidates/exam/${result.examId}`} className="cta-button">
            Retake Exam
          </Link>
          <Link to="/exam-candidates/" className="cta-button secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
