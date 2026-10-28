import { Question, QUIZ_QUESTIONS } from '../data/questions';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'beyond_quiz_questions_bank';

/**
 * Retrieve cached questions synchronously from localStorage
 */
export function getLocalQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading questions from localStorage', e);
  }
  // Initialize with base quiz questions
  saveLocalQuestions(QUIZ_QUESTIONS);
  return QUIZ_QUESTIONS;
}

/**
 * Persist questions to localStorage
 */
export function saveLocalQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed saving questions to localStorage', e);
  }
}

/**
 * Fetch questions asynchronously: Firestore first, then localStorage
 */
export async function getQuestionsAsync(): Promise<{ questions: Question[]; isLive: boolean }> {
  if (!isFirebaseConfigured() || !db) {
    return { questions: getLocalQuestions(), isLive: false };
  }

  try {
    const qRef = collection(db, 'quiz_questions');
    const snapshot = await getDocs(qRef);

    if (snapshot.empty) {
      // Seed Firestore with initial questions
      const local = getLocalQuestions();
      await seedQuestionsToFirestore(local);
      return { questions: local, isLive: true };
    }

    const fetched: Question[] = [];
    snapshot.forEach((d) => {
      fetched.push(d.data() as Question);
    });

    // Sort by question id
    fetched.sort((a, b) => a.id - b.id);
    saveLocalQuestions(fetched);
    return { questions: fetched, isLive: true };
  } catch (err) {
    console.warn('Firestore getQuestionsAsync error, using local fallback:', err);
    return { questions: getLocalQuestions(), isLive: false };
  }
}

/**
 * Real-time subscription to quiz questions in Firestore
 */
export function subscribeToQuestions(
  onUpdate: (questions: Question[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured() || !db) {
    onUpdate(getLocalQuestions());
    return null;
  }

  try {
    const qRef = collection(db, 'quiz_questions');
    const unsubscribe = onSnapshot(
      query(qRef),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Question[] = [];
          snapshot.forEach((d) => list.push(d.data() as Question));
          list.sort((a, b) => a.id - b.id);
          saveLocalQuestions(list);
          onUpdate(list);
        } else {
          onUpdate(getLocalQuestions());
        }
      },
      (error) => {
        console.warn('Questions snapshot subscription warning:', error);
        onUpdate(getLocalQuestions());
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed subscribing to questions collection:', err);
    onUpdate(getLocalQuestions());
    return null;
  }
}

/**
 * Save or update a single question
 */
export async function saveQuestion(question: Question): Promise<{ success: boolean; error?: any }> {
  const current = getLocalQuestions();
  const existingIdx = current.findIndex((q) => q.id === question.id);
  let updatedList: Question[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = question;
  } else {
    updatedList = [...current, question];
  }
  updatedList.sort((a, b) => a.id - b.id);
  saveLocalQuestions(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      const qDoc = doc(db, 'quiz_questions', `q_${question.id}`);
      await setDoc(qDoc, question, { merge: true });
      return { success: true };
    } catch (err) {
      console.warn('Firestore saveQuestion error:', err);
      return { success: false, error: err };
    }
  }

  return { success: true };
}

/**
 * Delete a question by ID
 */
export async function deleteQuestion(questionId: number): Promise<boolean> {
  const current = getLocalQuestions();
  const filtered = current.filter((q) => q.id !== questionId);
  saveLocalQuestions(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      const qDoc = doc(db, 'quiz_questions', `q_${questionId}`);
      await deleteDoc(qDoc);
      return true;
    } catch (err) {
      console.warn('Firestore deleteQuestion error:', err);
      return false;
    }
  }

  return true;
}

/**
 * Reset questions back to default QUIZ_QUESTIONS
 */
export async function resetQuestionsToDefault(): Promise<Question[]> {
  saveLocalQuestions(QUIZ_QUESTIONS);

  if (isFirebaseConfigured() && db) {
    try {
      await seedQuestionsToFirestore(QUIZ_QUESTIONS);
    } catch (e) {
      console.warn('Failed resetting questions in Firestore', e);
    }
  }

  return QUIZ_QUESTIONS;
}

/**
 * Seed questions batch to Firestore
 */
async function seedQuestionsToFirestore(list: Question[]): Promise<void> {
  const firestore = db;
  if (!firestore) return;
  const batch = writeBatch(firestore);
  for (const q of list) {
    const ref = doc(firestore, 'quiz_questions', `q_${q.id}`);
    batch.set(ref, q);
  }
  await batch.commit();
}
