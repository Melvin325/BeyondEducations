import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Sparkles, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'ml', label: 'മലയാളം' },
] as const;

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  const isQuiz = location.pathname.startsWith('/quiz');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div onClick={() => navigate('/')} className="cursor-pointer flex-shrink-0">
          <Logo size="sm" />
        </div>

        {/* Right Section: Language switcher & CTA */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100/90 rounded-full p-0.5 border border-slate-200 text-xs">
            <span className="hidden sm:inline-flex items-center pl-2 pr-1 text-slate-500">
              <Globe className="w-3.5 h-3.5" />
            </span>
            {LANGUAGES.map((lang) => {
              const active = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2 py-1 sm:px-2.5 rounded-full font-medium transition-all ${
                    active
                      ? 'bg-[#14305E] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`Switch language to ${lang.label}`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Primary Action Button (Header) */}
          {!isQuiz && !isAdmin && (
            <button
              onClick={() => navigate('/quiz')}
              className="hidden xs:inline-flex items-center gap-1.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full transition-all duration-200 shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2A12B]" />
              <span>{t('nav.take_quiz')}</span>
            </button>
          )}

          {isAdmin && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-[#14305E] border border-slate-200">
              Admin Portal
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
