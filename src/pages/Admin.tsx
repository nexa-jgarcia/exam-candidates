import React from 'react';
import { useState } from 'react';
import { useFirestoreQuestions } from '../hooks/useFirestoreQuestions';
import type { Question } from '../data/sampleQuestions';
import './Admin.css';

export function Admin() {
  const { questions, loading, error, addQuestion, updateQuestion, deleteQuestion } = useFirestoreQuestions();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingFirestoreId, setEditingFirestoreId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
    explanation: '',
  });

  const resetForm = () => {
    setFormData({
      category: '',
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      explanation: '',
    });
    setEditingId(null);
    setEditingFirestoreId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newQuestion: Question = {
      id: editingId || Date.now(),
      category: formData.category,
      question: formData.question,
      options: [formData.option1, formData.option2, formData.option3, formData.option4],
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation,
    };

    try {
      if (editingId && editingFirestoreId) {
        await updateQuestion(editingFirestoreId, newQuestion);
      } else {
        await addQuestion(newQuestion);
      }
      resetForm();
    } catch (err) {
      alert('Error saving question. Please try again.');
    }
  };

  const handleEdit = (question: Question & { firestoreId?: string }) => {
    setFormData({
      category: question.category,
      question: question.question,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });
    setEditingId(question.id);
    setEditingFirestoreId(question.firestoreId || null);
    setShowForm(true);
  };

  const handleDelete = async (firestoreId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(firestoreId);
      } catch (err) {
        alert('Error deleting question. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="admin-container"><p>Loading questions...</p></div>;
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
        <h2>Question Management</h2>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showForm && (
        <form className="question-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Question' : 'Add New Question'}</h3>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., JavaScript, React, TypeScript"
              required
            />
          </div>

          <div className="form-group">
            <label>Question</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Option A</label>
            <input
              type="text"
              value={formData.option1}
              onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
              placeholder="First option"
              required
            />
          </div>

          <div className="form-group">
            <label>Option B</label>
            <input
              type="text"
              value={formData.option2}
              onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
              placeholder="Second option"
              required
            />
          </div>

          <div className="form-group">
            <label>Option C</label>
            <input
              type="text"
              value={formData.option3}
              onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
              placeholder="Third option"
              required
            />
          </div>

          <div className="form-group">
            <label>Option D</label>
            <input
              type="text"
              value={formData.option4}
              onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
              placeholder="Fourth option"
              required
            />
          </div>

          <div className="form-group">
            <label>Correct Answer</label>
            <select
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
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
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why this is the correct answer"
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              {editingId ? 'Update Question' : 'Add Question'}
            </button>
            <button type="button" className="cancel-button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="questions-list">
        <h3>Current Questions ({questions.length})</h3>
        
        {questions.length === 0 ? (
          <div className="no-questions">
            <p>No custom questions yet. Add your first question above!</p>
          </div>
        ) : (
          <div className="questions-grid">
            {questions.map((question: Question & { firestoreId?: string }) => (
              <div key={question.firestoreId || question.id} className="question-item">
                <div className="question-item-header">
                  <span className="question-category">{question.category}</span>
                  <div className="question-actions">
                    <button className="edit-btn" onClick={() => handleEdit(question)}>
                      ✏️ Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(question.firestoreId!)}>
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
    </div>
  );
}
