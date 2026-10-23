import React, { useState } from 'react';
import { Lead, LeadStatus } from '../data/demoLeads';
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
} from 'lucide-react';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ lead, onClose, onLeadUpdated }) => {
  if (!lead) return null;

  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState<string>(lead.notes || '');
  const [savedNote, setSavedNote] = useState<boolean>(false);

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

  const priorityColor = {
    Hot: 'bg-rose-100 text-rose-800 border-rose-300',
    Warm: 'bg-amber-100 text-amber-800 border-amber-300',
    Cold: 'bg-blue-100 text-blue-800 border-blue-300',
  }[lead.priority];

  const waNumber = lead.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(
    `Hello ${lead.name}, this is your academic advisor from BeyondEducations in Bengaluru regarding your Career Interest Quiz report.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#14305E] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{lead.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                {lead.priority} Lead
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#F2A12B]" />
              {lead.city} · Lang: {lead.language.toUpperCase()} · {lead.fillerType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Call, WhatsApp, Status */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#F2A12B]" />
              <span>Call ({lead.phone})</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Status Dropdown */}
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-5 text-xs sm:text-sm">
          {/* Booking Banner if booked */}
          {lead.bookingStatus?.booked && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 text-amber-900">
              <Calendar className="w-5 h-5 text-[#F2A12B] flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">Counselling Session Booked!</p>
                <p className="text-[11px]">
                  Scheduled for: <strong>{lead.bookingStatus.date}</strong> at{' '}
                  <strong>{lead.bookingStatus.timeSlot}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Lead Score Breakdown Card */}
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
              <div>
                12th Status: <strong>+{lead.scoreBreakdown?.status12Score || 0}</strong> ({lead.status12})
              </div>
              <div>
                Timeline: <strong>+{lead.scoreBreakdown?.decisionTimeScore || 0}</strong> ({lead.decisionTime})
              </div>
              <div>
                Parent Contact: <strong>+{lead.scoreBreakdown?.parentPhoneScore || 0}</strong> ({lead.parentPhone ? 'Yes' : 'No'})
              </div>
              <div>
                Budget Band: <strong>+{lead.scoreBreakdown?.budgetScore || 0}</strong> ({lead.budget})
              </div>
              <div>
                Course Worry: <strong>+{lead.scoreBreakdown?.worryScore || 0}</strong> ({lead.worry})
              </div>
              <div>
                Completion: <strong>+{lead.scoreBreakdown?.completionScore || 2}</strong> (100%)
              </div>
            </div>
          </div>

          {/* Academic & Profile Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#14305E]" />
              Academic & Interest Profile
            </h4>
            <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Stream:</span>
                <span className="font-semibold text-slate-800">{lead.stream}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Percentage Band:</span>
                <span className="font-semibold text-slate-800">{lead.percentage}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Archetype:</span>
                <span className="font-semibold text-[#14305E]">
                  {lead.profileName} ({lead.profileCode})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Exams:</span>
                <span className="font-semibold text-slate-800">
                  {lead.entranceExams?.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Budget:</span>
                <span className="font-semibold text-slate-800">{lead.budget}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location Preference:</span>
                <span className="font-semibold text-slate-800">{lead.preferredLocation}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#14305E]" />
              Contact Information
            </h4>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile:</span>
                <span className="font-semibold text-slate-800">{lead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">{lead.email}</span>
              </div>
              {lead.parentPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Parent Mobile:</span>
                  <span className="font-semibold text-slate-800">{lead.parentPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Filled by:</span>
                <span className="font-semibold text-slate-800">{lead.fillerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="font-semibold text-slate-500">
                  {new Date(lead.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Counsellor Internal Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Internal Counsellor Notes
              </h4>
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
              placeholder="Add follow-up notes, discussion points, college choices discussed..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              className="px-3 py-1.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
