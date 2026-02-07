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
  id?: string;
  candidateName: string;
  examId: string;
  examName: string;
  date: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; userAnswer: number; correct: boolean }[];
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
        snapshot.forEach((docSnap) => {
          resultsData.push({ ...docSnap.data(), id: docSnap.id } as ExamResult);
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

  const addResult = async (result: Omit<ExamResult, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'examResults'), result);
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding exam result:', err);
      setError(err.message);
      throw err;
    }
  };

  const getResultById = (resultId: string): ExamResult | undefined => {
    return results.find(result => result.id === resultId);
  };

  return {
    results,
    loading,
    error,
    addResult,
    getResultById,
  };
}
