import React, { useState, useMemo } from 'react';
import { Lead } from '../../data/demoLeads';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';

interface AppointmentCalendarProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];

function parseDateStr(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  // Handle formats like "15 Nov 2026" or "2026-11-15"
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}

interface AppointmentEntry {
  lead: Lead;
  date: Date;
  timeSlot: string;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ leads, onSelectLead }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'day'>('month');

  // Extract all booked appointments
  const appointments = useMemo<AppointmentEntry[]>(() => {
    const list: AppointmentEntry[] = [];
    for (const lead of leads) {
      if (lead.bookingStatus?.booked && lead.bookingStatus.date) {
        const date = parseDateStr(lead.bookingStatus.date);
        if (date) {
          list.push({ lead, date, timeSlot: lead.bookingStatus.timeSlot || '' });
        }
      }
    }
    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [leads]);

  // Also extract follow-up appointments
  const followUps = useMemo<AppointmentEntry[]>(() => {
    const list: AppointmentEntry[] = [];
    for (const lead of leads) {
      if (lead.followUpDate) {
        const date = parseDateStr(lead.followUpDate);
        if (date) {
          list.push({ lead, date, timeSlot: 'Follow-up' });
        }
      }
    }
    return list;
  }, [leads]);

  const allEvents = useMemo(() => [...appointments, ...followUps], [appointments, followUps]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const getEventsForDay = (day: number) => {
    return allEvents.filter((a) => {
      return (
        a.date.getFullYear() === currentYear &&
        a.date.getMonth() === currentMonth &&
        a.date.getDate() === day
      );
    });
  };

  const getEventsForSelectedDay = () => {
    if (!selectedDay) return [];
    return allEvents.filter((a) => {
      return (
        a.date.getFullYear() === selectedDay.getFullYear() &&
        a.date.getMonth() === selectedDay.getMonth() &&
        a.date.getDate() === selectedDay.getDate()
      );
    });
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDay?.getFullYear() === currentYear &&
      selectedDay?.getMonth() === currentMonth &&
      selectedDay?.getDate() === day
    );
  };

  const priorityDot = (p: string) => ({
    Hot: 'bg-rose-500',
    Warm: 'bg-amber-400',
    Cold: 'bg-blue-400',
  }[p] || 'bg-slate-400');

  const upcomingAppointments = appointments
    .filter((a) => a.date >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .slice(0, 5);

  const overdueFollowUps = followUps.filter(
    (f) => f.date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const selectedDayEvents = getEventsForSelectedDay();

  return (
    <div className="space-y-4">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Booked</span>
          <span className="text-2xl font-extrabold text-[#14305E]">{appointments.length}</span>
          <span className="text-[10px] text-slate-400">Counselling sessions</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">This Month</span>
          <span className="text-2xl font-extrabold text-[#1B7A9C]">
            {appointments.filter((a) => a.date.getMonth() === today.getMonth() && a.date.getFullYear() === today.getFullYear()).length}
          </span>
          <span className="text-[10px] text-slate-400">{MONTHS[today.getMonth()]} sessions</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-500 uppercase block">Follow-ups Set</span>
          <span className="text-2xl font-extrabold text-amber-600">{followUps.length}</span>
          <span className="text-[10px] text-slate-400">Scheduled reminders</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-500 uppercase block">Overdue</span>
          <span className="text-2xl font-extrabold text-rose-600">{overdueFollowUps.length}</span>
          <span className="text-[10px] text-rose-400">Follow-ups past due</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Calendar Grid ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-800">{MONTHS[currentMonth]} {currentYear}</h3>
              <p className="text-[11px] text-slate-400">{allEvents.filter((a) => a.date.getMonth() === currentMonth && a.date.getFullYear() === currentYear).length} events this month</p>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-400 pb-1">{d}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px">
            {/* Empty leading cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const hasBooking = dayEvents.some((e) => e.timeSlot !== 'Follow-up');
              const hasFollowUp = dayEvents.some((e) => e.timeSlot === 'Follow-up');

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(new Date(currentYear, currentMonth, day));
                  }}
                  className={`h-16 sm:h-20 p-1 rounded-xl flex flex-col items-center gap-0.5 transition-all border ${
                    isSelected(day)
                      ? 'bg-[#14305E] text-white border-[#14305E] shadow-md'
                      : isToday(day)
                      ? 'bg-[#1B7A9C]/10 text-[#1B7A9C] border-[#1B7A9C]/30 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected(day) ? 'text-white' : ''}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-col gap-0.5 w-full px-0.5 mt-0.5">
                      {hasBooking && (
                        <div className={`h-1 rounded-full ${isSelected(day) ? 'bg-[#F2A12B]' : 'bg-[#F2A12B]'}`} />
                      )}
                      {hasFollowUp && (
                        <div className={`h-1 rounded-full ${isSelected(day) ? 'bg-purple-300' : 'bg-purple-400'}`} />
                      )}
                      <span className={`text-[9px] font-bold ${isSelected(day) ? 'text-white/70' : 'text-slate-400'}`}>
                        {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#F2A12B] inline-block" /> Counselling Session</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-purple-400 inline-block" /> Follow-up Reminder</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1B7A9C] inline-block" /> Today</span>
          </div>
        </div>

        {/* ── Side Panel: Selected Day / Upcoming ── */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          {selectedDay && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#14305E]" />
                {selectedDay.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>

              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No events on this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((evt, idx) => {
                    const isFollowUp = evt.timeSlot === 'Follow-up';
                    return (
                      <div
                        key={`${evt.lead.id}-${idx}`}
                        onClick={() => onSelectLead?.(evt.lead)}
                        className={`p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${
                          isFollowUp
                            ? 'bg-purple-50 border-purple-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-xs text-slate-800">{evt.lead.name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              {isFollowUp ? (
                                <><Clock className="w-3 h-3 text-purple-400" /> Follow-up reminder</>
                              ) : (
                                <><Clock className="w-3 h-3 text-amber-400" /> {evt.timeSlot}</>
                              )}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            { Hot: 'bg-rose-100 text-rose-700 border-rose-200', Warm: 'bg-amber-100 text-amber-700 border-amber-200', Cold: 'bg-blue-100 text-blue-700 border-blue-200' }[evt.lead.priority]
                          }`}>
                            {evt.lead.priority}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {evt.lead.phone}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {evt.lead.city}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          <GraduationCap className="w-2.5 h-2.5 inline mr-0.5" /> {evt.lead.stream}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1B7A9C]" />
              Upcoming Sessions
            </h4>
            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No upcoming bookings.</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map((appt, idx) => (
                  <div
                    key={`upcom-${appt.lead.id}-${idx}`}
                    onClick={() => onSelectLead?.(appt.lead)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className={`w-2 h-8 rounded-full shrink-0 ${priorityDot(appt.lead.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-800 truncate">{appt.lead.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {appt.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {appt.timeSlot}
                      </p>
                    </div>
                    <a
                      href={`tel:${appt.lead.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-[#14305E]/10 hover:bg-[#14305E] text-[#14305E] hover:text-white transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue Follow-ups */}
          {overdueFollowUps.length > 0 && (
            <div className="bg-rose-50 rounded-2xl border border-rose-200 shadow-xs p-4 space-y-3">
              <h4 className="font-extrabold text-rose-700 text-sm flex items-center gap-2">
                ⚠️ Overdue Follow-ups
              </h4>
              <div className="space-y-2">
                {overdueFollowUps.map((f, idx) => (
                  <div
                    key={`overdue-${f.lead.id}-${idx}`}
                    onClick={() => onSelectLead?.(f.lead)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-rose-200 cursor-pointer hover:shadow-xs transition-all"
                  >
                    <div className="w-2 h-6 rounded-full bg-rose-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-800 truncate">{f.lead.name}</p>
                      <p className="text-[11px] text-rose-500">
                        Due: {f.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/91${f.lead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
