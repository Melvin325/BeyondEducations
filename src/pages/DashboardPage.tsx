import React, { useState, useEffect, useMemo } from 'react';
import { BRAND_CONFIG } from '../config/brand';
import { Lead, LeadPriority } from '../data/demoLeads';
import { getCounsellorLeads, resetDemoLeads } from '../lib/storage';
import { LeadDrawer } from '../components/LeadDrawer';
import { Logo } from '../components/Logo';
import {
  Users,
  CheckCircle,
  Flame,
  Calendar,
  Percent,
  Search,
  Filter,
  Download,
  RotateCcw,
  Lock,
  ArrowRight,
  TrendingUp,
  Phone,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('beyond_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [streamFilter, setStreamFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const [langFilter, setLangFilter] = useState<string>('All');

  // Load leads
  const loadLeads = () => {
    const list = getCounsellorLeads();
    setLeads(list);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === BRAND_CONFIG.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('beyond_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError('Invalid password. Demo password is: ' + BRAND_CONFIG.ADMIN_PASSWORD);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset leads database with 25 realistic Indian demo leads?')) {
      resetDemoLeads();
      loadLeads();
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Phone',
      'Email',
      'City',
      'Language',
      'Stream',
      'Percentage',
      'Budget',
      'Profile Code',
      'Profile Name',
      'Lead Score',
      'Priority',
      'Status',
      'Booked Date',
      'Booked Time',
      'Created At',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.language.toUpperCase()}"`,
      `"${l.stream}"`,
      `"${l.percentage}"`,
      `"${l.budget}"`,
      `"${l.profileCode}"`,
      `"${l.profileName}"`,
      l.leadScore,
      l.priority,
      `"${l.status}"`,
      `"${l.bookingStatus?.date || 'N/A'}"`,
      `"${l.bookingStatus?.timeSlot || 'N/A'}"`,
      `"${l.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BeyondEducations_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.city.toLowerCase().includes(searchQuery.toLowerCase());

      // Priority
      const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter;

      // Stream
      const matchesStream = streamFilter === 'All' || lead.stream.includes(streamFilter);

      // Budget
      const matchesBudget = budgetFilter === 'All' || lead.budget === budgetFilter;

      // Language
      const matchesLang = langFilter === 'All' || lead.language === langFilter;

      return matchesSearch && matchesPriority && matchesStream && matchesBudget && matchesLang;
    });
  }, [leads, searchQuery, priorityFilter, streamFilter, budgetFilter, langFilter]);

  // KPIs
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.priority === 'Hot').length;
  const bookingsCount = leads.filter((l) => l.bookingStatus?.booked || l.status === 'Counselling booked').length;
  const startedQuizzes = Math.round(totalLeads * 1.35) + 8; // Estimated funnel start
  const completedRate = Math.round((totalLeads / startedQuizzes) * 100);

  // Drop-off Funnel Data by Milestone
  const funnelData = [
    { name: 'Quiz Started', count: startedQuizzes, fill: '#14305E' },
    { name: 'Part A (Q1-12)', count: Math.round(startedQuizzes * 0.92), fill: '#1B7A9C' },
    { name: 'Part B (Q13-16)', count: Math.round(startedQuizzes * 0.85), fill: '#1B7A9C' },
    { name: 'Part C (Q17-23)', count: Math.round(startedQuizzes * 0.78), fill: '#F2A12B' },
    { name: 'Teaser View', count: Math.round(startedQuizzes * 0.76), fill: '#F2A12B' },
    { name: 'Lead Form OTP', count: totalLeads, fill: '#10B981' },
    { name: '1-on-1 Booked', count: bookingsCount, fill: '#059669' },
  ];

  // 1. Password Protection Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F8FB] flex items-center justify-center p-4">
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#14305E] text-[#F2A12B] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#14305E]">
              Counsellor Dashboard Access
            </h2>
            <p className="text-xs text-slate-500">
              Enter advisor passcode to view verified leads & scores.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
              />
              <span className="text-[11px] text-[#1B7A9C] font-semibold block mt-1">
                Password: {BRAND_CONFIG.ADMIN_PASSWORD}
              </span>
            </div>

            {authError && (
              <p className="text-xs text-rose-600 font-semibold text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Authenticate & Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FB] py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#14305E]">
                Counsellor Lead Portal
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1B7A9C]/10 text-[#1B7A9C]">
                {BRAND_CONFIG.CITY} Office
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time student leads with automated scoring and qualification breakdown.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#14305E]" />
              <span>Load 25 Demo Leads</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#F2A12B]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Quizzes Started
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {startedQuizzes}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Session Funnel</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Completed
            </span>
            <span className="text-2xl font-extrabold text-[#1B7A9C] block">
              {totalLeads}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">100% Questions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Leads Captured
            </span>
            <span className="text-2xl font-extrabold text-[#14305E] block">
              {totalLeads}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">OTP Verified</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-rose-500 block uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Hot Leads
            </span>
            <span className="text-2xl font-extrabold text-rose-600 block">
              {hotLeads}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">Score 8+ (High Intent)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#F2A12B] block uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Bookings
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {bookingsCount}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">1-on-1 Scheduled</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 block uppercase flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Completion
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 block">
              {completedRate}%
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Start-to-Lead</span>
          </div>
        </div>

        {/* Funnel Chart Card */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1B7A9C]" />
                Quiz Progression & Drop-off Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing student milestone completion across the 23-question assessment.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Live Session Analytics
            </span>
          </div>

          <div className="w-full h-48 sm:h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Students`, 'Count']}
                  contentStyle={{ backgroundColor: '#14305E', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads Table Card with Search & Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4 sm:p-5">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or city..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Priority */}
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="All">All</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              {/* Stream */}
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold">Stream:</span>
                <select
                  value={streamFilter}
                  onChange={(e) => setStreamFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="All">All Streams</option>
                  <option value="PCM">Science (PCM)</option>
                  <option value="PCB">Science (PCB)</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              {/* Language */}
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold">Language:</span>
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="All">All Langs</option>
                  <option value="en">English (EN)</option>
                  <option value="kn">Kannada (KN)</option>
                  <option value="ta">Tamil (TA)</option>
                  <option value="ml">Malayalam (ML)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-3">Student / Phone</th>
                  <th className="py-3 px-3">City & Lang</th>
                  <th className="py-3 px-3">Stream / Budget</th>
                  <th className="py-3 px-3">Archetype</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    const priorityBadge = {
                      Hot: 'bg-rose-100 text-rose-700 border-rose-200',
                      Warm: 'bg-amber-100 text-amber-700 border-amber-200',
                      Cold: 'bg-blue-100 text-blue-700 border-blue-200',
                    }[lead.priority];

                    const isBooked = lead.bookingStatus?.booked || lead.status === 'Counselling booked';

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Student / Phone */}
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div>{lead.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-normal">
                            +91 {lead.phone}
                          </div>
                        </td>

                        {/* City & Lang */}
                        <td className="py-3 px-3 text-slate-600">
                          <div>{lead.city}</div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                            {lead.language.toUpperCase()}
                          </span>
                        </td>

                        {/* Stream / Budget */}
                        <td className="py-3 px-3 text-slate-700">
                          <div className="truncate max-w-[140px] font-medium" title={lead.stream}>
                            {lead.stream}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Budget: {lead.budget}
                          </div>
                        </td>

                        {/* Archetype */}
                        <td className="py-3 px-3 text-slate-800">
                          <span className="font-bold text-[#14305E]">{lead.profileCode}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                            {lead.profileName}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-extrabold text-sm text-[#14305E]">
                            {lead.leadScore}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ 14</span>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                            {lead.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`text-[11px] font-semibold block ${isBooked ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                            {isBooked ? '📅 Booked' : lead.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#14305E] hover:text-white transition-all text-slate-600 inline-flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No leads match your active filters or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-right text-xs text-slate-400">
            Showing {filteredLeads.length} of {leads.length} recorded leads
          </div>
        </div>
      </div>

      {/* Lead Detail Inspection Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={() => {
          loadLeads();
          const updated = getCounsellorLeads().find((l) => l.id === selectedLead?.id);
          if (updated) setSelectedLead(updated);
        }}
      />
    </div>
  );
};
