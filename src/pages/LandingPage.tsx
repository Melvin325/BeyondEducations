import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { COUNSELLORS, TESTIMONIALS, FAQS } from '../data/testimonialsFaq';
import { BRAND_CONFIG } from '../config/brand';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  FileText,
  Star,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FB]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Subtle decorative background blur blobs */}
        <div className="absolute top-0 right-10 -z-10 w-72 h-72 bg-[#1B7A9C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-5 -z-10 w-80 h-80 bg-[#F2A12B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 text-left space-y-4 sm:space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-[#14305E] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F2A12B] animate-pulse" />
              <span>{t('landing.badge')}</span>
              <span className="text-slate-400">·</span>
              <span className="text-[#1B7A9C]">{BRAND_CONFIG.CITY}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#14305E] tracking-tight leading-[1.15]">
              {t('landing.hero_title')}{' '}
              <span className="text-[#1B7A9C] block sm:inline">
                {t('landing.hero_highlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              {t('landing.hero_subtitle')}
            </p>

            {/* CTA & Trust badges */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#F2A12B]" />
                <span>{t('landing.cta_primary')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-200 transition-all shadow-2xs"
              >
                <span>{t('landing.cta_secondary')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1B7A9C]" />
                <span>Takes ~6 mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>No login required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F2A12B]" />
                <span>Guidance, not a verdict</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Right: Friendly Brand SVG Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 relative">
              {/* Floating Stat Chip */}
              <div className="absolute -top-3 -right-2 sm:-right-3 bg-[#14305E] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Bengaluru & Karnataka</span>
              </div>

              {/* Custom SVG Illustration in Brand Colors */}
              <svg viewBox="0 0 360 280" className="w-full h-auto drop-shadow-sm select-none" fill="none">
                {/* Background decorative geometric shapes */}
                <circle cx="180" cy="140" r="110" fill="#F5F8FB" />
                <circle cx="70" cy="60" r="28" fill="#1B7A9C" fillOpacity="0.1" />
                <circle cx="290" cy="220" r="38" fill="#F2A12B" fillOpacity="0.12" />

                {/* Desk & Laptop Base */}
                <rect x="60" y="210" width="240" height="12" rx="6" fill="#14305E" />
                <path d="M110 210 L130 150 L230 150 L250 210 Z" fill="#E2E8F0" />
                <rect x="135" y="152" width="90" height="54" rx="4" fill="#14305E" />
                <rect x="142" y="158" width="76" height="42" rx="2" fill="#FFFFFF" />

                {/* Screen content: Mini RIASEC Radar & Course Cards */}
                <polygon points="180,163 198,172 195,190 180,195 165,190 162,172" fill="#1B7A9C" fillOpacity="0.3" stroke="#1B7A9C" strokeWidth="1.5" />
                <circle cx="180" cy="179" r="2" fill="#F2A12B" />

                {/* Student Character: Head & Hair */}
                <circle cx="180" cy="95" r="32" fill="#FED7AA" />
                <path d="M152 85 C152 65, 208 65, 208 85 C208 88, 200 78, 180 78 C160 78, 152 88, 152 85 Z" fill="#14305E" />
                {/* Smile & Eyes */}
                <circle cx="172" cy="94" r="3" fill="#14305E" />
                <circle cx="188" cy="94" r="3" fill="#14305E" />
                <path d="M174 105 Q180 112 186 105" stroke="#14305E" strokeWidth="2" strokeLinecap="round" />

                {/* Torso with Teal Hoodie */}
                <path d="M145 130 C145 125, 215 125, 215 130 L225 180 L135 180 Z" fill="#1B7A9C" />
                {/* Upward Growth Arrow floating */}
                <g transform="translate(245, 60)">
                  <circle cx="20" cy="20" r="22" fill="#F2A12B" />
                  <path d="M14 26 L26 14 M26 14 H18 M26 14 V22" stroke="#14305E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* Student Books / Degree Scroll */}
                <rect x="68" y="180" width="38" height="10" rx="3" fill="#14305E" />
                <rect x="65" y="190" width="44" height="10" rx="3" fill="#F2A12B" />
                <rect x="62" y="200" width="50" height="10" rx="3" fill="#1B7A9C" />
              </svg>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">12th Standard Students</span>
                <span className="text-[#1B7A9C] font-bold">Science · Commerce · Arts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14305E] tracking-tight">
            {t('landing.how_it_works_title')}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {t('landing.how_it_works_subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#F5F8FB] border border-slate-200 relative group hover:border-[#1B7A9C]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#14305E] text-[#F2A12B] font-extrabold flex items-center justify-center text-sm mb-4 shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1B7A9C]" />
                {t('landing.step1_title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.step1_desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#F5F8FB] border border-slate-200 relative group hover:border-[#1B7A9C]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#1B7A9C] text-white font-extrabold flex items-center justify-center text-sm mb-4 shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#F2A12B]" />
                {t('landing.step2_title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.step2_desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#F5F8FB] border border-slate-200 relative group hover:border-[#1B7A9C]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F2A12B] text-[#14305E] font-extrabold flex items-center justify-center text-sm mb-4 shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#14305E]" />
                {t('landing.step3_title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.step3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION: COUNSELLORS & TESTIMONIALS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-12">
        {/* Counsellor Advisors */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B7A9C] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>{t('landing.stats_students')}</span>
            <span className="text-slate-400">({t('landing.stats_sample')})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14305E]">
            {t('landing.trust_title')}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            {t('landing.trust_subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left">
            {COUNSELLORS.map((c, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-[#14305E] text-[#F2A12B] font-bold flex items-center justify-center text-sm shadow-xs">
                    {c.avatarText}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                    <p className="text-xs text-[#1B7A9C] font-medium">{c.role}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="font-semibold text-slate-700">{c.experience}</p>
                  <p className="text-slate-500">{c.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Testimonials labelled 'Sample' */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#14305E]">
              What students & parents in Bengaluru say
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {t('landing.sample_badge')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between relative"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t(test.quoteKey)}"
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-900 block">{test.studentName}</span>
                  <span className="text-slate-500 block">{test.city}</span>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-[#1B7A9C] bg-[#1B7A9C]/10 px-2 py-0.5 rounded-md">
                    Target: {test.courseSelected}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MINI FAQ SECTION */}
      <section className="py-12 bg-white border-t border-slate-200 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-[#14305E]">
              {t('landing.faq_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('landing.faq_subtitle')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {FAQS.map((faq) => (
              <details
                key={faq.id}
                className="group p-4 rounded-xl bg-[#F5F8FB] border border-slate-200/80 open:bg-white open:ring-1 open:ring-[#1B7A9C]/30 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer font-bold text-xs sm:text-sm text-slate-800 list-none">
                  <span>{t(faq.questionKey)}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="pt-2 text-xs text-slate-600 leading-relaxed">
                  {t(faq.answerKey)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 sm:hidden shadow-lg flex items-center justify-between gap-3">
        <div className="text-left">
          <span className="text-[11px] font-bold text-slate-500 block">Free Assessment</span>
          <span className="text-xs font-extrabold text-[#14305E]">~6 mins · 3-5 courses</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="px-5 py-2.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F2A12B]" />
          <span>{t('landing.sticky_cta')}</span>
        </button>
      </div>
    </div>
  );
};
