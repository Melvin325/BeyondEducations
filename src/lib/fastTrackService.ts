import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface FastTrackOption {
  value: string;
  label: string;
}

export interface FastTrackQuestion {
  id: string;
  category: 'pg' | 'abroad';
  order: number;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'text';
  options: FastTrackOption[];
  active: boolean;
}

const STORAGE_KEY = 'beyond_fast_track_questions';

// Default PG Questions (Tailored for Graduates)
export const DEFAULT_PG_QUESTIONS: FastTrackQuestion[] = [
  {
    id: 'pg-1',
    category: 'pg',
    order: 1,
    title: 'What was your Undergraduate (UG) Degree?',
    subtitle: 'Select the degree you completed or are currently in final year of',
    type: 'single',
    options: [
      { value: 'BTech / BE', label: 'B.Tech / B.E (Engineering)' },
      { value: 'BBA / BBM / BMS', label: 'BBA / BBM / BMS (Management)' },
      { value: 'BCom / BAF / BBI', label: 'B.Com / Finance / Accounting' },
      { value: 'BCA / BSc Computer Science', label: 'BCA / B.Sc Computer Science' },
      { value: 'BSc / BA / Others', label: 'B.Sc / B.A / Other Bachelor Degrees' },
    ],
    active: true,
  },
  {
    id: 'pg-2',
    category: 'pg',
    order: 2,
    title: 'Which Postgraduate (Master’s) Course do you want to pursue?',
    subtitle: 'Select your target higher education specialization',
    type: 'single',
    options: [
      { value: 'MBA / PGDM (Finance/Marketing/HR)', label: 'MBA / PGDM (General Management / Fin / Mktg)' },
      { value: 'MBA (Business Analytics / FinTech)', label: 'MBA (Business Analytics / FinTech / AI)' },
      { value: 'MCA (Computer Applications)', label: 'MCA (Computer Applications & Software Dev)' },
      { value: 'MTech / ME (Data Science / AI)', label: 'M.Tech / M.E (Tech & Engineering)' },
      { value: 'MSc / MCom / Other Masters', label: 'M.Sc / M.Com / Executive Masters' },
    ],
    active: true,
  },
  {
    id: 'pg-3',
    category: 'pg',
    order: 3,
    title: 'Have you taken any PG Management / National Entrance Exams?',
    subtitle: 'Select any exam you have appeared for or plan to write',
    type: 'single',
    options: [
      { value: 'CAT / XAT', label: 'CAT / XAT (National Tier 1)' },
      { value: 'MAT / CMAT / ATMA', label: 'MAT / CMAT / ATMA' },
      { value: 'KMAT / PGCET / TANCET', label: 'KMAT / Karnataka PGCET / TANCET' },
      { value: 'Direct Merit / Institutional Quota', label: 'Direct Merit / College Management Quota' },
      { value: 'Not planned yet', label: 'Have not taken any exam yet' },
    ],
    active: true,
  },
  {
    id: 'pg-4',
    category: 'pg',
    order: 4,
    title: 'What is your preferred location hub for your PG?',
    subtitle: 'We offer direct college connections and corporate placement support',
    type: 'single',
    options: [
      { value: 'Karnataka (Bangalore)', label: 'Bengaluru / Karnataka (Tech & Startup Capital)' },
      { value: 'Kerala', label: 'Kerala (Kochi, Trivandrum, Calicut)' },
      { value: 'Tamil Nadu', label: 'Tamil Nadu (Chennai, Coimbatore)' },
      { value: 'Pan-India', label: 'Pan-India Premier B-Schools' },
    ],
    active: true,
  },
  {
    id: 'pg-5',
    category: 'pg',
    order: 5,
    title: 'What is your approximate total tuition budget for the 2-year program?',
    subtitle: 'Helps us match verified institutes with proven campus placement track records',
    type: 'single',
    options: [
      { value: 'Under ₹4 Lakhs', label: 'Under ₹4 Lakhs total' },
      { value: '₹4 - 7 Lakhs', label: '₹4 - ₹7 Lakhs total' },
      { value: '₹7 - 12 Lakhs', label: '₹7 - ₹12 Lakhs total' },
      { value: '₹12 Lakhs +', label: '₹12 Lakhs+ (Tier 1 & Top Private B-Schools)' },
    ],
    active: true,
  },
];

