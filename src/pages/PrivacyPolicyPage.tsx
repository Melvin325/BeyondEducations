import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';
import { deleteUserData } from '../lib/storage';
import { ShieldCheck, ArrowLeft, Trash2, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dataDeleted, setDataDeleted] = useState<boolean>(false);

  const handleDeleteData = () => {
    if (window.confirm('Delete all stored assessment answers and contact details from your browser?')) {
      deleteUserData();
      setDataDeleted(true);
      setTimeout(() => {
        setDataDeleted(false);
        navigate('/');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FB] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#14305E] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Personal Data Protection (DPDP Act) Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14305E]">
            Privacy Policy & Student Data Protection Notice
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · {BRAND_CONFIG.BRAND_NAME}, {BRAND_CONFIG.CITY}
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              1. Local-First Processing Notice
            </h3>
            <p>
              In this demo prototype of BeyondEducations, <strong>no student personal information is transmitted to an external cloud or server</strong>. All quiz answers, interest computations, contact numbers, and counsellor bookings reside strictly within your local web browser's storage (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">localStorage</code>).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              2. Minors & Parental Consent Policy
            </h3>
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#F2A12B] flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                As per Indian DPDP Act guidelines, any student under 18 years of age completing this assessment must obtain prior consent from a parent or legal guardian. The optional parent phone number provided is used exclusively to dispatch a structured parent summary report.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              3. Purpose of Data Collection
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Generating your personalised Career Interest Guidance Report.</li>
              <li>Matching relevant Karnataka and Pan-India undergraduate courses based on stream and fee budget.</li>
              <li>Scheduling a complimentary 1-on-1 strategy session with our academic advisors in Indiranagar, Bengaluru.</li>
              <li>We strictly do not sell, barter, or distribute your phone or email to third-party marketing brokers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              4. Guidance Notice (Disclaimer)
            </h3>
            <p className="italic text-slate-600">
              "{t('disclaimer.footer_note')}" The assessments represent directional interest matching and do not constitute an entrance exam guarantee or college admission promise.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              5. Right to Erasure ("Delete My Data")
            </h3>
            <p>
              You maintain the absolute right to purge all stored quiz records, leads, and schedule slots from this device instantly:
            </p>

            <button
              type="button"
              onClick={handleDeleteData}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Purge All My Stored Data From This Browser</span>
            </button>

            {dataDeleted && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All local storage data has been erased successfully!</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
