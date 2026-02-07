export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category?: string;
}

export interface Exam {
  id?: string; // Firestore document ID
  name: string;
  description: string;
  timeLimit: number; // in seconds
  passingScore: number; // percentage (0-100)
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamMetadata {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}