// Default Study Abroad Questions (Tailored for International Aspirants)
export const DEFAULT_ABROAD_QUESTIONS: FastTrackQuestion[] = [
  {
    id: 'abroad-1',
    category: 'abroad',
    order: 1,
    title: 'Which country are you primarily targeting to study in?',
    subtitle: 'All our partner destinations offer post-study work visas (PSW)',
    type: 'single',
    options: [
      { value: 'United Kingdom (UK)', label: 'United Kingdom (UK) — 2 Year PSW' },
      { value: 'Ireland', label: 'Ireland — 2 Year Post-Study Visa & Tech Hub' },
      { value: 'Germany / Europe', label: 'Germany / EU — Low / Zero Tuition & Schengen Visa' },
      { value: 'Australia & New Zealand', label: 'Australia & New Zealand' },
      { value: 'Canada / USA', label: 'Canada / USA' },
      { value: 'Need Advice', label: 'Open to recommendations based on my profile' },
    ],
    active: true,
  },
  {
    id: 'abroad-2',
    category: 'abroad',
    order: 2,
    title: 'What level of study are you seeking abroad?',
    subtitle: 'Select whether you are seeking Bachelors or Masters',
    type: 'single',
    options: [
      { value: 'Postgraduate / Masters (MS, MBA, MSc)', label: 'Master’s Degree (MS / MBA / MSc / MEng)' },
      { value: 'Undergraduate / Bachelors (BSc, BEng, BA)', label: 'Bachelor’s Degree (After 12th standard)' },
      { value: 'PG Diploma / Pathway', label: '1-Year PG Diploma / International Pathway' },
    ],
    active: true,
  },
  {
    id: 'abroad-3',
    category: 'abroad',
    order: 3,
    title: 'What is your current English Language Test status?',
    subtitle: 'We provide free IELTS/PTE preparation and test waiver guidance',
    type: 'single',
    options: [
      { value: 'IELTS / PTE / TOEFL completed', label: 'Already have IELTS / PTE / TOEFL score' },
      { value: 'Currently preparing / booked test', label: 'Currently preparing or booked a test date' },
      { value: 'Need IELTS test waiver', label: 'Looking for universities that waive IELTS (Medium of Instruction)' },
      { value: 'Not started yet', label: 'Have not prepared yet — need guidance' },
    ],
    active: true,
  },
  {
    id: 'abroad-4',
    category: 'abroad',
    order: 4,
    title: 'Which academic intake are you targeting?',
    subtitle: 'University application deadlines depend on your intake',
    type: 'single',
    options: [
      { value: 'Autumn / September 2026', label: 'Autumn / September 2026 (Major Intake)' },
      { value: 'Spring / January - Feb 2027', label: 'Spring / January - February 2027' },
      { value: 'Next Year (2027-2028)', label: 'Next Year (Planning ahead)' },
    ],
    active: true,
  },
  {
    id: 'abroad-5',
    category: 'abroad',
    order: 5,
    title: 'Do you hold a valid Indian passport?',
    subtitle: 'Required for university offer letters and CAS / I-20 visa filing',
    type: 'single',
    options: [
      { value: 'Yes, valid passport ready', label: 'Yes, valid passport ready' },
      { value: 'Applied / In renewal process', label: 'Applied / Currently in process' },
      { value: 'Need to apply', label: 'Do not have one yet — will apply soon' },
    ],
    active: true,
  },
];

export const ALL_DEFAULT_FAST_TRACK: FastTrackQuestion[] = [
  ...DEFAULT_PG_QUESTIONS,
  ...DEFAULT_ABROAD_QUESTIONS,
];

/**
 * Synchronous local retrieval
 */
export function getLocalFastTrackQuestions(category?: 'pg' | 'abroad'): FastTrackQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: FastTrackQuestion[] = raw ? JSON.parse(raw) : ALL_DEFAULT_FAST_TRACK;
    if (!list || list.length === 0) {
      list = ALL_DEFAULT_FAST_TRACK;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    if (category) {
      return list.filter((q) => q.category === category && q.active !== false).sort((a, b) => a.order - b.order);
    }
    return list.sort((a, b) => a.order - b.order);
  } catch {
    return category
      ? ALL_DEFAULT_FAST_TRACK.filter((q) => q.category === category)
      : ALL_DEFAULT_FAST_TRACK;
  }
}

/**
 * Save / Update a fast-track question
 */
export async function saveFastTrackQuestion(question: FastTrackQuestion): Promise<void> {
  const current = getLocalFastTrackQuestions();
  const index = current.findIndex((q) => q.id === question.id);
  let updated: FastTrackQuestion[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = question;
  } else {
    updated = [...current, question];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('beyond_fast_track_updated', { detail: updated }));

  if (isFirebaseConfigured() && db) {
    try {
      const qRef = doc(db, 'fast_track_questions', question.id);
      await setDoc(qRef, question, { merge: true });
    } catch (e) {
      console.warn('Failed to sync fast track question to Firestore:', e);
    }
  }
}

/**
 * Delete a fast-track question
 */
export async function deleteFastTrackQuestion(questionId: string): Promise<void> {
  const current = getLocalFastTrackQuestions();
  const updated = current.filter((q) => q.id !== questionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('beyond_fast_track_updated', { detail: updated }));

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'fast_track_questions', questionId));
    } catch (e) {
      console.warn('Failed to delete fast track question from Firestore:', e);
    }
  }
}

/**
 * Reset to default
 */
export async function resetFastTrackQuestionsToDefault(): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_DEFAULT_FAST_TRACK));
  window.dispatchEvent(new CustomEvent('beyond_fast_track_updated', { detail: ALL_DEFAULT_FAST_TRACK }));

  if (isFirebaseConfigured() && db) {
    try {
      for (const q of ALL_DEFAULT_FAST_TRACK) {
        await setDoc(doc(db, 'fast_track_questions', q.id), q, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to reset fast track questions in Firestore:', e);
    }
  }
}

/**
 * Subscribe to real-time updates
 */
export function subscribeToFastTrackQuestions(
  callback: (questions: FastTrackQuestion[]) => void
): () => void {
  const handleLocal = (e: any) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('beyond_fast_track_updated', handleLocal);

  let fbUnsubscribe: (() => void) | null = null;
  if (isFirebaseConfigured() && db) {
    try {
      const colRef = collection(db, 'fast_track_questions');
      fbUnsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: FastTrackQuestion[] = [];
          snapshot.forEach((d) => list.push(d.data() as FastTrackQuestion));
          list.sort((a, b) => a.order - b.order);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          callback(list);
        }
      });
    } catch (e) {
      console.warn('Firestore fast_track_questions listener error:', e);
    }
  }

  return () => {
    window.removeEventListener('beyond_fast_track_updated', handleLocal);
    if (fbUnsubscribe) fbUnsubscribe();
  };
}
