import { QuizAnswers } from './scoring';
import { Lead, DEMO_LEADS } from '../data/demoLeads';

const STORAGE_KEYS = {
  LANGUAGE: 'beyond_lang',
  QUIZ_ANSWERS: 'beyond_quiz_answers',
  QUIZ_STEP: 'beyond_quiz_step',
  CURRENT_LEAD: 'beyond_current_lead',
  COUNSELLOR_LEADS: 'beyond_counsellor_leads',
  ANALYTICS_QUIZ_STARTED: 'beyond_analytics_quiz_started',
};

// Language persistence
export function getStoredLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  } catch {
    return 'en';
  }
}

export function setStoredLanguage(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Failed to save language', e);
  }
}

// Quiz progress persistence
export function getStoredQuizAnswers(): QuizAnswers {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_ANSWERS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveQuizAnswers(answers: QuizAnswers): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save quiz answers', e);
  }
}

export function getStoredQuizStep(): number {
  try {
    const step = localStorage.getItem(STORAGE_KEYS.QUIZ_STEP);
    return step ? parseInt(step, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveQuizStep(step: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_STEP, step.toString());
  } catch (e) {
    console.error('Failed to save quiz step', e);
  }
}

export function clearQuizProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STEP);
  } catch (e) {
    console.error('Failed to clear quiz progress', e);
  }
}

// Current student lead persistence
export function getStoredCurrentLead(): Lead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_LEAD);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentLead(lead: Lead): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LEAD, JSON.stringify(lead));
    // Also push to counsellor leads list
    saveLeadToCounsellorList(lead);
  } catch (e) {
    console.error('Failed to save current lead', e);
  }
}

// Counsellor leads database
export function getCounsellorLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNSELLOR_LEADS);
    if (!raw) {
      // Initialize with demo leads
      localStorage.setItem(STORAGE_KEYS.COUNSELLOR_LEADS, JSON.stringify(DEMO_LEADS));
      return DEMO_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_LEADS;
  }
}

export function saveLeadToCounsellorList(newLead: Lead): void {
  try {
    const list = getCounsellorLeads();
    const index = list.findIndex((l) => l.id === newLead.id || l.phone === newLead.phone);
    let updated: Lead[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...newLead };
    } else {
      updated = [newLead, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.COUNSELLOR_LEADS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to counsellor leads', e);
  }
}

export function updateLeadInCounsellorList(id: string, updates: Partial<Lead>): void {
  try {
    const list = getCounsellorLeads();
    const updated = list.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead));
    localStorage.setItem(STORAGE_KEYS.COUNSELLOR_LEADS, JSON.stringify(updated));

    // Update current lead if matching
    const current = getStoredCurrentLead();
    if (current && current.id === id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LEAD, JSON.stringify({ ...current, ...updates }));
    }
  } catch (e) {
    console.error('Failed to update lead', e);
  }
}

export function resetDemoLeads(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COUNSELLOR_LEADS, JSON.stringify(DEMO_LEADS));
  } catch (e) {
    console.error('Failed to reset demo leads', e);
  }
}

// "Delete my data" DPDP Act privacy compliance
export function deleteUserData(): void {
  try {
    const current = getStoredCurrentLead();
    if (current) {
      // Remove from leads
      const list = getCounsellorLeads().filter((l) => l.id !== current.id && l.phone !== current.phone);
      localStorage.setItem(STORAGE_KEYS.COUNSELLOR_LEADS, JSON.stringify(list));
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LEAD);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STEP);
  } catch (e) {
    console.error('Failed to delete user data', e);
  }
}
