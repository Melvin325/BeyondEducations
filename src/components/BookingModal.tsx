import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateLeadInCounsellorList, saveLeadToCounsellorList } from '../lib/storage';
import { fbCreateConsultation } from '../lib/firebase';
import { Lead } from '../data/demoLeads';
import { Calendar, Clock, Video, MapPin, X, CheckCircle2, User, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onBookingComplete?: (date: string, timeSlot: string) => void;
}

const TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '04:00 PM',
  '05:30 PM',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  lead,
  onBookingComplete,
}) => {
  const { t } = useTranslation();

  // Tomorrow as default date formatted YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [mode, setMode] = useState<'online' | 'in_person'>('online');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setFormError(null);

    const nameToUse = lead?.name || guestName.trim();
    const phoneToUse = lead?.phone || guestPhone.trim();

    if (!nameToUse) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!phoneToUse || phoneToUse.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }

    const leadIdToUse = lead?.id || `lead-consult-${Date.now()}`;

    if (lead) {
      updateLeadInCounsellorList(lead.id, {
        status: 'Counselling booked',
        bookingStatus: {
          booked: true,
          date: selectedDate,
          timeSlot: selectedSlot,
        },
      });
    } else {
      // Save new direct consultation lead
      const newConsultLead: Lead = {
        id: leadIdToUse,
        name: nameToUse,
        phone: phoneToUse,
        fillerType: 'Student',
        language: 'en',
        stream: 'Direct Consultation Request',
        priority: 'Hot',
        status: 'Counselling booked',
        leadScore: 12,
        dimensionScores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        scoreBreakdown: {
          status12Score: 3,
          decisionTimeScore: 3,
          parentPhoneScore: 0,
          budgetScore: 2,
          worryScore: 2,
          completionScore: 2,
          total: 12,
        },
        createdAt: new Date().toISOString(),
        bookingStatus: {
          booked: true,
          date: selectedDate,
          timeSlot: selectedSlot,
        },
        internalNotes: `Direct 1-on-1 consultation booking (${mode === 'online' ? 'Google Meet / Video' : 'Indiranagar Office'})`,
      };
      saveLeadToCounsellorList(newConsultLead);
    }

    // Persist in Firebase Firestore
    fbCreateConsultation({
      leadId: leadIdToUse,
      studentName: nameToUse,
      phone: phoneToUse,
      preferredDate: selectedDate,
      timeSlot: selectedSlot,
      counsellingMode: mode,
    }).catch((err) => console.warn('Firebase consultation sync warning:', err));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setIsSuccess(true);
    if (onBookingComplete) {
      onBookingComplete(selectedDate, selectedSlot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#14305E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#F2A12B]" />
            <h3 className="font-bold text-base sm:text-lg">
              {t('booking.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!isSuccess ? (
            <>
              <p className="text-xs sm:text-sm text-slate-600">
                {t('booking.subtitle')}
              </p>

              {/* Guest name and phone inputs if booked directly from homepage */}
              {!lead && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student / Parent Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Suhas Rao"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Consultation Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('booking.mode_label')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('online')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      mode === 'online'
                        ? 'border-[#1B7A9C] bg-[#1B7A9C]/10 text-[#14305E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#1B7A9C]" />
                    <span>{t('booking.mode_online')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('in_person')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      mode === 'in_person'
                        ? 'border-[#1B7A9C] bg-[#1B7A9C]/10 text-[#14305E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#F2A12B]" />
                    <span>{t('booking.mode_in_person')}</span>
                  </button>
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('booking.select_date')}
                </label>
                <input
                  type="date"
                  min={defaultDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B7A9C] focus:outline-hidden"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('booking.select_time')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#14305E] text-white border-[#14305E] font-semibold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{t('booking.confirm_btn')}</span>
              </button>
            </>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                {t('booking.success_title')}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                {t('booking.success_message')}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-medium inline-block border border-slate-200">
                📅 {selectedDate} at ⏰ {selectedSlot} ({mode === 'online' ? 'Google Meet' : 'Indiranagar, Bengaluru'})
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-[#14305E] text-white text-xs font-semibold rounded-lg hover:bg-[#1B7A9C]"
                >
                  {t('booking.close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
