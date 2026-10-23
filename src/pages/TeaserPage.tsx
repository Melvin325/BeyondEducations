import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getStoredQuizAnswers,
  saveCurrentLead,
} from '../lib/storage';
import {
  evaluateQuiz,
  calculateLeadScore,
  QuizResult,
} from '../lib/scoring';
import { Lead } from '../data/demoLeads';
import { InterestRadarChart } from '../components/RadarChart';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeaserPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Lead Form States
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('Bengaluru');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [fillerType, setFillerType] = useState<'Student' | 'Parent'>('Student');
  const [consent, setConsent] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const answers = getStoredQuizAnswers();
    const evaluated = evaluateQuiz(answers);
    setResult(evaluated);

    // 2-second analyzing animation as per specification
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendOtp = () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setValidationError(t('teaser.validation_phone'));
      return;
    }
    setValidationError(null);
    setOtpSent(true);
  };

  const handleUnlockReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError(t('teaser.validation_name'));
      return;
    }

    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setValidationError(t('teaser.validation_phone'));
      return;
    }

    if (!otp || otp.trim().length !== 4) {
      setValidationError(t('teaser.validation_otp'));
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError(t('teaser.validation_email'));
      return;
    }

    if (!consent) {
      setValidationError(t('teaser.validation_consent'));
      return;
    }

    const answers = getStoredQuizAnswers();
    const { breakdown, totalScore, priority } = calculateLeadScore(answers, parentPhone);

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: name.trim(),
      phone: cleanedPhone,
      email: email.trim(),
      city: city.trim() || 'Bengaluru',
      parentPhone: parentPhone.trim() || undefined,
      fillerType,
      language: (i18n.language as any) || 'en',
      stream: answers.stream || 'Science (PCM)',
      budget: answers.budget || '3_8',
      percentage: answers.percentage || '75_90',
      entranceExams: answers.entranceExams || [],
      status12: answers.status12 || 'passed_out',
      decisionTime: answers.decisionTime || 'this_month',
      worry: answers.worry || 'course_choice',
      preferredLocation: answers.preferredLocation || 'bengaluru',
      relocate: answers.relocate || 'no',
      workPreference: answers.workPreference || 'team',
      careerValue: answers.careerValue || 'income',
      heavyMathsComfort: answers.heavyMathsComfort || 'somewhat',
      bestSubjects: answers.bestSubjects || [],
      riasecScores: result ? result.riasecScores : { R: 6, I: 8, A: 5, S: 7, E: 8, C: 6 },
      profileCode: result ? result.profileCode : 'IE',
      profileName: result ? t(result.profile.nameKey) : 'The Analytical Strategist',
      topCourses: result ? result.topCourses.map((c) => c.course.id) : [],
      scoreBreakdown: breakdown,
      leadScore: totalScore,
      priority,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    saveCurrentLead(newLead);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    navigate('/report');
  };

  // 1. Loading / Analyzing State (2 Seconds)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FB] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full space-y-6"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-[#1B7A9C]/20 border-t-[#14305E] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#F2A12B] animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-[#14305E]">
              {t('teaser.analysing_title')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('teaser.analysing_subtitle')}
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="bg-linear-to-r from-[#14305E] via-[#1B7A9C] to-[#F2A12B] h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-[#F5F8FB] py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Teaser Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('teaser.profile_ready')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14305E]">
            {t(result.profile.nameKey)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(result.profile.descriptionKey)}
          </p>
          <div className="pt-1">
            <span className="inline-block px-3 py-1 rounded-lg bg-[#14305E] text-[#F2A12B] font-mono font-bold text-xs tracking-wider">
              {t('teaser.profile_code_label')} {result.profileCode}
            </span>
          </div>
        </div>

        {/* Radar Chart Card (Fully Visible) */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-center">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              {t('teaser.radar_title')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('teaser.radar_subtitle')}
            </p>
          </div>
          <InterestRadarChart scores={result.riasecScores} />
        </div>

        {/* Locked Course Teasers (Blurred) */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {t('teaser.matches_found', { count: result.topCourses.length })}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked
            </span>
          </div>

          {/* Blurred Dummy Cards */}
          <div className="space-y-3 relative select-none">
            {result.topCourses.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between filter blur-[5px] opacity-60"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{item.course.abbr}</h4>
                  <p className="text-xs text-slate-500">Duration: {item.course.durationYears} Years</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg">₹₹₹ / yr</span>
              </div>
            ))}

            {/* Lock Overlay Banner */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#14305E] text-[#F2A12B] flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#14305E] max-w-xs">
                {t('teaser.unlock_banner')}
              </p>
            </div>
          </div>
        </div>

        {/* Lead Capture Form Card */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#1B7A9C]/30 shadow-lg space-y-5">
          <div className="space-y-1 text-center">
            <h3 className="text-lg font-bold text-[#14305E]">
              Unlock Your Full Personalised Guidance Report
            </h3>
            <p className="text-xs text-slate-500">
              Instant access on screen and mock WhatsApp delivery.
            </p>
          </div>

          <form onSubmit={handleUnlockReport} className="space-y-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('teaser.form_name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('teaser.form_name_placeholder')}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
              />
            </div>

            {/* Mobile & OTP row */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {t('teaser.form_phone')} *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={t('teaser.form_phone_placeholder')}
                    className="w-full pl-11 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3.5 py-2.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-bold rounded-xl whitespace-nowrap transition-all shadow-2xs"
                >
                  {otpSent ? t('teaser.form_otp_sent') : t('teaser.form_otp_btn')}
                </button>
              </div>

              {/* OTP Input with Demo Mode Hint */}
              {otpSent && (
                <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900">
                      {t('teaser.form_otp_label')} *
                    </label>
                    <span className="text-[11px] font-bold text-[#1B7A9C] bg-white px-2 py-0.5 rounded-full border border-[#1B7A9C]/30">
                      {t('teaser.form_otp_hint')}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 text-center tracking-widest text-base font-bold bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-[#F2A12B] focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Email & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('teaser.form_email')} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('teaser.form_email_placeholder')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('teaser.form_city')} *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('teaser.form_city_placeholder')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Optional Parent Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('teaser.form_parent_phone')}
              </label>
              <input
                type="tel"
                maxLength={10}
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={t('teaser.form_parent_phone_placeholder')}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {t('teaser.form_parent_phone_helper')}
              </p>
            </div>

            {/* Who is completing this form: Student / Parent */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('teaser.form_filler_label')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFillerType('Student')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    fillerType === 'Student'
                      ? 'bg-[#14305E] text-white border-[#14305E]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {t('teaser.form_filler_student')}
                </button>
                <button
                  type="button"
                  onClick={() => setFillerType('Parent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    fillerType === 'Parent'
                      ? 'bg-[#14305E] text-white border-[#14305E]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {t('teaser.form_filler_parent')}
                </button>
              </div>
            </div>

            {/* Required Consent Checkbox */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-snug">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#14305E] rounded-sm focus:ring-[#1B7A9C]"
                />
                <span>{t('teaser.form_consent')}</span>
              </label>
            </div>

            {/* Error Message */}
            {validationError && (
              <p className="text-xs text-rose-600 font-semibold text-center animate-shake">
                {validationError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#14305E] hover:bg-[#1B7A9C] text-white font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#F2A12B]" />
              <span>{t('teaser.submit_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
