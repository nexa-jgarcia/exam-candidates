import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Exam } from './pages/Exam';
import { Results } from './pages/Results';
import { Admin } from './pages/Admin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/exam-candidates/" element={<Home />} />
            <Route path="/exam-candidates/exam" element={<Exam />} />
            <Route path="/exam-candidates/results" element={<Results />} />
            <Route path="/exam-candidates/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
