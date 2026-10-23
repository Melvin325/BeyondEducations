import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_QUESTIONS, Question } from '../data/questions';
import {
  getStoredQuizAnswers,
  saveQuizAnswers,
  getStoredQuizStep,
  saveQuizStep,
} from '../lib/storage';
import { QuizAnswers } from '../lib/scoring';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Info,
  Globe,
  RotateCcw,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'ml', label: 'മലയാളം' },
] as const;

export const QuizPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Restore step and answers from localStorage
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = getStoredQuizStep();
    return saved >= 0 && saved < QUIZ_QUESTIONS.length ? saved : 0;
  });

  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    return getStoredQuizAnswers();
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveQuizStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    saveQuizAnswers(answers);
  }, [answers]);

  const question: Question = QUIZ_QUESTIONS[currentStep];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = Math.round(((currentStep + 1) / totalQuestions) * 100);

  // Helper for answering rating questions (Part A)
  const handleRatingAnswer = (ratingValue: number) => {
    const updated = { ...answers, [question.id]: ratingValue };
    setAnswers(updated);
    setErrorMsg(null);

    // Auto advance smoothly on rating
    setTimeout(() => {
      goToNextStep(updated);
    }, 180);
  };

  // Helper for single choice
  const handleSingleAnswer = (val: string) => {
    let updated: QuizAnswers;
    if (question.id === 14) updated = { ...answers, workPreference: val, [question.id]: val };
    else if (question.id === 15) updated = { ...answers, careerValue: val, [question.id]: val };
    else if (question.id === 16) updated = { ...answers, heavyMathsComfort: val, [question.id]: val };
    else if (question.id === 17) updated = { ...answers, stream: val, [question.id]: val };
    else if (question.id === 18) updated = { ...answers, status12: val, [question.id]: val };
    else if (question.id === 20) updated = { ...answers, budget: val, [question.id]: val };
    else if (question.id === 22) updated = { ...answers, worry: val, [question.id]: val };
    else if (question.id === 23) updated = { ...answers, decisionTime: val, [question.id]: val };
    else updated = { ...answers, [question.id]: val };

    setAnswers(updated);
    setErrorMsg(null);

    // Auto advance
    setTimeout(() => {
      goToNextStep(updated);
    }, 180);
  };

  // Helper for multi-select (Q13 subjects)
  const handleMultiToggle = (val: string) => {
    const currentList: string[] = answers.bestSubjects || [];
    let updatedList: string[];
    if (currentList.includes(val)) {
      updatedList = currentList.filter((s) => s !== val);
    } else {
      updatedList = [...currentList, val];
    }
    setAnswers({ ...answers, bestSubjects: updatedList, [question.id]: updatedList });
    setErrorMsg(null);
  };

  // Helper for compound questions (Q19: percentage + entranceExams; Q21: location + relocate)
  const handleCompoundSingle = (fieldKey: string, val: string) => {
    setAnswers({ ...answers, [fieldKey]: val });
    setErrorMsg(null);
  };

  const handleCompoundMulti = (fieldKey: string, val: string) => {
    const currentList: string[] = (answers as any)[fieldKey] || [];
    let updatedList: string[];
    if (val === 'None') {
      updatedList = currentList.includes('None') ? [] : ['None'];
    } else {
      const filtered = currentList.filter((x) => x !== 'None');
      if (filtered.includes(val)) {
        updatedList = filtered.filter((x) => x !== val);
      } else {
        updatedList = [...filtered, val];
      }
    }
    setAnswers({ ...answers, [fieldKey]: updatedList });
    setErrorMsg(null);
  };

  // Validation before advancing
  const isQuestionAnswered = (currentAnswers: QuizAnswers): boolean => {
    if (question.part === 'A') {
      return Boolean(currentAnswers[question.id]);
    }
    if (question.id === 13) {
      return Boolean(currentAnswers.bestSubjects && currentAnswers.bestSubjects.length > 0);
    }
    if (question.id === 19) {
      return Boolean(currentAnswers.percentage && currentAnswers.entranceExams && currentAnswers.entranceExams.length > 0);
    }
    if (question.id === 21) {
      return Boolean(currentAnswers.preferredLocation && currentAnswers.relocate);
    }
    return Boolean(currentAnswers[question.id] || (currentAnswers as any)[question.id]);
  };

  const goToNextStep = (currentAnswers: QuizAnswers = answers) => {
    if (!isQuestionAnswered(currentAnswers)) {
      setErrorMsg('Please select an option to continue.');
      return;
    }

    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
      setErrorMsg(null);
    } else {
      // Quiz Complete -> Go to Teaser
      navigate('/teaser');
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrorMsg(null);
    } else {
      navigate('/');
    }
  };

  // Get current answer value
  const currentRatingValue = answers[question.id] ? Number(answers[question.id]) : null;

  return (
    <div className="min-h-screen bg-[#F5F8FB] flex flex-col justify-between">
      {/* Top Progress & Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPrevStep}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#14305E] px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('questions.back')}</span>
          </button>

          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {question.part === 'A'
                ? t('questions.progress_part_a')
                : question.part === 'B'
                ? t('questions.progress_part_b')
                : t('questions.progress_part_c')}
            </span>
            <span className="text-xs font-extrabold text-[#14305E]">
              Question {currentStep + 1} of {totalQuestions}
            </span>
          </div>

          <span className="text-xs font-bold text-[#1B7A9C] px-2 py-1 bg-[#1B7A9C]/10 rounded-full">
            {progressPercent}%
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-linear-to-r from-[#1B7A9C] to-[#F2A12B] h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Container */}
      <div className="max-w-xl w-full mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        {/* Language switcher chip on first question */}
        {currentStep === 0 && (
          <div className="mb-4 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Globe className="w-4 h-4 text-[#1B7A9C]" />
              <span>Choose your preferred language:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    i18n.language === lang.code
                      ? 'bg-[#14305E] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Part C Banner if Question 17 */}
        {question.part === 'C' && question.subtitleKey && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs font-medium text-amber-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#F2A12B] flex-shrink-0" />
            <span>{t(question.subtitleKey)}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-md flex flex-col justify-between space-y-6"
          >
            {/* Question Title */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#1B7A9C] tracking-wide uppercase">
                Q{question.id}.
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {t(question.titleKey)}
              </h2>
              {question.subtitleKey && question.part !== 'C' && (
                <p className="text-xs text-slate-500">
                  {t(question.subtitleKey)}
                </p>
              )}
            </div>

            {/* PART A: 1 to 5 Rating scale buttons */}
            {question.part === 'A' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = currentRatingValue === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleRatingAnswer(val)}
                        className={`h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-extrabold text-base sm:text-lg border transition-all duration-150 active:scale-95 ${
                          isSelected
                            ? 'bg-[#14305E] text-white border-[#14305E] shadow-md ring-2 ring-[#1B7A9C]/40'
                            : 'bg-[#F5F8FB] text-slate-700 border-slate-200 hover:border-[#1B7A9C] hover:bg-white'
                        }`}
                      >
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Rating Scale Labels */}
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-1">
                  <span>{t('questions.scale_not_me')} (1)</span>
                  <span>{t('questions.scale_neutral')} (3)</span>
                  <span>{t('questions.scale_very_me')} (5)</span>
                </div>
              </div>
            )}

            {/* PART B: Multi-select Subjects (Q13) */}
            {question.id === 13 && question.options && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {question.options.map((opt) => {
                    const selected = (answers.bestSubjects || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleMultiToggle(opt.value)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-[#14305E] text-white border-[#14305E] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t(opt.labelKey)}</span>
                        {selected && <Check className="w-4 h-4 text-[#F2A12B]" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 text-right">
                  Selected: {(answers.bestSubjects || []).length} subjects
                </p>
              </div>
            )}

            {/* Single Choice Options (Q14, Q15, Q16, Q17, Q18, Q20, Q22, Q23) */}
            {question.type === 'single' && question.options && (
              <div className="space-y-2.5 pt-1">
                {question.options.map((opt) => {
                  const currentValue =
                    question.id === 14
                      ? answers.workPreference
                      : question.id === 15
                      ? answers.careerValue
                      : question.id === 16
                      ? answers.heavyMathsComfort
                      : question.id === 17
                      ? answers.stream
                      : question.id === 18
                      ? answers.status12
                      : question.id === 20
                      ? answers.budget
                      : question.id === 22
                      ? answers.worry
                      : question.id === 23
                      ? answers.decisionTime
                      : answers[question.id];

                  const isSelected = currentValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSingleAnswer(opt.value)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-150 active:scale-98 ${
                        isSelected
                          ? 'bg-[#14305E] text-white border-[#14305E] shadow-sm ring-1 ring-[#1B7A9C]/40'
                          : 'bg-[#F5F8FB] text-slate-700 border-slate-200 hover:bg-white hover:border-[#1B7A9C]'
                      }`}
                    >
                      <span>{t(opt.labelKey)}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#F2A12B] text-[#14305E] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Compound Question Q19 (Percentage + Entrance Exams) */}
            {question.id === 19 && question.subFields && (
              <div className="space-y-5 pt-1">
                {/* Field 1: Percentage */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t(question.subFields[0].labelKey)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {question.subFields[0].options.map((opt) => {
                      const selected = answers.percentage === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleCompoundSingle('percentage', opt.value)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            selected
                              ? 'bg-[#14305E] text-white border-[#14305E]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 2: Entrance Exams */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t(question.subFields[1].labelKey)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {question.subFields[1].options.map((opt) => {
                      const list: string[] = answers.entranceExams || [];
                      const selected = list.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleCompoundMulti('entranceExams', opt.value)}
                          className={`p-2 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-all ${
                            selected
                              ? 'bg-[#1B7A9C] text-white border-[#1B7A9C]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{t(opt.labelKey)}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-[#F2A12B]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Compound Question Q21 (Location + Relocation) */}
            {question.id === 21 && question.subFields && (
              <div className="space-y-5 pt-1">
                {/* Field 1: Preferred Location */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t(question.subFields[0].labelKey)}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.subFields[0].options.map((opt) => {
                      const selected = answers.preferredLocation === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleCompoundSingle('preferredLocation', opt.value)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                            selected
                              ? 'bg-[#14305E] text-white border-[#14305E]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 2: Willing to relocate */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t(question.subFields[1].labelKey)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {question.subFields[1].options.map((opt) => {
                      const selected = answers.relocate === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleCompoundSingle('relocate', opt.value)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            selected
                              ? 'bg-[#1B7A9C] text-white border-[#1B7A9C]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold text-center animate-shake">
                {errorMsg}
              </p>
            )}

            {/* Bottom Actions for multi-select / compound questions */}
            {(question.type === 'multi' || question.type === 'compound') && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => goToNextStep()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>{currentStep === totalQuestions - 1 ? t('questions.finish') : t('questions.next')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Bar */}
      <div className="py-4 text-center text-xs text-slate-400">
        BeyondEducations · {t('disclaimer.footer_note')}
      </div>
    </div>
  );
};
