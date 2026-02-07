import { useState, useEffect } from 'react';
import { useFirestoreResults } from '../hooks/useFirestoreResults';
import { useFirestoreExams } from '../hooks/useFirestoreExams';
import './Results.css';
import React from 'react';

export function Results() {
  const { results: examResults, loading } = useFirestoreResults();
  const { exams } = useFirestoreExams();
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  // Set initial selected result when data loads
  useEffect(() => {
    if (examResults.length > 0 && selectedResultIndex === null) {
      setSelectedResultIndex(0);
    }
  }, [examResults]);

  if (loading) {
    return (
      <div className="results-container">
        <div className="no-results">
          <h2>Loading results...</h2>
        </div>
      </div>
    );
  }

  if (examResults.length === 0) {
    return (
      <div className="results-container">
        <div className="no-results">
          <h2>No exam results yet</h2>
          <p>Take an exam to see your results here!</p>
        </div>
      </div>
    );
  }

  const selectedResult = selectedResultIndex !== null ? examResults[selectedResultIndex] : null;

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

  return (
    <div className="results-container">
      <h2>Exam Results</h2>

      <div className="results-layout">
        <div className="results-sidebar">
          <h3>All Attempts</h3>
          <div className="results-list">
            {examResults.map((result, index) => {
              const percentage = getScorePercentage(result.score, result.totalQuestions);
              return (
                <button
                  key={index}
                  className={`result-item ${selectedResultIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedResultIndex(index)}
                >
                  <div className="result-item-name">{result.candidateName || 'Anonymous'}</div>
                  <div className="result-item-exam">{result.examName}</div>
                  <div className="result-item-date">{formatDate(result.date)}</div>
                  <div className="result-item-score" style={{ color: getScoreColor(percentage) }}>
                    {percentage}% ({result.score}/{result.totalQuestions})
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedResult && (
          <div className="results-detail">
            <div className="result-header">
              <h3>{selectedResult.examName}</h3>
              <div className="result-subheader">
                <span>{selectedResult.candidateName || 'Anonymous'}</span>
                <span className="result-date">{formatDate(selectedResult.date)}</span>
              </div>
            </div>

            <div className="result-stats">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">Score</div>
                  <div 
                    className="stat-value"
                    style={{ color: getScoreColor(getScorePercentage(selectedResult.score, selectedResult.totalQuestions)) }}
                  >
                    {getScorePercentage(selectedResult.score, selectedResult.totalQuestions)}%
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-label">Correct</div>
                  <div className="stat-value">{selectedResult.score}/{selectedResult.totalQuestions}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <div className="stat-label">Time Spent</div>
                  <div className="stat-value">{formatTime(selectedResult.timeSpent)}</div>
                </div>
              </div>
            </div>

            <div className="answers-review">
              <h4>Answer Review</h4>
              {selectedResult.answers.map((answer) => {
                // Find the exam that contains this result
                const exam = exams.find(e => e.id === selectedResult.examId);
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
          </div>
        )}
      </div>
    </div>
  );
}
