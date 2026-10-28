import { BRAND_CONFIG } from '../config/brand';
import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface ContactSettings {
  whatsappNumber: string;
  callingPhone: string;
  admissionsEmail: string;
  officeAddress: string;
  counsellorWorkingHours: string;
  whatsappWelcomeMessage: string;
  counsellorStatus: 'online' | 'busy' | 'away';
  responseTimeText: string;
  quickPrompts: string[];
  updatedAt: string;
}

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  whatsappNumber: BRAND_CONFIG.PHONE || '+91 98450 12345',
  callingPhone: BRAND_CONFIG.PHONE || '+91 98450 12345',
  admissionsEmail: BRAND_CONFIG.EMAIL || 'admissions@beyondeducations.com',
  officeAddress: BRAND_CONFIG.ADDRESS || 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
  counsellorWorkingHours: '9:00 AM - 9:00 PM (Mon - Sun)',
  whatsappWelcomeMessage: 'Hi BeyondEducations, I would like admission counselling guidance.',
  counsellorStatus: 'online',
  responseTimeText: 'Replies in ~5 mins',
  quickPrompts: [
    '🎓 Direct UG Admissions (BTech / MBBS / BBA / Design)',
    '🏛️ MBA & PGDM Admissions (Bangalore & Kerala)',
    '✈️ Study Abroad (UK, Ireland, Germany, Australia)',
    '💰 Management Quota Fees & Scholarships',
  ],
  updatedAt: new Date().toISOString(),
};

const LOCAL_STORAGE_KEY = 'beyond_contact_settings';
const EVENT_NAME = 'beyond_contact_settings_changed';

/**
 * Format any phone string (e.g. "+91 98450 12345", "9845012345") into clean digits for wa.me URL
 */
export function cleanPhoneForWhatsApp(rawPhone: string): string {
  if (!rawPhone) return '919845012345';
  let digits = rawPhone.replace(/\D/g, '');
  // If user entered 10 digits without country code, prefix with 91 (India)
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Get synchronously from localStorage or default
 */
export function getLocalContactSettings(): ContactSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.whatsappNumber === 'string') {
        return {
          ...DEFAULT_CONTACT_SETTINGS,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.warn('Failed reading contact settings from localStorage', e);
  }
  return DEFAULT_CONTACT_SETTINGS;
}

/**
 * Save to localStorage and dispatch window event for instant reactivity
 */
export function saveLocalContactSettings(settings: ContactSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }));
    }
  } catch (e) {
    console.error('Failed saving contact settings to localStorage', e);
  }
}

/**
 * Fetch settings asynchronously from Firestore 'site_config/contact_settings' or fallback
 */
export async function getContactSettingsAsync(): Promise<{ settings: ContactSettings; isLive: boolean }> {
  if (!isFirebaseConfigured() || !db) {
    return { settings: getLocalContactSettings(), isLive: false };
  }

  try {
    const docRef = doc(db, 'site_config', 'contact_settings');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as ContactSettings;
      const merged: ContactSettings = {
        ...DEFAULT_CONTACT_SETTINGS,
        ...data,
      };
      saveLocalContactSettings(merged);
      return { settings: merged, isLive: true };
    } else {
      // Seed Firestore with default config
      const initial = getLocalContactSettings();
      await setDoc(docRef, initial);
      return { settings: initial, isLive: true };
    }
  } catch (e) {
    console.warn('Failed fetching contact settings from Firestore, using localStorage:', e);
    return { settings: getLocalContactSettings(), isLive: false };
  }
}

/**
 * Full CRUD Update: Saves to Firestore & localStorage
 */
export async function saveContactSettings(
  updated: ContactSettings
): Promise<{ success: boolean; isLive: boolean }> {
  const merged: ContactSettings = {
    ...updated,
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately cache locally
  saveLocalContactSettings(merged);

  // 2. Persist to Firestore if live
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'site_config', 'contact_settings');
      await setDoc(docRef, merged, { merge: true });
      return { success: true, isLive: true };
    } catch (e) {
      console.warn('Firestore write failed for contact settings:', e);
      return { success: true, isLive: false };
    }
  }

  return { success: true, isLive: false };
}

/**
 * Reset contact settings to brand default
 */
export async function resetContactSettings(): Promise<ContactSettings> {
  const resetData: ContactSettings = {
    ...DEFAULT_CONTACT_SETTINGS,
    updatedAt: new Date().toISOString(),
  };
  await saveContactSettings(resetData);
  return resetData;
}

/**
 * Real-time subscription to contact settings changes
 */
export function subscribeToContactSettings(
  callback: (settings: ContactSettings) => void
): () => void {
  // Listen for local tab events
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<ContactSettings>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_NAME, handleLocalEvent);
  }

  // If Firebase Firestore is active, listen to live document
  let unsubscribeFirestore: (() => void) | null = null;
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'site_config', 'contact_settings');
      unsubscribeFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ContactSettings;
            const merged = { ...DEFAULT_CONTACT_SETTINGS, ...data };
            saveLocalContactSettings(merged);
            callback(merged);
          }
        },
        (err) => {
          console.warn('Firestore subscription error for contact settings:', err);
        }
      );
    } catch (e) {
      console.warn('Error setting up onSnapshot for contact settings:', e);
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
