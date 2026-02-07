import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFirestoreExams } from '../hooks/useFirestoreExams';
import { useFirestoreResults, type ExamResult as ExamResultType } from '../hooks/useFirestoreResults';
import type { Exam } from '../types/exam';
import './Exam.css';

export function Exam() {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { getExamById, loading: examsLoading } = useFirestoreExams();
  const { addResult } = useFirestoreResults();
  
  const [exam, setExam] = useState<Exam | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [candidateName, setCandidateName] = useState('');

  // Load exam data
  useEffect(() => {
    console.log('loading');
    
    if (!examId || examsLoading) return;
    
    const examData = getExamById(examId);
    if (examData) {
      setExam(examData);
      console.log(examData.timeLimit);
      
      setTimeRemaining(examData.timeLimit);
    } else {
      alert('Exam not found');
      navigate('/exam-candidates/');
    }
  }, [examsLoading]);

  useEffect(() => {
    if (!examStarted || !exam) return;

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
  }, [examStarted, exam]);

  const startExam = () => {
    if (!candidateName.trim()) {
      alert('Please enter your name before starting the exam.');
      return;
    }
    if (!exam || exam.questions.length === 0) {
      alert('This exam has no questions yet.');
      return;
    }
    setExamStarted(true);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemaining(exam.timeLimit);
  };

  const handleAnswerSelect = (answerId: number) => {
    if (!exam) return;
    setUserAnswers({
      ...userAnswers,
      [exam.questions[currentQuestionIndex].id]: answerId,
    });
  };

  const nextQuestion = () => {
    if (!exam || currentQuestionIndex >= exam.questions.length - 1) return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitExam = async () => {
    if (!exam) return;

    const answers = exam.questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] ?? -1,
      correct: userAnswers[q.id] === q.correctAnswer,
    }));

    const score = answers.filter((a) => a.correct).length;
    const timeSpent = exam.timeLimit - timeRemaining;

    const result: Omit<ExamResultType, 'id'> = {
      candidateName: candidateName.trim(),
      examId: exam.id!,
      examName: exam.name,
      date: new Date().toISOString(),
      score,
      totalQuestions: exam.questions.length,
      answers,
      timeSpent,
    };

    try {
      const resultId = await addResult(result);
      navigate(`/exam-candidates/result/${resultId}`);
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

  if (examsLoading || !exam) {
    return (
      <div className="exam-container">
        <div className="exam-start">
          <h2>Loading exam...</h2>
        </div>
      </div>
    );
  }

  if (exam.questions.length === 0) {
    return (
      <div className="exam-container">
        <div className="exam-start">
          <h2>{exam.name}</h2>
          <p style={{ color: '#e53e3e', marginTop: '1rem' }}>This exam has no questions yet.</p>
          <button onClick={() => navigate('/exam-candidates/')} className="start-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="exam-container">
        <div className="exam-start">
          <h2>{exam.name}</h2>
          <p className="exam-description">{exam.description}</p>
          <div className="exam-info">
            <p><strong>Total Questions:</strong> {exam.questions.length}</p>
            <p><strong>Time Limit:</strong> {Math.floor(exam.timeLimit / 60)} minutes</p>
            <p><strong>Passing Score:</strong> {exam.passingScore}%</p>
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

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div className="exam-progress">
          <span>Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
          <span>Answered: {answeredCount}/{exam.questions.length}</span>
        </div>
        <div className="timer">
          ⏱️ Time Remaining: {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-card">
        {currentQuestion.category && (
          <div className="question-category">{currentQuestion.category}</div>
        )}
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
          {exam.questions.map((q, index) => (
            <button
              key={q.id}
              className={`dot ${index === currentQuestionIndex ? 'active' : ''} ${userAnswers[q.id] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentQuestionIndex(index)}
              title={`Question ${index + 1}`}
            />
          ))}
        </div>

        {timeRemaining}

        {currentQuestionIndex === exam.questions.length - 1 ? (
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
