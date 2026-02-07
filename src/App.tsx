import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Exam } from './pages/Exam';
import { Results } from './pages/Results';
import { ExamResult } from './pages/ExamResult';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/exam-candidates/" element={<Home />} />
              <Route path="/exam-candidates/exam/:examId" element={<Exam />} />
              <Route path="/exam-candidates/result/:resultId" element={<ExamResult />} />
              <Route path="/exam-candidates/results" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/exam-candidates/login" element={<Login />} />
              <Route
                path="/exam-candidates/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
