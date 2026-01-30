import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Question, sampleQuestions } from '../data/sampleQuestions';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Exam.css';

interface ExamResult {
  date: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: number; userAnswer: number; correct: boolean }[];
  timeSpent: number;
}

export function Exam() {
  const navigate = useNavigate();
  const [questions] = useState<Question[]>(sampleQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [examResults, setExamResults] = useLocalStorage<ExamResult[]>('examResults', []);

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
    setExamStarted(true);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(1800);
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

  const submitExam = () => {
    const answers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] ?? -1,
      correct: userAnswers[q.id] === q.correctAnswer,
    }));

    const score = answers.filter((a) => a.correct).length;
    const timeSpent = 1800 - timeRemaining;

    const result: ExamResult = {
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      answers,
      timeSpent,
    };

    setExamResults([...examResults, result]);
    navigate('/results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!examStarted) {
    return (
      <div className="exam-container">
        <div className="exam-start">
          <h2>Ready to Start Your Exam?</h2>
          <div className="exam-info">
            <p><strong>Total Questions:</strong> {questions.length}</p>
            <p><strong>Time Limit:</strong> 30 minutes</p>
            <p><strong>Passing Score:</strong> 70%</p>
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
