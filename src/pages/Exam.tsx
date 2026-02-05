import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Question, sampleQuestions } from '../data/sampleQuestions';
import { useFirestoreQuestions } from '../hooks/useFirestoreQuestions';
import { useFirestoreResults, type ExamResult } from '../hooks/useFirestoreResults';
import './Exam.css';

export function Exam() {
  const navigate = useNavigate();
  const { questions: firestoreQuestions, loading } = useFirestoreQuestions();
  const { addResult } = useFirestoreResults();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const [candidateName, setCandidateName] = useState('');

  // Merge sample questions with Firestore questions
  useEffect(() => {
    setQuestions([...sampleQuestions, ...firestoreQuestions]);
  }, [firestoreQuestions]);

  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  const startExam = () => {
    if (!candidateName.trim()) {
      alert('Please enter your name before starting the exam.');
      return;
    }
    setExamStarted(true);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(900); // Reset to 15 minutes
  };

  const handleAnswerSelect = (answerId: number) => {
    setUserAnswers({
      ...userAnswers,
      [questions[currentQuestionIndex].id]: answerId,
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitExam = async () => {
    const answers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] ?? -1,
      correct: userAnswers[q.id] === q.correctAnswer,
    }));

    const score = answers.filter((a) => a.correct).length;
    const timeSpent = 900 - timeRemaining;

    const result: ExamResult = {
      candidateName: candidateName.trim(),
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      answers,
      timeSpent,
    };

    try {
      await addResult(result);
      navigate('/exam-candidates/results');
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Error saving exam results. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="exam-container">
        <div className="exam-start">
          <h2>Loading exam questions...</h2>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="exam-container">
        <div className="exam-start">
          <h2>Ready to Start Your Exam?</h2>
          <div className="exam-info">
            <p><strong>Total Questions:</strong> {questions.length}</p>
            <p><strong>Time Limit:</strong> 15 minutes</p>
            <p><strong>Passing Score:</strong> 70%</p>
          </div>
          <div className="name-input-section">
            <label htmlFor="candidateName">
              <strong>Enter Your Name:</strong>
            </label>
            <input
              id="candidateName"
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g., John Smith"
              className="name-input"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  startExam();
                }
              }}
            />
          </div>
          <button onClick={startExam} className="start-button">
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div className="exam-progress">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Answered: {answeredCount}/{questions.length}</span>
        </div>
        <div className="timer">
          ⏱️ Time Remaining: {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-card">
        <div className="question-category">{currentQuestion.category}</div>
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option ${userAnswers[currentQuestion.id] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="exam-navigation">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="nav-button"
        >
          ← Previous
        </button>
        
        <div className="question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentQuestionIndex ? 'active' : ''} ${userAnswers[questions[index].id] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentQuestionIndex(index)}
              title={`Question ${index + 1}`}
            />
          ))}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <button onClick={submitExam} className="nav-button submit">
            Submit Exam
          </button>
        ) : (
          <button onClick={nextQuestion} className="nav-button">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
