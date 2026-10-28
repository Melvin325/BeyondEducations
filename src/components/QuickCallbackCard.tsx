import React, { useState } from 'react';
import { saveLeadToCounsellorList } from '../lib/storage';
import { fbSaveLead } from '../lib/firebase';
import { Lead } from '../data/demoLeads';
import {
  getLocalContactSettings,
  cleanPhoneForWhatsApp,
} from '../lib/contactService';
import {
  PhoneCall,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickCallbackCardProps {
  onTakeQuiz?: () => void;
  defaultLevel?: string;
  defaultRegion?: string;
}

export const QuickCallbackCard: React.FC<QuickCallbackCardProps> = ({
  onTakeQuiz,
  defaultLevel = 'UG Students',
  defaultRegion = 'Karnataka (Bangalore)',
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [level, setLevel] = useState<string>(defaultLevel);
  const [region, setRegion] = useState<string>(defaultRegion);
  const [targetCourse, setTargetCourse] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    const leadId = `lead-home-${Date.now()}`;
    const newLead: Lead = {
      id: leadId,
      name: name.trim(),
      phone: cleanPhone,
      fillerType: 'Student',
      language: 'en',
      stream: targetCourse.trim() || `${level} in ${region}`,
      priority: 'Hot',
      status: 'New',
      leadScore: 13,
      dimensionScores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
      scoreBreakdown: {
        status12Score: 3,
        decisionTimeScore: 3,
        parentPhoneScore: 0,
        budgetScore: 2,
        worryScore: 2,
        completionScore: 2,
        total: 12,
      },
      createdAt: new Date().toISOString(),
      internalNotes: `⚡ 15-Sec Direct Callback Request from Home Page. Looking for: ${level} in ${region}. Course: ${targetCourse || 'Not specified'}.`,
    };

    try {
      // 1. Save to local storage
      saveLeadToCounsellorList(newLead);
      // 2. Push to Firestore
      await fbSaveLead(newLead);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      setIsSuccess(true);
    } catch (err) {
      console.warn('Error saving quick callback lead:', err);
      // Still show success to user since local cache succeeded
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppFollowUp = () => {
    const text = `Hi BeyondEducations, I just requested a callback on your website. My name is ${name}. I am looking for ${level} in ${region}.`;
    const contact = getLocalContactSettings();
    const cleanBrandPhone = cleanPhoneForWhatsApp(contact.whatsappNumber);
    window.open(`https://wa.me/${cleanBrandPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isSuccess) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-xl space-y-4 text-center animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#14305E]">Callback Requested!</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            Thank you, <strong>{name}</strong>. An expert counsellor will call your mobile (<strong>+91 {phone}</strong>) within 15 minutes.
          </p>
        </div>

        <div className="p-3 bg-[#F5F8FB] rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-[#1B7A9C]" />
          <span>Priority Assigned: <strong>Admissions Advisor Team</strong></span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleWhatsAppFollowUp}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Connect on WhatsApp Now</span>
          </button>

          {onTakeQuiz && (
            <button
              type="button"
              onClick={onTakeQuiz}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2A12B]" />
              <span>Take Free 6-Min Quiz in Parallel</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#14305E] via-[#1B7A9C] to-[#F2A12B]" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14305E] uppercase tracking-wider">
          <PhoneCall className="w-4 h-4 text-[#1B7A9C]" />
          <span>Need Instant Admissions Help?</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ~15 Min Callback
        </span>
      </div>

      <h3 className="text-xl font-extrabold text-[#14305E] leading-snug">
        Get a Free 1-on-1 Admissions Call
      </h3>
      <p className="text-xs text-slate-500 mt-1 mb-4">
        Direct seat availability, verified fee structures, and cutoffs across Bangalore, Kerala, Tamil Nadu &amp; Abroad.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
            {errorMsg}
          </div>
        )}

        {/* Name & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Student / Parent Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Suhas Rao"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]/30 focus:border-[#1B7A9C]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">WhatsApp / Mobile Number *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]/30 focus:border-[#1B7A9C]"
              />
            </div>
          </div>
        </div>

        {/* Level & Region Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Program Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
            >
              <option value="UG Students">UG (BTech, MBBS, BBA, Law, Design)</option>
              <option value="PG Students">PG (MBA, PGDM, MTech, MCA, MSc)</option>
              <option value="Study Abroad">Study Abroad (UK, EU, AUS, USA)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Preferred City / Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
            >
              <optgroup label="Karnataka">
                <option value="Karnataka (Bangalore)">Bengaluru / Bangalore</option>
                <option value="Mangalore & Manipal">Mangalore &amp; Manipal</option>
                <option value="Mysuru">Mysuru</option>
              </optgroup>
              <optgroup label="Tamil Nadu">
                <option value="Chennai">Chennai Hub</option>
                <option value="Coimbatore">Coimbatore Hub</option>
                <option value="Vellore & Trichy">Vellore &amp; Trichy</option>
                <option value="Tamil Nadu">Other Tamil Nadu Cities</option>
              </optgroup>
              <optgroup label="Kerala">
                <option value="Kochi / Ernakulam">Kochi / Ernakulam</option>
                <option value="Calicut / Kozhikode">Calicut / Kozhikode</option>
                <option value="Trivandrum">Trivandrum</option>
                <option value="Kerala">Other Kerala Cities</option>
              </optgroup>
              <optgroup label="Pan-India &amp; Global">
                <option value="Pan-India">Pan-India (NCR, Mumbai, Pune, Hyd)</option>
                <option value="Study Abroad">Study Abroad (UK, Ireland, Germany, etc.)</option>
                <option value="Others">Others / Not Sure</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Target Course (optional) */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Target Course or Specialization (Optional)</label>
          <input
            type="text"
            placeholder="e.g. BTech CSE / AI, MBA Business Analytics, MBBS, MS in UK"
            value={targetCourse}
            onChange={(e) => setTargetCourse(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <PhoneCall className="w-4 h-4 text-[#F2A12B]" />
          <span>{isSubmitting ? 'Sending Request...' : 'Request Free Callback'}</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Confidential · No Spam
          </span>
          <span>Zero Obligation</span>
        </div>
      </form>
    </div>
  );
};
