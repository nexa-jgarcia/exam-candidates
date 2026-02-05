import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ExamResult {
  candidateName: string;
  date: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: number; userAnswer: number; correct: boolean }[];
  timeSpent: number;
}

export function useFirestoreResults() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'examResults'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resultsData: ExamResult[] = [];
        snapshot.forEach((doc) => {
          resultsData.push(doc.data() as ExamResult);
        });
        setResults(resultsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching exam results:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addResult = async (result: ExamResult) => {
    try {
      await addDoc(collection(db, 'examResults'), result);
    } catch (err: any) {
      console.error('Error adding exam result:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    results,
    loading,
    error,
    addResult,
  };
}
