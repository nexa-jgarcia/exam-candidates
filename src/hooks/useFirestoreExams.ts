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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Exam, ExamMetadata } from '../types/exam';

export function useFirestoreExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examMetadata, setExamMetadata] = useState<ExamMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const examsData: Exam[] = [];
        const metadataData: ExamMetadata[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const exam: Exam = {
            id: docSnap.id,
            name: data.name,
            description: data.description,
            timeLimit: data.timeLimit,
            passingScore: data.passingScore,
            questions: data.questions || [],
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          };
          examsData.push(exam);

          // Create metadata without questions array
          metadataData.push({
            id: docSnap.id,
            name: data.name,
            description: data.description,
            timeLimit: data.timeLimit,
            passingScore: data.passingScore,
            questionCount: data.questions?.length || 0,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          });
        });
        
        setExams(examsData);
        setExamMetadata(metadataData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching exams:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addExam = async (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'exams'), {
        ...exam,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error adding exam:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateExam = async (examId: string, exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const examRef = doc(db, 'exams', examId);
      await updateDoc(examRef, {
        ...exam,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating exam:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      const examRef = doc(db, 'exams', examId);
      await deleteDoc(examRef);
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      setError(err.message);
      throw err;
    }
  };

  const getExamById = (examId: string): Exam | undefined => {
    return exams.find(exam => exam.id === examId);
  };

  return {
    exams,
    examMetadata,
    loading,
    error,
    addExam,
    updateExam,
    deleteExam,
    getExamById,
  };
}
