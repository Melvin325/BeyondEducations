import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';
import { Logo } from './Logo';
import { deleteUserData } from '../lib/storage';
import { MapPin, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all stored quiz answers and contact data from this browser?')) {
      deleteUserData();
      setDeletedSuccess(true);
      setTimeout(() => {
        setDeletedSuccess(false);
        navigate('/');
      }, 1500);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto pt-10 pb-8 text-slate-600 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100">
          {/* Col 1: Logo & Tagline */}
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {BRAND_CONFIG.TAGLINE}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-[#1B7A9C]" />
              <span>{BRAND_CONFIG.CITY}, {BRAND_CONFIG.STATE}, {BRAND_CONFIG.COUNTRY}</span>
            </div>
            <p className="text-xs text-slate-400">
              {BRAND_CONFIG.ADDRESS}
            </p>
          </div>

          {/* Col 2: Regulatory & Guidance Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assessment Guidance Notice
            </h4>
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold block mb-1">
                {t('disclaimer.footer_note')}
              </span>
              <span>
                Results provided are career suggestions for discussion and do not constitute an academic guarantee or admission verdict.
              </span>
            </div>
          </div>

          {/* Col 3: Compliance & Privacy Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Data & Compliance (DPDP Act)
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-[#14305E] hover:underline flex items-center gap-1 text-slate-600"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B7A9C]" />
                  <span>{t('footer.privacy_link')}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleDeleteData}
                  className="hover:text-rose-600 text-slate-500 hover:underline flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('footer.delete_data')}</span>
                </button>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin"
                  className="inline-block text-[11px] text-slate-400 hover:text-slate-700 underline"
                >
                  Counsellor Admin Access (Demo)
                </Link>
              </li>
            </ul>

            {deletedSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Local browser data cleared successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.BRAND_NAME}. {t('footer.rights')}</p>
          <p className="text-[11px] text-slate-400">
            {t('disclaimer.footer_note')}
          </p>
        </div>
      </div>
    </footer>
  );
};
