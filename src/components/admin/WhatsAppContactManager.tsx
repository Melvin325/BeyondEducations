import React, { useState, useEffect } from 'react';
import {
  ContactSettings,
  getLocalContactSettings,
  getContactSettingsAsync,
  saveContactSettings,
  resetContactSettings,
  cleanPhoneForWhatsApp,
} from '../../lib/contactService';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Radio,
  ShieldCheck,
} from 'lucide-react';

export const WhatsAppContactManager: React.FC = () => {
  const [settings, setSettings] = useState<ContactSettings>(() => getLocalContactSettings());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLiveCloud, setIsLiveCloud] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New quick prompt state for adding
  const [newPromptText, setNewPromptText] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    getContactSettingsAsync().then(({ settings: fetched, isLive }) => {
      if (mounted) {
        setSettings(fetched);
        setIsLiveCloud(isLive);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const cleanWa = cleanPhoneForWhatsApp(settings.whatsappNumber);
      if (cleanWa.length < 10) {
        setFeedback({
          type: 'error',
          message: 'Please provide a valid 10-digit WhatsApp phone number.',
        });
        setIsSaving(false);
        return;
      }

      const res = await saveContactSettings(settings);
      setIsLiveCloud(res.isLive);
      setFeedback({
        type: 'success',
        message: res.isLive
          ? 'WhatsApp number & contact details saved to Firebase Firestore and updated live on the website!'
          : 'Settings updated locally and will sync to Firebase once online.',
      });
    } catch (err) {
      console.error('Error saving contact settings:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to save settings. Please verify network permissions.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset WhatsApp number and contact info to official brand defaults?')) {
      setIsSaving(true);
      try {
        const defaulted = await resetContactSettings();
        setSettings(defaulted);
        setFeedback({
          type: 'success',
          message: 'Reset to brand defaults successfully.',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddPrompt = () => {
    if (!newPromptText.trim()) return;
    setSettings((prev) => ({
      ...prev,
      quickPrompts: [...prev.quickPrompts, newPromptText.trim()],
    }));
    setNewPromptText('');
  };

  const handleRemovePrompt = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      quickPrompts: prev.quickPrompts.filter((_, i) => i !== index),
    }));
  };

  const testWaUrl = `https://wa.me/${cleanPhoneForWhatsApp(settings.whatsappNumber)}?text=${encodeURIComponent(
    settings.whatsappWelcomeMessage || 'Hi BeyondEducations, test message from admin'
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#25D366] flex items-center justify-center shadow-xs">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#14305E] flex items-center gap-2">
                <span>WhatsApp &amp; Contact Helpline Manager</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Full CRUD
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Change the destination WhatsApp number, helpline phone, email, and live status anytime. Updates take effect immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isLiveCloud
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            {isLiveCloud ? 'Live in Firestore Cloud' : 'Local Storage Sync'}
          </span>

          <a
            href={testWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-all active:scale-95"
            title="Open test chat to verify destination"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test WhatsApp Link</span>
          </a>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: WhatsApp Configuration */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MessageCircle className="w-5 h-5 text-[#25D366] fill-current" />
              <h3 className="font-extrabold text-[#14305E] text-sm">
                Primary WhatsApp Configuration
              </h3>
            </div>

            {/* WhatsApp Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>WhatsApp Business Number *</span>
                <span className="text-[10px] text-slate-400">
                  Clean link: wa.me/{cleanPhoneForWhatsApp(settings.whatsappNumber)}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                You can write with or without spaces and country code (e.g. <code>+91 98450 12345</code> or <code>9845012345</code>).
              </p>
            </div>

            {/* Default Welcome Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Default Pre-Filled Message (When Student Clicks Chat)
              </label>
              <textarea
                rows={2}
                value={settings.whatsappWelcomeMessage}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappWelcomeMessage: e.target.value })
                }
                placeholder="Hi BeyondEducations, I would like admissions counselling..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/40"
              />
              <p className="text-[11px] text-slate-500">
                This is the default text automatically typed into the student's WhatsApp window.
              </p>
            </div>

            {/* Counsellor Status & Response Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Counsellor Status
                </label>
                <select
                  value={settings.counsellorStatus}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      counsellorStatus: e.target.value as 'online' | 'busy' | 'away',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="online">🟢 Online (Active)</option>
                  <option value="busy">🟡 High Inflow (Busy)</option>
                  <option value="away">⚪ After Hours (Away)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Response Time Badge Text
                </label>
                <input
                  type="text"
                  value={settings.responseTimeText}
                  onChange={(e) =>
                    setSettings({ ...settings, responseTimeText: e.target.value })
                  }
                  placeholder="Replies in ~5 mins"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Floating WhatsApp Quick Prompts CRUD */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Popup Quick Inquiries (Options shown in WhatsApp widget)</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {settings.quickPrompts.length} prompt chips
                </span>
              </label>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {settings.quickPrompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <span className="font-medium text-slate-800 truncate">{prompt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrompt(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Prompt */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="e.g. 🎓 Direct MBBS / BDS Admission Inquiry"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrompt();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="px-3 py-1.5 bg-[#14305E] hover:bg-[#1B7A9C] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Helpline Phone, Email & Physical Office */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Phone className="w-5 h-5 text-[#1B7A9C]" />
              <h3 className="font-extrabold text-[#14305E] text-sm">
                Helpline, Email &amp; Office Details
              </h3>
            </div>

            {/* Helpline Calling Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1B7A9C]" />
                <span>Calling Helpline Number (Used in Callbacks &amp; Header)</span>
              </label>
              <input
                type="text"
                required
                value={settings.callingPhone}
                onChange={(e) =>
                  setSettings({ ...settings, callingPhone: e.target.value })
                }
                placeholder="+91 98450 12345"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Admissions Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1B7A9C]" />
                <span>Official Admissions Email</span>
              </label>
              <input
                type="email"
                required
                value={settings.admissionsEmail}
                onChange={(e) =>
                  setSettings({ ...settings, admissionsEmail: e.target.value })
                }
                placeholder="admissions@beyondeducations.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Office Working Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1B7A9C]" />
                <span>Counselling Operating Hours</span>
              </label>
              <input
                type="text"
                value={settings.counsellorWorkingHours}
                onChange={(e) =>
                  setSettings({ ...settings, counsellorWorkingHours: e.target.value })
                }
                placeholder="9:00 AM - 9:00 PM (Mon - Sun)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Physical Office Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1B7A9C]" />
                <span>Bengaluru Head Office Address</span>
              </label>
              <textarea
                rows={3}
                value={settings.officeAddress}
                onChange={(e) =>
                  setSettings({ ...settings, officeAddress: e.target.value })
                }
                placeholder="Indiranagar 100ft Road, Bengaluru, Karnataka 560038"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-extrabold text-[#14305E] block">
                👀 Live Student Contact Card Preview
              </span>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div>
                  <strong>WhatsApp:</strong> {settings.whatsappNumber}
                </div>
                <div>
                  <strong>Phone:</strong> {settings.callingPhone}
                </div>
                <div>
                  <strong>Email:</strong> {settings.admissionsEmail}
                </div>
                <div>
                  <strong>Hours:</strong> {settings.counsellorWorkingHours}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Last updated: {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'Just now'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#F2A12B]" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
