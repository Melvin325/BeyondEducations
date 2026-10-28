import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getStoredCurrentLead, getStoredQuizAnswers } from '../lib/storage';
import { evaluateQuiz, QuizResult } from '../lib/scoring';
import { Lead } from '../data/demoLeads';
import { College } from '../data/colleges';
import { getLocalColleges, subscribeToColleges } from '../lib/collegeService';
import { Logo } from '../components/Logo';
import { InterestRadarChart } from '../components/RadarChart';
import { BookingModal } from '../components/BookingModal';
import { downloadReportAsPdf } from '../lib/pdf';
import {
  Download,
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Briefcase,
  Building2,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  MessageCircle,
  FileCheck,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [colleges, setColleges] = useState<College[]>(() => getLocalColleges());
  const [collegeRegionFilter, setCollegeRegionFilter] = useState<string>('All');
  const [collegeLevelFilter, setCollegeLevelFilter] = useState<string>('All');

  useEffect(() => {
    const unsub = subscribeToColleges((list) => {
      if (list && list.length > 0) {
        setColleges(list);
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    const currentLead = getStoredCurrentLead();
    const answers = getStoredQuizAnswers();
    const evaluated = evaluateQuiz(answers);

    if (currentLead) {
      setLead(currentLead);
    } else {
      // Create fallback lead for preview if accessed directly
      const fallback: Lead = {
        id: 'lead-preview',
        name: 'Suhas Rao',
        phone: '9845012345',
        email: 'suhas.rao@example.com',
        city: 'Bengaluru',
        fillerType: 'Student',
        language: (i18n.language as any) || 'en',
        stream: answers.stream || 'Science (PCM)',
        budget: answers.budget || '3_8',
        percentage: answers.percentage || '75_90',
        entranceExams: ['KCET', 'JEE'],
        status12: 'passed_out',
        decisionTime: 'this_month',
        worry: 'course_choice',
        preferredLocation: 'bengaluru',
        relocate: 'no',
        workPreference: 'team',
        careerValue: 'income',
        heavyMathsComfort: 'yes',
        bestSubjects: ['Maths', 'Physics'],
        riasecScores: evaluated.riasecScores,
        profileCode: evaluated.profileCode,
        profileName: t(evaluated.profile.nameKey),
        topCourses: evaluated.topCourses.map((c) => c.course.id),
        scoreBreakdown: {
          status12Score: 3,
          decisionTimeScore: 3,
          parentPhoneScore: 0,
          budgetScore: 1,
          worryScore: 2,
          completionScore: 2,
          total: 11,
        },
        leadScore: 11,
        priority: 'Hot',
        status: 'New',
        createdAt: new Date().toISOString(),
      };
      setLead(fallback);
    }

    setResult(evaluated);
  }, [i18n.language]);

  if (!lead || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-slate-500">
        Loading guidance report...
      </div>
    );
  }

  const profile = result.profile;
  const topCourses = result.topCourses;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    await downloadReportAsPdf(
      'printable-report',
      `BeyondEducations_${lead.name.replace(/\s+/g, '_')}_Report.pdf`
    );
    setIsDownloadingPdf(false);
  };

  const shareText = t('report.whatsapp_share_text', {
    profileName: t(profile.nameKey),
    code: profile.code,
  });
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-[#F5F8FB] py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Action Bar (Buttons) */}
        <div className="no-print bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">
              {t('report.badge')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#14305E]" />
              <span>{isDownloadingPdf ? 'Generating...' : t('report.cta_download_pdf')}</span>
            </button>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('report.cta_share_wa')}</span>
            </a>
          </div>
        </div>

        {/* Mock WhatsApp Chat Bubble Success State */}
        <div className="no-print p-4 sm:p-5 rounded-3xl bg-linear-to-r from-emerald-500/10 via-[#1B7A9C]/10 to-transparent border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('report.whatsapp_sent_title')}</span>
          </div>

          {/* WhatsApp Bubble Preview */}
          <div className="bg-[#DCF8C6] text-slate-800 p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs sm:text-sm leading-relaxed border border-emerald-200/60 max-w-lg">
            <p>
              {t('report.whatsapp_mock_bubble', {
                name: lead.name,
                profileName: t(profile.nameKey),
                code: profile.code,
              })}
            </p>
            <span className="text-[10px] text-slate-500 block text-right mt-1">
              Just now · Delivered ✓✓
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-[#1B7A9C]" />
            <span>{t('report.email_sent_note', { email: lead.email })}</span>
          </p>
        </div>

        {/* ======================================================== */}
        {/* MAIN PRINTABLE / EXPORTABLE REPORT CONTAINER */}
        {/* ======================================================== */}
        <div
          id="printable-report"
          className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-8 space-y-8 text-slate-800"
        >
          {/* a) COVER HEADER */}
          <div className="pb-6 border-b-2 border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Logo size="lg" />
              <p className="text-xs text-slate-500 font-medium pt-1">
                {t('report.cover_for')} <strong className="text-slate-900">{lead.name}</strong> ({lead.city})
              </p>
              <p className="text-[11px] text-slate-400">
                {t('report.cover_date')} {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[200px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                RIASEC Archetype
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#14305E] block leading-tight">
                {t(profile.nameKey)}
              </span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#14305E] text-[#F2A12B] font-mono font-bold text-xs">
                Code: {profile.code}
              </span>
            </div>
          </div>

          {/* Mandatory Guidance Banner (Word Rule: Guidance, not a verdict) */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs font-semibold text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#F2A12B] flex-shrink-0" />
            <span>{t('report.guidance_banner')}</span>
          </div>

          {/* b) 3 PLAIN-LANGUAGE STRENGTHS */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-[#14305E] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#1B7A9C]" />
              {t('report.section_strengths')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile.strengthsKeys.map((key, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#F5F8FB] border border-slate-200/80 flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#14305E] text-[#F2A12B] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {t(key)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* c) RADAR CHART (RIASEC Interest Breakdown) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-extrabold text-[#14305E]">
              {t('report.section_radar')}
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
              <InterestRadarChart scores={lead.riasecScores || result.riasecScores} />
            </div>
          </div>

          {/* d) TOP 3-5 COURSE MATCHES */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-base font-extrabold text-[#14305E]">
                {t('report.section_courses')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('report.courses_disclaimer')}
              </p>
            </div>

            <div className="space-y-4">
              {topCourses.map((item, index) => {
                const course = item.course;

                const budgetBadgeStyle = {
                  within: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  slightly_above: 'bg-amber-100 text-amber-800 border-amber-300',
                  above: 'bg-slate-100 text-slate-700 border-slate-300',
                }[item.budgetStatus];

                return (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl bg-[#F5F8FB] border border-slate-200 space-y-3 relative hover:border-[#1B7A9C]/50 transition-all"
                  >
                    {/* Course Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#14305E] text-[#F2A12B] font-extrabold text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                            {course.abbr}
                          </h4>
                          <span className="text-xs text-slate-500 block">
                            {t(course.nameKey)}
                          </span>
                        </div>
                      </div>

                      {/* Budget Badge */}
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${budgetBadgeStyle}`}>
                        {t(item.budgetStatusLabelKey)}
                      </span>
                    </div>

                    {/* Why this fits you */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-xs">
                      <strong className="text-[#14305E] block mb-0.5">
                        {t('report.why_fits_you')}
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        {t(course.whyTemplateKey)}
                      </p>
                    </div>

                    {/* Meta info pills: duration, fee, exams, salary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {t('report.duration')}
                        </span>
                        <span className="font-bold text-slate-800">
                          {course.durationYears} {t('report.years')}
                        </span>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {t('report.indicative_fee')}
                        </span>
                        <span className="font-bold text-slate-800">
                          ₹{course.feeRangeLakh[0]} - ₹{course.feeRangeLakh[1]} {t('report.lakhs')}
                        </span>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {t('report.key_exams')}
                        </span>
                        <span className="font-bold text-[#1B7A9C] truncate block" title={course.entranceExams.join(', ')}>
                          {course.entranceExams.join(', ')}
                        </span>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {t('report.fresher_salary')}
                        </span>
                        <span className="font-bold text-emerald-700">
                          ₹{course.salaryRangeFresherLPA[0]} - ₹{course.salaryRangeFresherLPA[1]} {t('report.lpa')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* e) ENTRANCE EXAMS & INDICATIVE TIMELINES */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#14305E]">
                {t('report.section_exams')}
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {t('report.exams_sample_tag')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F5F8FB] border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-[#14305E] block">KCET (Karnataka CET)</span>
                <span className="text-slate-600 block">Registration: Jan - Mar</span>
                <span className="text-[#1B7A9C] font-semibold block">Exam: April / May</span>
              </div>
              <div className="p-3 bg-[#F5F8FB] border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-[#14305E]">CUET (UG Central Univs)</span>
                <span className="text-slate-600 block">Registration: Feb - Mar</span>
                <span className="text-[#1B7A9C] font-semibold block">Exam: May / June</span>
              </div>
              <div className="p-3 bg-[#F5F8FB] border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-[#14305E]">State Direct / Merit</span>
                <span className="text-slate-600 block">PUC/CBSE Results: May</span>
                <span className="text-[#1B7A9C] font-semibold block">Admissions: May - July</span>
              </div>
            </div>
          </div>

          {/* f) COLLEGES WE WORK WITH (UG, PG, STUDY ABROAD) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#14305E]">
                  {t('report.section_colleges')}
                </h3>
                <p className="text-xs text-slate-500">
                  Karnataka (Bangalore), Kerala, Tamil Nadu, Pan-India & Study Abroad Institutions
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-semibold text-[#1B7A9C] bg-[#1B7A9C]/10 px-2.5 py-1 rounded-full">
                {colleges.filter((c) => c.isPartner).length} Direct Partner Institutions
              </span>
            </div>

            {/* Region & Level filter chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {['All', 'Karnataka (Bangalore)', 'Kerala', 'Tamil Nadu', 'Pan-India', 'Study Abroad'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setCollegeRegionFilter(reg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    collegeRegionFilter === reg
                      ? 'bg-[#14305E] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {reg === 'Karnataka (Bangalore)' ? 'Bangalore / Karnataka' : reg}
                </button>
              ))}
            </div>

            {/* Colleges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {colleges
                .filter((c) => collegeRegionFilter === 'All' || c.region === collegeRegionFilter)
                .slice(0, 9)
                .map((col) => (
                  <div
                    key={col.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs relative flex flex-col justify-between hover:border-[#1B7A9C]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B7A9C] bg-[#1B7A9C]/10 px-1.5 py-0.5 rounded">
                          {col.region}
                        </span>
                        {col.isPartner && (
                          <span className="text-[9px] font-extrabold text-[#F2A12B] bg-[#14305E] px-2 py-0.5 rounded-full shadow-2xs">
                            ★ Official Partner
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-slate-900 leading-snug">{col.name}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{col.location}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {col.levels.map((lvl) => (
                          <span
                            key={lvl}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {lvl}
                          </span>
                        ))}
                        {col.category && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                            {col.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-bold text-[#14305E]">{col.indicativeFee}</span>
                        {col.accreditation && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {col.accreditation.split('·')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* g) ONE-PAGE PARENT SUMMARY */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F2A12B]" />
              <h3 className="text-base font-extrabold tracking-wide">
                {t('report.section_parent')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  {t('report.parent_strengths_title')}
                </span>
                <p className="font-medium text-white">{t(profile.nameKey)}</p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  High natural aptitude for {t(profile.strengthsKeys[0])}.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  {t('report.parent_courses_title')}
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-white font-medium">
                  {topCourses.slice(0, 3).map((c) => (
                    <li key={c.course.id}>{c.course.abbr}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  {t('report.parent_budget_title')}
                </span>
                <p className="font-bold text-[#F2A12B] text-sm">
                  ₹{topCourses[0]?.course.feeRangeLakh[0]} - ₹{topCourses[0]?.course.feeRangeLakh[1]} Lakhs
                </p>
                <p className="text-[11px] text-slate-400">
                  Total 3-5 yr tuition depending on college type.
                </p>
              </div>
            </div>

            {/* Parent Checklist */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 uppercase text-[10px] block">
                {t('report.parent_checklist_title')}
              </span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t('report.checklist_item_1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t('report.checklist_item_2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t('report.checklist_item_3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mandatory Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 italic">
            "{t('disclaimer.footer_note')}"
          </div>
        </div>

        {/* h) PRIMARY CTA: BOOK A FREE 1-ON-1 COUNSELLING SESSION */}
        <div className="no-print p-6 sm:p-8 bg-linear-to-br from-[#14305E] to-[#1B7A9C] text-white rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-[#F2A12B]">
            <Calendar className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl sm:text-2xl font-black">
              {t('booking.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200">
              Discuss course options, college cutoffs, and fees with a senior advisor in Bengaluru or online.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="px-6 py-3.5 bg-[#F2A12B] hover:bg-[#d98b1e] text-[#14305E] font-extrabold text-sm rounded-2xl shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('report.cta_book_counselling')}</span>
          </button>
        </div>
      </div>

      {/* Counselling Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        lead={lead}
        onBookingComplete={() => {
          const updated = getStoredCurrentLead();
          if (updated) setLead(updated);
        }}
      />
    </div>
  );
};
