import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import { Lead } from '../data/demoLeads';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBny9_vnwzFmnzNknNWVIoM8vWZpFZ9f84',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'beyond-educations.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'beyond-educations',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'beyond-educations.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '562398922047',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:562398922047:web:86068b54ce632c3d937f8a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5WN9KQRTMB',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.length > 10
  );
};

// Initialize Firebase App
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

export { app, db, auth, analytics };

/**
 * Log analytical event to Google Analytics 4 (GA4) via Firebase
 */
export function fbLogEvent(eventName: string, params?: Record<string, any>) {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {
    // ignore
  }
}

// ==============================================================================
// Firestore CRUD & Real-Time Sync Operations
// ==============================================================================

/**
 * Save or update a student lead in Firestore ('leads' collection)
 */
export async function fbSaveLead(lead: Lead): Promise<{ success: boolean; error: any }> {
  if (!db) return { success: true, error: null };

  try {
    const leadRef = doc(db, 'leads', lead.id);
    await setDoc(
      leadRef,
      {
        ...lead,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, error: null };
  } catch (err) {
    console.warn('Firestore fbSaveLead error (cached locally):', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch all leads from Firestore ordered by creation date
 */
export async function fbGetLeads(): Promise<{ leads: Lead[]; isLive: boolean }> {
  if (!db) return { leads: [], isLive: false };

  try {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const leads: Lead[] = [];
    snapshot.forEach((docSnap) => {
      leads.push(docSnap.data() as Lead);
    });

    return { leads, isLive: true };
  } catch (err) {
    console.warn('Firestore fbGetLeads error (fallback to local cache):', err);
    return { leads: [], isLive: false };
  }
}

/**
 * Real-time listener for leads collection using Firestore onSnapshot
 */
export function fbSubscribeLeads(
  onUpdate: (leads: Lead[]) => void,
  onError?: (error: any) => void
): Unsubscribe | null {
  if (!db) return null;

  try {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const leads: Lead[] = [];
        snapshot.forEach((docSnap) => {
          leads.push(docSnap.data() as Lead);
        });
        onUpdate(leads);
      },
      (error) => {
        console.warn('Firestore realtime subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to attach Firestore realtime listener:', err);
    return null;
  }
}

/**
 * Update partial fields of a lead (status, internal notes, booking info)
 */
export async function fbUpdateLead(id: string, updates: Partial<Lead>): Promise<boolean> {
  if (!db) return true;

  try {
    const leadRef = doc(db, 'leads', id);
    await updateDoc(leadRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore fbUpdateLead error:', err);
    return false;
  }
}

/**
 * Delete a user lead from Firestore (DPDP Act privacy compliance)
 */
export async function fbDeleteUserData(phoneOrId: string): Promise<boolean> {
  if (!db) return true;

  try {
    // Delete by ID first
    const directDocRef = doc(db, 'leads', phoneOrId);
    await deleteDoc(directDocRef).catch(() => {});

    // Also query and delete matching phone numbers
    const leadsRef = collection(db, 'leads');
    const phoneQuery = query(leadsRef, where('phone', '==', phoneOrId));
    const phoneSnapshot = await getDocs(phoneQuery);

    const deletePromises = phoneSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);

    return true;
  } catch (err) {
    console.warn('Firestore fbDeleteUserData error:', err);
    return false;
  }
}

/**
 * Book a 1-on-1 counselling session in Firestore ('consultations' collection)
 */
export async function fbCreateConsultation(params: {
  leadId: string;
  studentName: string;
  phone: string;
  preferredDate: string;
  timeSlot: string;
  counsellingMode?: 'online' | 'in_person';
  notes?: string;
}): Promise<boolean> {
  if (!db) return true;

  try {
    const consultRef = collection(db, 'consultations');
    await addDoc(consultRef, {
      ...params,
      counsellingMode: params.counsellingMode || 'online',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore fbCreateConsultation error:', err);
    return false;
  }
}
