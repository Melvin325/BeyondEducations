import React, { useState, useEffect } from 'react';
import {
  FastTrackQuestion,
  getLocalFastTrackQuestions,
  subscribeToFastTrackQuestions,
} from '../lib/fastTrackService';
import { saveCurrentLead } from '../lib/storage';
import { Lead } from '../data/demoLeads';
import { getLocalContactSettings, cleanPhoneForWhatsApp } from '../lib/contactService';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  Globe2,
  Sparkles,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  MessageCircle,
} from 'lucide-react';

interface FastTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'pg' | 'abroad';
}

export const FastTrackModal: React.FC<FastTrackModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const [questions, setQuestions] = useState<FastTrackQuestion[]>(() =>
    getLocalFastTrackQuestions(category)
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Lead details at final step
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToFastTrackQuestions((all) => {
      const filtered = all
        .filter((q) => q.category === category && q.active !== false)
        .sort((a, b) => a.order - b.order);
      setQuestions(filtered);
    });
    return () => unsub();
  }, [category]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      const q = getLocalFastTrackQuestions(category);
      setQuestions(q);
      setCurrentStep(0);
      setAnswers({});
      setName('');
      setPhone('');
      setCity('');
      setParentPhone('');
      setFormError(null);
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const totalSteps = questions.length + 1; // +1 for the lead contact form
  const isLeadStep = currentStep === questions.length;
  const currentQuestion = questions[currentStep];

  const handleSelectOption = (value: string) => {
    if (!currentQuestion) return;
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);

    // Smooth auto-advance
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }, 180);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build lead object
      const leadId = `lead-${category}-${Date.now()}`;
      const streamLabel =
        category === 'pg'
          ? `PG (${answers['pg-2'] || answers['pg-1'] || 'Masters'})`
          : `Study Abroad (${answers['abroad-1'] || 'International'})`;

      const summaryNotes = questions
        .map((q) => `${q.title}: ${answers[q.id] || 'Not answered'}`)
        .join(' | ');

      const newLead: Lead = {
        id: leadId,
        name: name.trim(),
        phone: cleanPhone,
        city: city.trim() || 'Bengaluru',
        parentPhone: parentPhone ? parentPhone.replace(/\D/g, '') : undefined,
        fillerType: 'Student',
        language: 'en',
        stream: streamLabel,
        budget: category === 'pg' ? answers['pg-5'] : '15L - 25L',
        status12: category === 'pg' ? 'UG Graduate' : 'Passport Ready',
        preferredLocation: category === 'pg' ? answers['pg-4'] : answers['abroad-1'],
        leadScore: 12,
        priority: 'Hot',
        status: 'New',
        notes: `[Fast-Track ${category.toUpperCase()}] ${summaryNotes}`,
        createdAt: new Date().toISOString(),
      };

      // Save into storage & async sync to Firestore leads collection
      saveCurrentLead(newLead);

      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit lead:', err);
      setFormError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppFollowup = () => {
    const contact = getLocalContactSettings();
    const cleanWhatsApp = cleanPhoneForWhatsApp(contact.whatsappNumber);
    const msg =
      category === 'pg'
        ? `Hi BeyondEducations, I just submitted my PG details for ${answers['pg-2'] || 'Masters'}. Please share college fee structures and cutoffs.`
        : `Hi BeyondEducations, I just submitted my Study Abroad profile for ${answers['abroad-1'] || 'Global Univs'}. Please connect me with your international counsellor.`;

    window.open(`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(msg)}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#14305E] to-[#1B7A9C] text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[#F2A12B]">
              {category === 'pg' ? (
                <Building className="w-5 h-5 text-[#F2A12B]" />
              ) : (
                <Globe2 className="w-5 h-5 text-[#F2A12B]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F2A12B]">
                  {category === 'pg' ? 'Masters & MBA Fast-Track' : 'Study Abroad Fast-Track'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  ~90 secs
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {category === 'pg' ? 'Postgraduate (PG) Matcher' : 'Global University Matcher'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-gradient-to-r from-[#1B7A9C] to-[#F2A12B] h-1.5 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            /* SUCCESS STATE */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-[#14305E]">
                  Profile Submitted Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong>{name}</strong>. Our senior {category === 'pg' ? 'PG Admissions Specialist' : 'Study Abroad Advisor'} is reviewing your profile and will call you shortly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F8FB] border border-slate-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold">Category:</span>
                  <span className="font-bold text-[#14305E]">
                    {category === 'pg' ? 'Postgraduate (MBA/MTech/MCA)' : 'Study Abroad (Global Univs)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold">Contact Mobile:</span>
                  <span className="font-bold text-slate-900">+91 {phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold">Target Hub:</span>
                  <span className="font-bold text-[#1B7A9C]">
                    {category === 'pg' ? answers['pg-4'] || 'Bengaluru' : answers['abroad-1'] || 'UK/Ireland'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={openWhatsAppFollowup}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Connect Instantly on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : isLeadStep ? (
            /* FINAL STEP: CONTACT DETAILS */
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#1B7A9C] uppercase tracking-wider">
                  Final Step • Almost Done
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  Where should we send your eligible college list &amp; fee structures?
                </h4>
                <p className="text-xs text-slate-500">
                  No spam. Our counselling advisor will share verified fee breakups via WhatsApp.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 text-xs font-bold">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9845012345"
                      className="w-full pl-16 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bangalore / Kochi"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent's Mobile <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Optional contact"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Get College Options</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F2A12B]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* QUESTION STEPS */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#1B7A9C] bg-[#1B7A9C]/10 px-2 py-0.5 rounded-md uppercase">
                  Question {currentStep + 1} of {questions.length}
                </span>
                <span className="text-[11px] text-slate-400">
                  {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.title}
                </h4>
                {currentQuestion.subtitle && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full p-3.5 text-left rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-[#14305E] bg-[#14305E]/5 text-[#14305E] font-bold ring-2 ring-[#14305E]/10'
                          : 'border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-[#1B7A9C]/40 text-slate-800'
                      }`}
                    >
                      <span className="pr-2">{opt.label}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#14305E] bg-[#14305E] text-white'
                            : 'border-slate-300 group-hover:border-[#1B7A9C]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Back button */}
              {currentStep > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Previous Question</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
