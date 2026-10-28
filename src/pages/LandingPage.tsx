import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { COUNSELLORS, TESTIMONIALS, FaqItem } from '../data/testimonialsFaq';
import { BRAND_CONFIG } from '../config/brand';
import { College } from '../data/colleges';
import { getLocalColleges, subscribeToColleges } from '../lib/collegeService';
import {
  getLocalContactSettings,
  cleanPhoneForWhatsApp,
} from '../lib/contactService';
import { getLocalFaqs, subscribeToFaqs } from '../lib/faqService';
import { getStoredQuizStep, clearQuizProgress } from '../lib/storage';
import { BookingModal } from '../components/BookingModal';
import { FastTrackModal } from '../components/FastTrackModal';
import { QuickCallbackCard } from '../components/QuickCallbackCard';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
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
  GraduationCap,
  Globe2,
  MapPin,
  Building,
  Award,
  Check,
  BookOpen,
  Send,
  Calendar,
  MessageCircle,
  RotateCcw,
  Play,
  HeartHandshake,
  Search,
  PhoneCall,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState<College[]>(() => getLocalColleges());
  const [activeTab, setActiveTab] = useState<'all' | 'ug' | 'pg' | 'abroad'>('all');
  const [selectedHub, setSelectedHub] = useState<string>('All');

  // Real user logic states
  const [savedStep, setSavedStep] = useState<number>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [fastTrackCategory, setFastTrackCategory] = useState<'pg' | 'abroad' | null>(null);
  const [persona, setPersona] = useState<'student' | 'parent'>('student');
  const [heroRightTab, setHeroRightTab] = useState<'callback' | 'illustration'>('callback');

  // Hero Quick Finder states
  const [finderLevel, setFinderLevel] = useState<string>('UG');
  const [finderHub, setFinderHub] = useState<string>('Karnataka (Bangalore)');
  const [finderStream, setFinderStream] = useState<string>('Engineering & Tech');

  // Dynamic FAQs state
  const [faqsList, setFaqsList] = useState<FaqItem[]>(() => getLocalFaqs());
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');

  useEffect(() => {
    // Check if user has an existing quiz session to resume
    const step = getStoredQuizStep();
    if (step > 0) {
      setSavedStep(step);
    }

    const unsubColleges = subscribeToColleges((list) => {
      if (list && list.length > 0) {
        setColleges(list);
      }
    });

    const unsubFaqs = subscribeToFaqs((liveFaqs) => {
      if (liveFaqs && liveFaqs.length > 0) {
        setFaqsList(liveFaqs);
      }
    });

    return () => {
      if (unsubColleges) unsubColleges();
      if (unsubFaqs) unsubFaqs();
    };
  }, []);

  const handleResumeQuiz = () => {
    navigate('/quiz');
  };

  const handleRestartQuiz = () => {
    clearQuizProgress();
    setSavedStep(0);
    navigate('/quiz');
  };

  const handleFinderSearch = () => {
    // Determine which region tab to map to
    if (finderHub.includes('Chennai') || finderHub.includes('Coimbatore') || finderHub.includes('Tamil Nadu') || finderHub.includes('Vellore') || finderHub.includes('Madurai')) {
      setSelectedHub('Tamil Nadu');
    } else if (finderHub.includes('Kerala') || finderHub.includes('Kochi') || finderHub.includes('Calicut') || finderHub.includes('Trivandrum') || finderHub.includes('Kottayam')) {
      setSelectedHub('Kerala');
    } else if (finderHub.includes('Karnataka') || finderHub.includes('Bangalore') || finderHub.includes('Mangalore') || finderHub.includes('Mysuru')) {
      setSelectedHub('Karnataka (Bangalore)');
    } else if (finderHub.includes('Study Abroad')) {
      setSelectedHub('Study Abroad');
    } else {
      setSelectedHub('All');
    }

    const targetElement = document.getElementById('partner-colleges-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCollegeEligibilityClick = (col: College) => {
    try {
      localStorage.setItem('beyond_target_college', JSON.stringify({ name: col.name, location: col.location, region: col.region }));
    } catch {}
    navigate(`/quiz?targetCollege=${encodeURIComponent(col.name)}`);
  };

  const handleCollegeWhatsAppInquire = (col: College) => {
    const text = `Hi BeyondEducations, I would like admission cutoffs & fee details for ${col.name} in ${col.location}.`;
    const contact = getLocalContactSettings();
    const cleanPhone = cleanPhoneForWhatsApp(contact.whatsappNumber);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FB]">
      {/* 1. RESUME INCOMPLETE ASSESSMENT BANNER */}
      {savedStep > 0 && (
        <div className="bg-gradient-to-r from-[#14305E] via-[#1B7A9C] to-[#14305E] text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F2A12B] animate-pulse flex-shrink-0" />
            <span>
              <strong>Welcome back!</strong> You have an assessment in progress (at <strong>Question #{savedStep + 1} of 23</strong>).
            </span>
          </div>
          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={handleResumeQuiz}
              className="px-3.5 py-1.5 bg-[#F2A12B] hover:bg-[#d98b1e] text-[#14305E] font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume Assessment</span>
            </button>
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="px-2 py-1 text-slate-300 hover:text-white text-[11px] hover:underline"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Subtle decorative background blur blobs */}
        <div className="absolute top-0 right-10 -z-10 w-72 h-72 bg-[#1B7A9C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-5 -z-10 w-80 h-80 bg-[#F2A12B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 text-left space-y-5"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-[#14305E] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F2A12B] animate-pulse" />
              <span>UG · PG · Study Abroad</span>
              <span className="text-slate-400">·</span>
              <span className="text-[#1B7A9C]">Bengaluru &amp; Pan-India</span>
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
              {t('landing.hero_subtitle')} Direct connections with top colleges across Karnataka (Bangalore), Kerala, Tamil Nadu, Pan-India &amp; Study Abroad.
            </p>

            {/* 4. HERO INTERACTIVE 3-STEP QUICK FINDER */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-[#14305E]">
                  <Search className="w-3.5 h-3.5 text-[#1B7A9C]" />
                  Quick Course &amp; College Matcher
                </span>
                <span className="text-[10px] text-slate-400 font-normal">3 instant clicks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* 1. Level */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Degree Tier</label>
                  <select
                    value={finderLevel}
                    onChange={(e) => setFinderLevel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-hidden"
                  >
                    <option value="UG">UG (BTech / MBBS / BBA)</option>
                    <option value="PG">PG (MBA / MTech / MCA)</option>
                    <option value="Study Abroad">Study Abroad (UK / EU / AUS)</option>
                  </select>
                </div>

                {/* 2. Hub / Location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target City / Hub</label>
                  <select
                    value={finderHub}
                    onChange={(e) => setFinderHub(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-hidden"
                  >
                    <optgroup label="Karnataka">
                      <option value="Karnataka (Bangalore)">Bengaluru / Bangalore (All)</option>
                      <option value="Bangalore - South">Bangalore South (RVCE / PES / Christ)</option>
                      <option value="Bangalore - North">Bangalore North (MSRIT / Reva)</option>
                      <option value="Mangalore / Manipal">Mangalore &amp; Manipal</option>
                      <option value="Mysuru">Mysuru</option>
                    </optgroup>
                    <optgroup label="Tamil Nadu">
                      <option value="Tamil Nadu">Tamil Nadu (All)</option>
                      <option value="Chennai">Chennai (SRM / Loyola / MCC)</option>
                      <option value="Coimbatore">Coimbatore (PSG Tech / Karunya)</option>
                      <option value="Vellore / Trichy">Vellore (VIT) &amp; Trichy (NIT/SASTRA)</option>
                      <option value="Madurai / Salem">Madurai &amp; Salem</option>
                    </optgroup>
                    <optgroup label="Kerala">
                      <option value="Kerala">Kerala (All)</option>
                      <option value="Kochi / Ernakulam">Kochi / Ernakulam (Amrita / Rajagiri / CUSAT)</option>
                      <option value="Calicut / Kozhikode">Calicut / Kozhikode (NIT / KMCT)</option>
                      <option value="Trivandrum">Trivandrum (CET / Mar Ivanios)</option>
                      <option value="Kottayam / Thrissur">Kottayam &amp; Thrissur</option>
                    </optgroup>
                    <optgroup label="National &amp; Overseas">
                      <option value="Pan-India">Pan-India (Delhi NCR, Mumbai, Pune, Hyderabad)</option>
                      <option value="Study Abroad">Study Abroad (UK, Ireland, Germany, Australia, USA)</option>
                      <option value="Others">Others / Not Decided Yet</option>
                    </optgroup>
                  </select>
                </div>

                {/* 3. Stream */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Stream</label>
                  <select
                    value={finderStream}
                    onChange={(e) => setFinderStream(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:outline-hidden"
                  >
                    <option value="Engineering & Tech">Engineering &amp; Tech</option>
                    <option value="Medicine & Health">Medicine &amp; Allied Health</option>
                    <option value="Management & MBA">Management &amp; MBA</option>
                    <option value="Arts, Media & Sciences">Arts, Design &amp; Sciences</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (finderLevel === 'PG') {
                    setFastTrackCategory('pg');
                  } else if (finderLevel === 'Study Abroad') {
                    setFastTrackCategory('abroad');
                  } else {
                    handleFinderSearch();
                  }
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#1B7A9C] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>
                  {finderLevel === 'PG'
                    ? 'Start PG (MBA/Masters) 90s Matcher'
                    : finderLevel === 'Study Abroad'
                    ? 'Start Study Abroad 90s Matcher'
                    : `Find Verified Colleges in ${
                        finderHub === 'Karnataka (Bangalore)'
                          ? 'Bangalore'
                          : finderHub === 'Tamil Nadu'
                          ? 'Tamil Nadu'
                          : finderHub
                      }`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F2A12B]" />
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#F2A12B]" />
                <span>{t('landing.cta_primary')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-[#14305E] font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 transition-all shadow-2xs hover:border-[#1B7A9C]/40"
              >
                <Calendar className="w-4 h-4 text-[#1B7A9C]" />
                <span>Book 1-on-1 Consultation</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1B7A9C]" />
                <span>Takes ~6 mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Free Guidance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F2A12B]" />
                <span>Verified Admissions Network</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Right: Direct Callback Card with Toggle to Visual Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col justify-center space-y-3"
          >
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl self-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setHeroRightTab('callback')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  heroRightTab === 'callback'
                    ? 'bg-white text-[#14305E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#1B7A9C]" />
                <span>Quick Callback</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroRightTab('illustration')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  heroRightTab === 'illustration'
                    ? 'bg-white text-[#14305E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F2A12B]" />
                <span>Assessment Info</span>
              </button>
            </div>

            {heroRightTab === 'callback' ? (
              <QuickCallbackCard
                onTakeQuiz={() => navigate('/quiz')}
                defaultLevel={finderLevel === 'UG' ? 'UG Students' : finderLevel === 'PG' ? 'PG Students' : 'Study Abroad'}
                defaultRegion={finderHub}
              />
            ) : (
              <div className="w-full bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 relative">
                {/* Floating Stat Chip */}
                <div className="absolute -top-3 -right-2 sm:-right-3 bg-[#14305E] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Bengaluru · Kerala · Tamil Nadu</span>
                </div>

                {/* Custom SVG Illustration in Brand Colors */}
                <svg viewBox="0 0 360 280" className="w-full h-auto drop-shadow-xs select-none" fill="none">
                  <circle cx="180" cy="140" r="110" fill="#F5F8FB" />
                  <circle cx="70" cy="60" r="28" fill="#1B7A9C" fillOpacity="0.1" />
                  <circle cx="290" cy="220" r="38" fill="#F2A12B" fillOpacity="0.12" />
                  <rect x="60" y="210" width="240" height="12" rx="6" fill="#14305E" />
                  <path d="M110 210 L130 150 L230 150 L250 210 Z" fill="#E2E8F0" />
                  <rect x="135" y="152" width="90" height="54" rx="4" fill="#14305E" />
                  <rect x="142" y="158" width="76" height="42" rx="2" fill="#FFFFFF" />
                  <polygon points="180,163 198,172 195,190 180,195 165,190 162,172" fill="#1B7A9C" fillOpacity="0.3" stroke="#1B7A9C" strokeWidth="1.5" />
                  <circle cx="180" cy="179" r="2" fill="#F2A12B" />
                  <circle cx="180" cy="95" r="32" fill="#FED7AA" />
                  <path d="M152 85 C152 65, 208 65, 208 85 C208 88, 200 78, 180 78 C160 78, 152 88, 152 85 Z" fill="#14305E" />
                  <circle cx="172" cy="94" r="3" fill="#14305E" />
                  <circle cx="188" cy="94" r="3" fill="#14305E" />
                  <path d="M174 105 Q180 112 186 105" stroke="#14305E" strokeWidth="2" strokeLinecap="round" />
                  <path d="M145 130 C145 125, 215 125, 215 130 L225 180 L135 180 Z" fill="#1B7A9C" />
                  <g transform="translate(245, 60)">
                    <circle cx="20" cy="20" r="22" fill="#F2A12B" />
                    <path d="M14 26 L26 14 M26 14 H18 M26 14 V22" stroke="#14305E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <rect x="68" y="180" width="38" height="10" rx="3" fill="#14305E" />
                  <rect x="65" y="190" width="44" height="10" rx="3" fill="#F2A12B" />
                  <rect x="62" y="200" width="50" height="10" rx="3" fill="#1B7A9C" />
                </svg>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">6-Min Science-Backed Quiz</span>
                  <button
                    type="button"
                    onClick={() => navigate('/quiz')}
                    className="text-[#1B7A9C] font-bold hover:underline"
                  >
                    Start Quiz Now →
                  </button>
                </div>
              </div>
            )}
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

          {/* Steps with connector lines */}
          <div className="relative pt-6">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-[calc(1.5rem+2.25rem/2)] left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-0.5 bg-gradient-to-r from-[#14305E] via-[#1B7A9C] to-[#F2A12B] z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F5F8FB] to-white border border-slate-200 hover:border-[#14305E]/40 hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#14305E] text-[#F2A12B] font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm ring-2 ring-white">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1B7A9C]" />
                  {t('landing.step1_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('landing.step1_desc')}
                </p>
                <div className="mt-3 text-[10px] font-extrabold uppercase tracking-wider text-[#14305E] bg-[#14305E]/8 px-2 py-1 rounded-lg inline-block">
                  ~6 minutes
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#EAF4F9] to-white border border-[#1B7A9C]/20 hover:border-[#1B7A9C]/50 hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#1B7A9C] text-white font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm ring-2 ring-white">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#F2A12B]" />
                  {t('landing.step2_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('landing.step2_desc')}
                </p>
                <div className="mt-3 text-[10px] font-extrabold uppercase tracking-wider text-[#1B7A9C] bg-[#1B7A9C]/10 px-2 py-1 rounded-lg inline-block">
                  Instant Results
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FEF9EE] to-white border border-[#F2A12B]/20 hover:border-[#F2A12B]/50 hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#F2A12B] text-[#14305E] font-extrabold flex items-center justify-center text-sm mb-4 shadow-sm ring-2 ring-white">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#14305E]" />
                  {t('landing.step3_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('landing.step3_desc')}
                </p>
                <div className="mt-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-[#F2A12B]/15 px-2 py-1 rounded-lg inline-block">
                  Free Counselling
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE WORK WITH: UG, PG & STUDY ABROAD */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B7A9C]/10 text-[#1B7A9C] text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Comprehensive Higher Education Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14305E] tracking-tight">
            We Work With UG, PG &amp; Study Abroad Students
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            From 12th standard board exams to postgraduate master degrees and international study visas, we deliver verified pathways tailored to your interests and budget.
          </p>
        </div>

        {/* 3 Program Cards — equal height, distinct accent colours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: UG — Navy accent */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-l-4 border-[#14305E] border-y border-r border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#14305E] text-[#F2A12B] flex items-center justify-center font-bold shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#1B7A9C] uppercase tracking-wider">
                  Bachelors &amp; Professional
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  UG Students (Undergraduate)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Personalized course and college selection for BTech, MBBS/BDS, Allied Health, BBA, BCA, BCom, BSc, BA, Integrated Law &amp; Design.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>KCET, COMEDK, KEAM, TNEA &amp; CUET guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Direct merit, management &amp; scholarship quotas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>College campus tour &amp; fee structure breakdown</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-auto">
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="w-full py-2.5 px-4 bg-[#14305E] hover:bg-[#1B7A9C] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Find UG Courses</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F2A12B]" />
              </button>
            </div>
          </div>

          {/* Card 2: PG — Teal accent */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-l-4 border-[#1B7A9C] border-y border-r border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#1B7A9C] text-white flex items-center justify-center font-bold shadow-xs">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#14305E] uppercase tracking-wider">
                  Masters &amp; Executives
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  PG Students (Postgraduate)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Strategic admissions for MBA / PGDM, MCA, MTech, MSc, MCom, and specialized master degrees with proven corporate placement track records.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tier-1 &amp; Tier-2 B-School profile evaluations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Specializations: AI, FinTech, Business Analytics, HR</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Direct interview prep &amp; GD-PI mentoring</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-auto">
              <button
                type="button"
                onClick={() => setFastTrackCategory('pg')}
                className="w-full py-2.5 px-4 bg-[#1B7A9C] hover:bg-[#14305E] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Find PG Options (90s Matcher)</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Card 3: Study Abroad — Amber accent */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-l-4 border-[#F2A12B] border-y border-r border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#F2A12B] text-[#14305E] flex items-center justify-center font-bold shadow-xs">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  International Degrees &amp; Visas
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Study Abroad Students
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Direct admissions, scholarship counseling, and hassle-free student visa processing for top universities across the UK, Ireland, Germany, Australia, Canada, USA &amp; Europe.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>2-Year Post-Study Work Visas (PSW / Stay-back)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Free SOP, LOR, and university application review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>English proficiency guidance (IELTS / PTE / Duolingo)</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-auto">
              <button
                type="button"
                onClick={() => setFastTrackCategory('abroad')}
                className="w-full py-2.5 px-4 bg-[#F2A12B] hover:bg-amber-500 text-[#14305E] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Explore Global Universities (90s Matcher)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PAN-INDIA CONNECTIONS & SOUTHERN HUB NETWORK */}
      <section className="py-14 sm:py-20 bg-slate-900 text-white px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B7A9C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F2A12B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2A12B] text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Pan-India Presence &amp; Southern Hubs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Connections All Over India, Major Presence in South India
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We have direct tie-ups and institutional relationships across India — with our largest admissions corridors in Karnataka (Bangalore), Kerala, and Tamil Nadu.
            </p>
          </div>

          {/* Hub Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hub 1: Karnataka / Bangalore */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F2A12B] uppercase">Primary Hub</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  60+ Colleges
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Karnataka &amp; Bangalore</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                RVCE, Christ, PES, Jain, Ramaiah, BMCRI, St. Joseph's, Dayananda Sagar, UVCE &amp; top Bangalore tech colleges.
              </p>
            </div>

            {/* Hub 2: Kerala */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B7A9C] uppercase">Major Network</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  45+ Colleges
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Kerala</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Amrita (Kochi/Amritapuri), Rajagiri, SCMS, Mar Ivanios, TKM, St. Teresa's, NIT Calicut &amp; leading Kerala medical colleges.
              </p>
            </div>

            {/* Hub 3: Tamil Nadu */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F2A12B] uppercase">Premier Hub</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  50+ Colleges
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Tamil Nadu</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                SRM, PSG Tech, Loyola, VIT Vellore/Chennai, SASTRA, Madras Christian College (MCC), Karunya &amp; Coimbatore clusters.
              </p>
            </div>

            {/* Hub 4: Pan-India & Global */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 uppercase">National &amp; Global</span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  150+ Partners
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Pan-India &amp; Abroad</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Manipal (MAHE), Symbiosis, Ashoka, BITS Pilani + UK (UEL), Ireland (DBS), Germany (IU), Australia &amp; USA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COLLEGES WE WORK WITH: LIVE DYNAMIC SHOWCASE */}
      <section id="partner-colleges-section" className="py-14 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14305E]/10 text-[#14305E] text-xs font-bold uppercase tracking-wider">
              <Building className="w-4 h-4 text-[#1B7A9C]" />
              <span>Partner Institutions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14305E] tracking-tight">
              Colleges &amp; Universities We Work With
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Browse trusted colleges across Karnataka, Kerala, Tamil Nadu, Pan-India &amp; Study Abroad destinations.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {['All', 'Karnataka (Bangalore)', 'Kerala', 'Tamil Nadu', 'Study Abroad'].map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedHub === hub
                    ? 'bg-white text-[#14305E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hub === 'Karnataka (Bangalore)' ? 'Bangalore' : hub}
              </button>
            ))}
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges
            .filter((c) => selectedHub === 'All' || c.region === selectedHub)
            .slice(0, 6)
            .map((col) => (
              <div
                key={col.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#1B7A9C]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[#1B7A9C] bg-[#1B7A9C]/10 px-2 py-0.5 rounded-md uppercase">
                      {col.region}
                    </span>
                    {col.isPartner && (
                      <span className="text-[10px] font-extrabold text-[#14305E] bg-[#F2A12B]/20 border border-[#F2A12B]/40 px-2 py-0.5 rounded-full">
                        ★ Partner
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[#14305E] transition-colors">
                    {col.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{col.location}</span>
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {col.levels.map((lvl) => (
                      <span
                        key={lvl}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                      >
                        {lvl}
                      </span>
                    ))}
                    {col.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {col.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-[#14305E]">{col.indicativeFee}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCollegeWhatsAppInquire(col)}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all"
                        title="Inquire via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCollegeEligibilityClick(col)}
                        className="text-[11px] font-bold px-2.5 py-1 bg-[#14305E] hover:bg-[#1B7A9C] text-white rounded-lg shadow-2xs flex items-center gap-1 transition-all active:scale-95"
                      >
                        <span>Check Cutoffs</span>
                        <ArrowRight className="w-3 h-3 text-[#F2A12B]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 7. PARENT VS. STUDENT PERSONA PERSPECTIVE */}
      <section className="py-12 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#1B7A9C] uppercase tracking-wider">
              Tailored Guidance for Both Perspectives
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14305E]">
              Whether You Are a Student or a Parent, We’ve Got You Covered
            </h2>
          </div>

          {/* Persona Switcher Tabs */}
          <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPersona('student')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                persona === 'student'
                  ? 'bg-[#14305E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#F2A12B]" />
              <span>For 12th &amp; Degree Students</span>
            </button>

            <button
              type="button"
              onClick={() => setPersona('parent')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                persona === 'parent'
                  ? 'bg-[#14305E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>For Parents &amp; Families</span>
            </button>
          </div>

          {/* Dynamic Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-2">
            {persona === 'student' ? (
              <>
                <div className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-2">
                  <span className="text-xl">💼</span>
                  <h4 className="text-base font-bold text-slate-900">Placement Packages &amp; Career Growth</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Compare verified corporate hiring statistics, average starting packages (₹6L - ₹24L CTC), and active tech placement cells.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-2">
                  <span className="text-xl">🚀</span>
                  <h4 className="text-base font-bold text-slate-900">AI, FinTech &amp; Modern Minors</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Find institutions with updated industry curricula, coding culture, robotics labs, and dual-specialization options.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-2">
                  <span className="text-xl">✈️</span>
                  <h4 className="text-base font-bold text-slate-900">2-Year Post-Study Work Visas</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clear guidance on English tests (IELTS/PTE), scholarship eligibility, and stay-back work permits in the UK, Germany, and Ireland.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-2">
                  <span className="text-xl">🧾</span>
                  <h4 className="text-base font-bold text-slate-900">Transparent Fees &amp; Zero Hidden Charges</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clear break-up of tuition, hostel, and exam fees. Direct merit and government quota guidance with zero surprise costs.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-2">
                  <span className="text-xl">🏛️</span>
                  <h4 className="text-base font-bold text-slate-900">UGC &amp; NAAC A++ Accreditations</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We verify university statutory recognitions so your child receives a legally respected, globally valid degree certificate.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-2">
                  <span className="text-xl">🛡️</span>
                  <h4 className="text-base font-bold text-slate-900">Safe Campus &amp; Hostel Environments</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verified anti-ragging campuses, warden-supervised boarding, hygienic mess food, and direct counsellor updates to parents.
                  </p>
                </div>
              </>
            )}
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
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14305E] to-[#1B7A9C] text-[#F2A12B] font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-white">
                      {c.avatarText}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                    <p className="text-xs text-[#1B7A9C] font-semibold">{c.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        ✓ Verified Counsellor
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#F2A12B] flex-shrink-0" />
                    <p className="font-semibold text-slate-700">{c.experience}</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#1B7A9C] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-500 leading-relaxed">{c.specialty}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="mt-4 w-full text-xs font-bold py-1.5 rounded-xl border border-[#1B7A9C]/30 text-[#1B7A9C] hover:bg-[#1B7A9C] hover:text-white transition-all"
                >
                  Book a Session
                </button>
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
                className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative"
              >
                {/* Quote mark decoration */}
                <span className="absolute top-4 right-4 text-5xl leading-none text-slate-100 font-serif select-none pointer-events-none">"</span>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t(test.quoteKey)}"
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{test.studentName}</span>
                      <span className="text-slate-500 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{test.city}
                      </span>
                    </div>
                  </div>
                  <span className="inline-block mt-2 text-[11px] font-semibold text-[#1B7A9C] bg-[#1B7A9C]/10 px-2 py-0.5 rounded-md">
                    🎓 {test.courseSelected}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC FAQ SECTION */}
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

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {['All', 'Admissions & Quota', 'Fees & Scholarships', 'Study Abroad', 'General'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFaqCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    faqCategoryFilter === cat
                      ? 'bg-[#14305E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="space-y-3 pt-2">
            {faqsList
              .filter((faq) => faq.isActive !== false)
              .filter(
                (faq) =>
                  faqCategoryFilter === 'All' || faq.category === faqCategoryFilter
              )
              .map((faq) => {
                const questionText = faq.questionKey ? t(faq.questionKey) : faq.question;
                const answerText = faq.answerKey ? t(faq.answerKey) : faq.answer;
                return (
                  <details
                    key={faq.id}
                    className="group p-4 rounded-xl bg-[#F5F8FB] border border-slate-200/80 open:bg-white open:ring-1 open:ring-[#1B7A9C]/30 transition-all"
                  >
                    <summary className="flex items-center justify-between cursor-pointer font-bold text-xs sm:text-sm text-slate-800 list-none">
                      <div className="flex items-center gap-2 pr-2">
                        {faq.category && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#14305E]/10 text-[#14305E] flex-shrink-0">
                            {faq.category}
                          </span>
                        )}
                        <span>{questionText}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                    </summary>
                    <p className="pt-2.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                      {answerText}
                    </p>
                  </details>
                );
              })}
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-white/95 backdrop-blur-md border-t border-slate-200 sm:hidden shadow-lg flex items-center justify-between gap-2">
        <div className="text-left flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-500 block truncate">Admissions Guidance</span>
          <span className="text-xs font-black text-[#14305E] truncate block">UG · PG · Study Abroad</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#14305E] font-bold text-xs rounded-xl flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1B7A9C]" />
            <span>Consult</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="px-3.5 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F2A12B]" />
            <span>{t('landing.sticky_cta')}</span>
          </button>
        </div>
      </div>

      {/* FLOATING WHATSAPP CHAT TRIGGER */}
      <FloatingWhatsApp selectedHub={selectedHub} selectedLevel={activeTab} />

      {/* 1-ON-1 CONSULTATION BOOKING MODAL */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        lead={null}
      />

      {/* FAST-TRACK MODAL FOR PG & STUDY ABROAD */}
      <FastTrackModal
        isOpen={fastTrackCategory !== null}
        onClose={() => setFastTrackCategory(null)}
        category={fastTrackCategory || 'pg'}
      />
    </div>
  );
};
