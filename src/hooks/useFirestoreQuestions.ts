import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Question } from '../data/sampleQuestions';

export function useFirestoreQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('id', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const questionsData: Question[] = [];
        snapshot.forEach((doc) => {
          questionsData.push({ ...doc.data(), firestoreId: doc.id } as Question & { firestoreId: string });
        });
        setQuestions(questionsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching questions:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addQuestion = async (question: Question) => {
    try {
      await addDoc(collection(db, 'questions'), question);
    } catch (err: any) {
      console.error('Error adding question:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateQuestion = async (firestoreId: string, question: Question) => {
    try {
      const questionRef = doc(db, 'questions', firestoreId);
      await updateDoc(questionRef, { ...question });
    } catch (err: any) {
      console.error('Error updating question:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteQuestion = async (firestoreId: string) => {
    try {
      const questionRef = doc(db, 'questions', firestoreId);
      await deleteDoc(questionRef);
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    questions,
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
