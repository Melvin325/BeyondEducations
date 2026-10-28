import React from 'react';
import { BRAND_CONFIG } from '../../config/brand';
import {
  GraduationCap,
  Globe2,
  Building,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const NetworkScopeManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Scope Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B7A9C]/10 text-[#1B7A9C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BeyondEducations Scope &amp; Geographic Reach</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active Pan-India &amp; Global Corridors
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#14305E]">
          Higher Education Programs &amp; Regional Hubs
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          BeyondEducations counsels students across three comprehensive degree tiers with institutional connections across all of India, anchored by major hubs in <strong>Kerala, Tamil Nadu, and Karnataka (Bangalore)</strong>, alongside direct overseas university tie-ups.
        </p>
      </div>

      {/* Program Pillars (UG, PG, Study Abroad) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {BRAND_CONFIG.OFFERINGS.map((prog) => (
          <div
            key={prog.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#1B7A9C]/40 transition-all"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#14305E] text-[#F2A12B]">
                {prog.badge}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{prog.fullName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1B7A9C]">
              <span>Active in System</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Regional Corridors Grid */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F2A12B] uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Admissions Corridors</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">
            Key Institutional Hubs Across India &amp; Worldwide
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {BRAND_CONFIG.NETWORK.PAN_INDIA}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {BRAND_CONFIG.NETWORK.HUBS.map((hub, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{hub.name}</h4>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  {hub.count}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{hub.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
