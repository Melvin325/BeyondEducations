import { College, INITIAL_COLLEGES } from '../data/colleges';
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

const LOCAL_STORAGE_KEY = 'beyond_colleges_list';

/**
 * Retrieve cached colleges synchronously from localStorage
 */
export function getLocalColleges(): College[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const hasSampleData = parsed.some((c: College) => c.name.toLowerCase().includes('sample'));
      if (Array.isArray(parsed) && parsed.length > 0 && !hasSampleData) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading colleges from localStorage', e);
  }
  // Initialize with initial colleges
  saveLocalColleges(INITIAL_COLLEGES);
  return INITIAL_COLLEGES;
}

/**
 * Persist colleges to localStorage
 */
export function saveLocalColleges(colleges: College[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(colleges));
  } catch (e) {
    console.error('Failed saving colleges to localStorage', e);
  }
}

/**
 * Fetch colleges asynchronously: tries Firestore first, falls back to localStorage
 */
export async function getCollegesAsync(): Promise<{ colleges: College[]; isLive: boolean }> {
  if (!isFirebaseConfigured() || !db) {
    return { colleges: getLocalColleges(), isLive: false };
  }

  try {
    const colRef = collection(db, 'colleges');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // Seed Firestore with INITIAL_COLLEGES
      const local = getLocalColleges();
      await seedCollegesToFirestore(local);
      return { colleges: local, isLive: true };
    }

    const fetched: College[] = [];
    snapshot.forEach((d) => {
      fetched.push(d.data() as College);
    });

    saveLocalColleges(fetched);
    return { colleges: fetched, isLive: true };
  } catch (err) {
    console.warn('Firestore getCollegesAsync error, using local fallback:', err);
    return { colleges: getLocalColleges(), isLive: false };
  }
}

/**
 * Real-time subscription to colleges in Firestore
 */
export function subscribeToColleges(
  onUpdate: (colleges: College[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured() || !db) {
    onUpdate(getLocalColleges());
    return null;
  }

  try {
    const colRef = collection(db, 'colleges');
    const unsubscribe = onSnapshot(
      query(colRef),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: College[] = [];
          snapshot.forEach((d) => list.push(d.data() as College));
          saveLocalColleges(list);
          onUpdate(list);
        } else {
          onUpdate(getLocalColleges());
        }
      },
      (error) => {
        console.warn('Colleges snapshot subscription warning:', error);
        onUpdate(getLocalColleges());
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed subscribing to colleges collection:', err);
    onUpdate(getLocalColleges());
    return null;
  }
}

/**
 * Add or update a college
 */
export async function saveCollege(college: College): Promise<{ success: boolean; error?: any }> {
  // Update local cache
  const current = getLocalColleges();
  const existingIdx = current.findIndex((c) => c.id === college.id);
  let updatedList: College[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = college;
  } else {
    updatedList = [college, ...current];
  }
  saveLocalColleges(updatedList);

  // Sync to Firestore
  if (isFirebaseConfigured() && db) {
    try {
      const colDoc = doc(db, 'colleges', college.id);
      await setDoc(colDoc, college, { merge: true });
      return { success: true };
    } catch (err) {
      console.warn('Firestore saveCollege error:', err);
      return { success: false, error: err };
    }
  }

  return { success: true };
}

/**
 * Delete a college by ID
 */
export async function deleteCollege(collegeId: string): Promise<boolean> {
  const current = getLocalColleges();
  const filtered = current.filter((c) => c.id !== collegeId);
  saveLocalColleges(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      const colDoc = doc(db, 'colleges', collegeId);
      await deleteDoc(colDoc);
      return true;
    } catch (err) {
      console.warn('Firestore deleteCollege error:', err);
      return false;
    }
  }

  return true;
}

/**
 * Reset colleges list back to default INITIAL_COLLEGES
 */
export async function resetCollegesToDefault(): Promise<College[]> {
  saveLocalColleges(INITIAL_COLLEGES);

  if (isFirebaseConfigured() && db) {
    try {
      await seedCollegesToFirestore(INITIAL_COLLEGES);
    } catch (e) {
      console.warn('Failed resetting colleges in Firestore', e);
    }
  }

  return INITIAL_COLLEGES;
}

/**
 * Seed colleges batch to Firestore
 */
async function seedCollegesToFirestore(list: College[]): Promise<void> {
  const firestore = db;
  if (!firestore) return;
  const batch = writeBatch(firestore);
  for (const col of list) {
    const ref = doc(firestore, 'colleges', col.id);
    batch.set(ref, col);
  }
  await batch.commit();
}
