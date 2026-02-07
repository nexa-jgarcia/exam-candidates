import React from 'react';
import { useState } from 'react';
import { useFirestoreExams } from '../hooks/useFirestoreExams';
import type { Exam, Question } from '../types/exam';
import './Admin.css';

export function Admin() {
  const { exams, loading, error, addExam, updateExam, deleteExam } = useFirestoreExams();
  const [showExamForm, setShowExamForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [examFormData, setExamFormData] = useState({
    name: '',
    description: '',
    timeLimit: 900, // 15 minutes default
    passingScore: 70,
  });

  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    category: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
    explanation: '',
  });

  // Reset exam form
  const resetExamForm = () => {
    setExamFormData({
      name: '',
      description: '',
      timeLimit: 900,
      passingScore: 70,
    });
    setSelectedExam(null);
    setShowExamForm(false);
  };

  // Reset question form
  const resetQuestionForm = () => {
    setQuestionFormData({
      question: '',
      category: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      explanation: '',
    });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  // Handle exam form submission
  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'> = {
      name: examFormData.name,
      description: examFormData.description,
      timeLimit: examFormData.timeLimit,
      passingScore: examFormData.passingScore,
      questions: selectedExam?.questions || [],
    };

    try {
      if (selectedExam?.id) {
        await updateExam(selectedExam.id, examData);
      } else {
        await addExam(examData);
      }
      resetExamForm();
    } catch (err) {
      alert('Error saving exam. Please try again.');
    }
  };

  // Handle question form submission
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExam) {
      alert('Please select an exam first.');
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion?.id || `q_${Date.now()}`,
      question: questionFormData.question,
      category: questionFormData.category,
      options: [
        questionFormData.option1,
        questionFormData.option2,
        questionFormData.option3,
        questionFormData.option4,
      ],
      correctAnswer: questionFormData.correctAnswer,
      explanation: questionFormData.explanation,
    };

    try {
      const updatedQuestions = editingQuestion
        ? selectedExam.questions.map(q => q.id === editingQuestion.id ? newQuestion : q)
        : [...selectedExam.questions, newQuestion];

      await updateExam(selectedExam.id!, {
        name: selectedExam.name,
        description: selectedExam.description,
        timeLimit: selectedExam.timeLimit,
        passingScore: selectedExam.passingScore,
        questions: updatedQuestions,
      });

      // Update local state
      setSelectedExam({ ...selectedExam, questions: updatedQuestions });
      resetQuestionForm();
    } catch (err) {
      alert('Error saving question. Please try again.');
    }
  };

  // Edit exam
  const handleEditExam = (exam: Exam) => {
    setExamFormData({
      name: exam.name,
      description: exam.description,
      timeLimit: exam.timeLimit,
      passingScore: exam.passingScore,
    });
    setSelectedExam(exam);
    setShowExamForm(true);
  };

  // Delete exam
  const handleDeleteExam = async (examId: string) => {
    if (confirm('Are you sure you want to delete this exam? This will also delete all associated questions.')) {
      try {
        await deleteExam(examId);
        if (selectedExam?.id === examId) {
          setSelectedExam(null);
        }
      } catch (err) {
        alert('Error deleting exam. Please try again.');
      }
    }
  };

  // Edit question
  const handleEditQuestion = (question: Question) => {
    setQuestionFormData({
      question: question.question,
      category: question.category || '',
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedExam) return;

    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const updatedQuestions = selectedExam.questions.filter(q => q.id !== questionId);
        
        await updateExam(selectedExam.id!, {
          name: selectedExam.name,
          description: selectedExam.description,
          timeLimit: selectedExam.timeLimit,
          passingScore: selectedExam.passingScore,
          questions: updatedQuestions,
        });

        setSelectedExam({ ...selectedExam, questions: updatedQuestions });
      } catch (err) {
        alert('Error deleting question. Please try again.');
      }
    }
  };

  // View exam details
  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam);
    setShowExamForm(false);
  };

  if (loading) {
    return <div className="admin-container"><p>Loading exams...</p></div>;
  }

  if (error) {
    return (
      <div className="admin-container">
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Please check your Firebase configuration.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Exam Management System</h2>
        <button className="add-button" onClick={() => {
          resetExamForm();
          setShowExamForm(true);
        }}>
          + Create New Exam
        </button>
      </div>

      {/* Exam Form */}
      {showExamForm && (
        <form className="question-form" onSubmit={handleExamSubmit}>
          <h3>{selectedExam ? 'Edit Exam' : 'Create New Exam'}</h3>

          <div className="form-group">
            <label>Exam Name</label>
            <input
              type="text"
              value={examFormData.name}
              onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
              placeholder="e.g., JavaScript Fundamentals Exam"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={examFormData.description}
              onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
              placeholder="Brief description of the exam"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              value={Math.floor(examFormData.timeLimit / 60)}
              onChange={(e) => setExamFormData({ ...examFormData, timeLimit: parseInt(e.target.value) * 60 })}
              min="1"
              max="180"
              required
            />
          </div>

          <div className="form-group">
            <label>Passing Score (%)</label>
            <input
              type="number"
              value={examFormData.passingScore}
              onChange={(e) => setExamFormData({ ...examFormData, passingScore: parseInt(e.target.value) })}
              min="0"
              max="100"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              {selectedExam ? 'Update Exam' : 'Create Exam'}
            </button>
            <button type="button" className="cancel-button" onClick={resetExamForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Exams List */}
      <div className="questions-list">
        <h3>All Exams ({exams.length})</h3>
        
        {exams.length === 0 ? (
          <div className="no-questions">
            <p>No exams yet. Create your first exam above!</p>
          </div>
        ) : (
          <div className="questions-grid">
            {exams.map((exam) => (
              <div key={exam.id} className="question-item">
                <div className="question-item-header">
                  <span className="question-category">{exam.name}</span>
                  <div className="question-actions">
                    <button className="view-btn" onClick={() => handleViewExam(exam)}>
                      👁️ View
                    </button>
                    <button className="edit-btn" onClick={() => handleEditExam(exam)}>
                      ✏️ Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteExam(exam.id!)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                
                <div className="question-item-text">{exam.description}</div>
                
                <div className="exam-stats">
                  <span>⏱️ {Math.floor(exam.timeLimit / 60)} min</span>
                  <span>📊 {exam.passingScore}% passing</span>
                  <span>❓ {exam.questions.length} questions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Exam Details */}
      {selectedExam && !showExamForm && (
        <div className="exam-details">
          <div className="admin-header">
            <h3>📝 Questions for: {selectedExam.name}</h3>
            <button className="add-button" onClick={() => {
              resetQuestionForm();
              setShowQuestionForm(true);
            }}>
              + Add Question
            </button>
          </div>

          {/* Question Form */}
          {showQuestionForm && (
            <form className="question-form" onSubmit={handleQuestionSubmit}>
              <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={questionFormData.category}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, category: e.target.value })}
                  placeholder="e.g., JavaScript, React, TypeScript"
                  required
                />
              </div>

              <div className="form-group">
                <label>Question</label>
                <textarea
                  value={questionFormData.question}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  placeholder="Enter the question"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Option A</label>
                <input
                  type="text"
                  value={questionFormData.option1}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, option1: e.target.value })}
                  placeholder="First option"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option B</label>
                <input
                  type="text"
                  value={questionFormData.option2}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, option2: e.target.value })}
                  placeholder="Second option"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option C</label>
                <input
                  type="text"
                  value={questionFormData.option3}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, option3: e.target.value })}
                  placeholder="Third option"
                  required
                />
              </div>

              <div className="form-group">
                <label>Option D</label>
                <input
                  type="text"
                  value={questionFormData.option4}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, option4: e.target.value })}
                  placeholder="Fourth option"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={questionFormData.correctAnswer}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: parseInt(e.target.value) })}
                  required
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div className="form-group">
                <label>Explanation (Optional)</label>
                <textarea
                  value={questionFormData.explanation}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer"
                  rows={2}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                <button type="button" className="cancel-button" onClick={resetQuestionForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Questions List for Selected Exam */}
          {selectedExam.questions.length === 0 ? (
            <div className="no-questions">
              <p>No questions yet. Add your first question above!</p>
            </div>
          ) : (
            <div className="questions-grid">
              {selectedExam.questions.map((question) => (
                <div key={question.id} className="question-item">
                  <div className="question-item-header">
                    <span className="question-category">{question.category}</span>
                    <div className="question-actions">
                      <button className="edit-btn" onClick={() => handleEditQuestion(question)}>
                        ✏️ Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteQuestion(question.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="question-item-text">{question.question}</div>
                  
                  <div className="question-item-options">
                    {question.options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`option-preview ${index === question.correctAnswer ? 'correct' : ''}`}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span>{option}</span>
                        {index === question.correctAnswer && <span className="correct-badge">✓</span>}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="question-item-explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
