import React, { useState } from 'react';
import { Lead, LeadStatus, CallLogEntry, CallOutcome } from '../data/demoLeads';
import { updateLeadInCounsellorList } from '../lib/storage';
import {
  X,
  Phone,
  MessageSquare,
  Award,
  Calendar,
  User,
  GraduationCap,
  MapPin,
  CheckCircle,
  Clock,
  Save,
  Plus,
  Trash2,
  AlarmClock,
  Activity,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

const OUTCOME_META: Record<CallOutcome, { emoji: string; color: string }> = {
  'Called - No Answer':      { emoji: '📵', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  'Called - Interested':     { emoji: '🔥', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Called - Not Interested': { emoji: '❌', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  'WhatsApp Sent':           { emoji: '💬', color: 'bg-green-50 text-green-700 border-green-200' },
  'Email Sent':              { emoji: '📧', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Meeting Done':            { emoji: '✅', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Follow-up Scheduled':     { emoji: '📅', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const ALL_OUTCOMES: CallOutcome[] = [
  'Called - No Answer',
  'Called - Interested',
  'Called - Not Interested',
  'WhatsApp Sent',
  'Email Sent',
  'Meeting Done',
  'Follow-up Scheduled',
];

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ lead, onClose, onLeadUpdated }) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState<string>(lead.notes || '');
  const [savedNote, setSavedNote] = useState<boolean>(false);

  // Call log state
  const [callLog, setCallLog] = useState<CallLogEntry[]>(lead.callLog || []);
  const [newOutcome, setNewOutcome] = useState<CallOutcome>('Called - Interested');
  const [newNote, setNewNote] = useState<string>('');
  const [isSavingLog, setIsSavingLog] = useState<boolean>(false);
  const [logSaved, setLogSaved] = useState<boolean>(false);

  // Follow-up date
  const [followUpDate, setFollowUpDate] = useState<string>(lead.followUpDate || '');
  const [followUpSaved, setFollowUpSaved] = useState<boolean>(false);

  const handleStatusChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    updateLeadInCounsellorList(lead.id, { status: newStatus });
    onLeadUpdated();
  };

  const handleSaveNotes = () => {
    updateLeadInCounsellorList(lead.id, { notes });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
    onLeadUpdated();
  };

  const handleAddLogEntry = () => {
    if (!newNote.trim()) return;
    setIsSavingLog(true);
    const entry: CallLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      outcome: newOutcome,
      note: newNote.trim(),
    };
    const updated = [entry, ...callLog];
    setCallLog(updated);
    updateLeadInCounsellorList(lead.id, { callLog: updated });
    setNewNote('');
    setIsSavingLog(false);
    setLogSaved(true);
    setTimeout(() => setLogSaved(false), 2000);
    onLeadUpdated();
  };

  const handleDeleteLogEntry = (id: string) => {
    const updated = callLog.filter((e) => e.id !== id);
    setCallLog(updated);
    updateLeadInCounsellorList(lead.id, { callLog: updated });
    onLeadUpdated();
  };

  const handleSaveFollowUp = () => {
    updateLeadInCounsellorList(lead.id, { followUpDate });
    setFollowUpSaved(true);
    setTimeout(() => setFollowUpSaved(false), 2000);
    onLeadUpdated();
  };

  const priorityColor = {
    Hot: 'bg-rose-100 text-rose-800 border-rose-300',
    Warm: 'bg-amber-100 text-amber-800 border-amber-300',
    Cold: 'bg-blue-100 text-blue-800 border-blue-300',
  }[lead.priority];

  const waNumber = lead.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(
    `Hello ${lead.name}, this is your academic advisor from BeyondEducations in Bengaluru regarding your Career Interest Quiz report.`
  )}`;

  const isFollowUpOverdue =
    followUpDate && new Date(followUpDate) < new Date() && status !== 'Admitted' && status !== 'Lost';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">

        {/* ── Drawer Header ── */}
        <div className="p-4 sm:p-5 bg-[#14305E] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold">{lead.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                {lead.priority} Lead
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#F2A12B]" />
              {lead.city} · {lead.language.toUpperCase()} · {lead.fillerType}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Action Bar ── */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#F2A12B]" />
              <span>Call</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className="text-xs font-semibold px-2 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#1B7A9C]"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Counselling booked">Counselling booked</option>
              <option value="Admitted">Admitted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex border-b border-slate-200 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#14305E] text-[#14305E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'activity'
                ? 'border-[#1B7A9C] text-[#1B7A9C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Activity & Follow-ups
            {callLog.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#1B7A9C] text-white text-[10px] font-extrabold">
                {callLog.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ TAB: OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-5 space-y-5 text-xs sm:text-sm">

              {/* Booking Banner */}
              {lead.bookingStatus?.booked && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 text-amber-900">
                  <Calendar className="w-5 h-5 text-[#F2A12B] flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs">Counselling Session Booked!</p>
                    <p className="text-[11px]">
                      Scheduled: <strong>{lead.bookingStatus.date}</strong> at{' '}
                      <strong>{lead.bookingStatus.timeSlot}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Follow-up Date Banner (if set) */}
              {followUpDate && (
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  isFollowUpOverdue
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-purple-50 border-purple-200 text-purple-800'
                }`}>
                  <AlarmClock className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs">
                      {isFollowUpOverdue ? '⚠️ Follow-up Overdue!' : '📅 Next Follow-up'}
                    </p>
                    <p className="text-[11px]">
                      {new Date(followUpDate).toLocaleDateString('en-IN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Lead Score */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Award className="w-4 h-4 text-[#1B7A9C]" />
                    <span>Lead Score: {lead.leadScore} / 14</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                    {lead.priority} Priority
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200">
                  <div>12th Status: <strong>+{lead.scoreBreakdown?.status12Score || 0}</strong> ({lead.status12})</div>
                  <div>Timeline: <strong>+{lead.scoreBreakdown?.decisionTimeScore || 0}</strong> ({lead.decisionTime})</div>
                  <div>Parent Contact: <strong>+{lead.scoreBreakdown?.parentPhoneScore || 0}</strong> ({lead.parentPhone ? 'Yes' : 'No'})</div>
                  <div>Budget Band: <strong>+{lead.scoreBreakdown?.budgetScore || 0}</strong> ({lead.budget})</div>
                  <div>Course Worry: <strong>+{lead.scoreBreakdown?.worryScore || 0}</strong> ({lead.worry})</div>
                  <div>Completion: <strong>+{lead.scoreBreakdown?.completionScore || 2}</strong> (100%)</div>
                </div>
              </div>

              {/* Academic Profile */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#14305E]" />
                  Academic & Interest Profile
                </h4>
                <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs">
                  <div><span className="text-slate-400 block">Stream:</span><span className="font-semibold text-slate-800">{lead.stream}</span></div>
                  <div><span className="text-slate-400 block">Percentage:</span><span className="font-semibold text-slate-800">{lead.percentage}</span></div>
                  <div><span className="text-slate-400 block">Archetype:</span><span className="font-semibold text-[#14305E]">{lead.profileName} ({lead.profileCode})</span></div>
                  <div><span className="text-slate-400 block">Exams:</span><span className="font-semibold text-slate-800">{lead.entranceExams?.join(', ') || 'None'}</span></div>
                  <div><span className="text-slate-400 block">Budget:</span><span className="font-semibold text-slate-800">{lead.budget}</span></div>
                  <div><span className="text-slate-400 block">Location:</span><span className="font-semibold text-slate-800">{lead.preferredLocation}</span></div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#14305E]" />
                  Contact Information
                </h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Mobile:</span><span className="font-semibold">{lead.phone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="font-semibold truncate max-w-[200px]">{lead.email}</span></div>
                  {lead.parentPhone && (
                    <div className="flex justify-between"><span className="text-slate-400">Parent:</span><span className="font-semibold">{lead.parentPhone}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-400">Filled by:</span><span className="font-semibold">{lead.fillerType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Created:</span><span className="font-semibold text-slate-500">{new Date(lead.createdAt).toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Internal Notes</h4>
                  {savedNote && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add follow-up notes, college choices discussed, parent concerns..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          )}

          {/* ══ TAB: ACTIVITY & FOLLOW-UPS ══ */}
          {activeTab === 'activity' && (
            <div className="p-4 sm:p-5 space-y-5">

              {/* ── Follow-up Date Scheduler ── */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-purple-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlarmClock className="w-4 h-4" />
                  Schedule Next Follow-up
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 text-xs border border-purple-300 bg-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-semibold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleSaveFollowUp}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    {followUpSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    {followUpSaved ? 'Saved!' : 'Set Date'}
                  </button>
                </div>
                {followUpDate && (
                  <p className={`text-[11px] font-semibold flex items-center gap-1 ${isFollowUpOverdue ? 'text-rose-600' : 'text-purple-600'}`}>
                    {isFollowUpOverdue ? '⚠️ This follow-up is overdue!' : `📅 Follow-up on ${new Date(followUpDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                )}
              </div>

              {/* ── Log a New Call / Interaction ── */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#1B7A9C]" />
                  Log an Interaction
                </h4>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">Outcome</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_OUTCOMES.map((outcome) => {
                      const meta = OUTCOME_META[outcome];
                      return (
                        <button
                          key={outcome}
                          type="button"
                          onClick={() => setNewOutcome(outcome)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border text-left flex items-center gap-1.5 transition-all ${
                            newOutcome === outcome
                              ? meta.color + ' ring-2 ring-offset-1 ring-current'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{meta.emoji}</span>
                          <span className="truncate">{outcome}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">Notes / Details</label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="What was discussed? Any commitments or next steps?"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddLogEntry}
                  disabled={!newNote.trim() || isSavingLog}
                  className="w-full py-2 bg-[#1B7A9C] hover:bg-[#14305E] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  {logSaved ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> Entry Saved!</>
                  ) : (
                    <><Plus className="w-3.5 h-3.5" /> Add to Call Log</>
                  )}
                </button>
              </div>

              {/* ── Call Log Timeline ── */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Interaction History
                  </span>
                  <span className="text-slate-400 font-normal normal-case">{callLog.length} entries</span>
                </h4>

                {callLog.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No interactions logged yet.</p>
                    <p className="text-[11px] mt-1">Log your first call or WhatsApp above.</p>
                  </div>
                ) : (
                  <div className="space-y-2 relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

                    {callLog.map((entry) => {
                      const meta = OUTCOME_META[entry.outcome];
                      return (
                        <div key={entry.id} className="flex gap-3 relative">
                          {/* Timeline dot */}
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shrink-0 z-10 ${meta.color}`}>
                            {meta.emoji}
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                                  {entry.outcome}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteLogEntry(entry.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{entry.note}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.timestamp).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
