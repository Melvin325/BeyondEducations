import { FaqItem, INITIAL_FAQS } from '../data/testimonialsFaq';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'beyond_faqs_list';
const EVENT_NAME = 'beyond_faqs_changed';

/**
 * Retrieve cached FAQs synchronously from localStorage
 */
export function getLocalFaqs(): FaqItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    }
  } catch (e) {
    console.warn('Failed reading FAQs from localStorage', e);
  }
  // Initialize with initial FAQs
  saveLocalFaqs(INITIAL_FAQS);
  return INITIAL_FAQS;
}

/**
 * Persist FAQs to localStorage and dispatch change event
 */
export function saveLocalFaqs(faqs: FaqItem[]): void {
  try {
    const sorted = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: sorted }));
    }
  } catch (e) {
    console.error('Failed saving FAQs to localStorage', e);
  }
}

/**
 * Seed initial FAQs into Firestore collection
 */
export async function seedFaqsToFirestore(): Promise<boolean> {
  const firestore = db;
  if (!isFirebaseConfigured() || !firestore) return false;

  try {
    const batch = writeBatch(firestore);
    for (const faq of INITIAL_FAQS) {
      const docRef = doc(firestore, 'faqs', faq.id);
      batch.set(docRef, faq);
    }
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Failed seeding FAQs to Firestore:', e);
    return false;
  }
}

/**
 * Fetch FAQs asynchronously: tries Firestore first, falls back to localStorage
 */
export async function getFaqsAsync(): Promise<{ faqs: FaqItem[]; isLive: boolean }> {
  const firestore = db;
  if (!isFirebaseConfigured() || !firestore) {
    return { faqs: getLocalFaqs(), isLive: false };
  }

  try {
    const colRef = collection(firestore, 'faqs');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      await seedFaqsToFirestore();
      saveLocalFaqs(INITIAL_FAQS);
      return { faqs: INITIAL_FAQS, isLive: true };
    }

    const fetched: FaqItem[] = [];
    snapshot.forEach((docSnap) => {
      fetched.push(docSnap.data() as FaqItem);
    });

    const sorted = fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
    saveLocalFaqs(sorted);
    return { faqs: sorted, isLive: true };
  } catch (e) {
    console.warn('Failed fetching FAQs from Firestore, using localStorage:', e);
    return { faqs: getLocalFaqs(), isLive: false };
  }
}

/**
 * Save / Update a single FAQ (Create or Update)
 */
export async function saveFaq(faq: FaqItem): Promise<boolean> {
  const current = getLocalFaqs();
  const exists = current.some((f) => f.id === faq.id);
  const updatedList = exists
    ? current.map((f) => (f.id === faq.id ? faq : f))
    : [...current, faq];

  saveLocalFaqs(updatedList);

  const firestore = db;
  if (isFirebaseConfigured() && firestore) {
    try {
      const docRef = doc(firestore, 'faqs', faq.id);
      await setDoc(docRef, faq, { merge: true });
      return true;
    } catch (e) {
      console.warn('Firestore write failed for FAQ:', e);
    }
  }

  return true;
}

/**
 * Delete a single FAQ by ID
 */
export async function deleteFaq(faqId: string): Promise<boolean> {
  const current = getLocalFaqs();
  const updatedList = current.filter((f) => f.id !== faqId);
  saveLocalFaqs(updatedList);

  const firestore = db;
  if (isFirebaseConfigured() && firestore) {
    try {
      const docRef = doc(firestore, 'faqs', faqId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.warn('Firestore delete failed for FAQ:', e);
    }
  }

  return true;
}

/**
 * Reset FAQs to default list
 */
export async function resetFaqsToDefault(): Promise<FaqItem[]> {
  saveLocalFaqs(INITIAL_FAQS);

  const firestore = db;
  if (isFirebaseConfigured() && firestore) {
    try {
      const colRef = collection(firestore, 'faqs');
      const snap = await getDocs(colRef);
      const batch = writeBatch(firestore);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      await seedFaqsToFirestore();
    } catch (e) {
      console.warn('Firestore reset failed for FAQs:', e);
    }
  }

  return INITIAL_FAQS;
}

/**
 * Subscribe to real-time FAQ changes
 */
export function subscribeToFaqs(callback: (faqs: FaqItem[]) => void): () => void {
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<FaqItem[]>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_NAME, handleLocalEvent);
  }

  let unsubscribeFirestore: (() => void) | null = null;
  const firestore = db;
  if (isFirebaseConfigured() && firestore) {
    try {
      const colRef = collection(firestore, 'faqs');
      unsubscribeFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: FaqItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as FaqItem);
            });
            const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
            saveLocalFaqs(sorted);
            callback(sorted);
          }
        },
        (err) => {
          console.warn('Firestore FAQ snapshot error:', err);
        }
      );
    } catch (e) {
      console.warn('Error setting up onSnapshot for faqs:', e);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_NAME, handleLocalEvent);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
