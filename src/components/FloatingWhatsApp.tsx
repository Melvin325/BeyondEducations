import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import {
  ContactSettings,
  getLocalContactSettings,
  subscribeToContactSettings,
  cleanPhoneForWhatsApp,
} from '../lib/contactService';

interface FloatingWhatsAppProps {
  selectedHub?: string;
  selectedLevel?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  selectedHub,
  selectedLevel,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customMsg, setCustomMsg] = useState<string>('');
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() =>
    getLocalContactSettings()
  );

  useEffect(() => {
    const unsub = subscribeToContactSettings((newSettings) => {
      setContactSettings(newSettings);
    });
    return () => {
      unsub();
    };
  }, []);

  const phoneClean = cleanPhoneForWhatsApp(contactSettings.whatsappNumber);

  const getDefaultMessage = () => {
    if (contactSettings.whatsappWelcomeMessage) {
      let msg = contactSettings.whatsappWelcomeMessage;
      if (selectedLevel && selectedLevel !== 'all') {
        msg += ` (${selectedLevel.toUpperCase()})`;
      }
      if (selectedHub && selectedHub !== 'All') {
        msg += ` [Hub: ${selectedHub}]`;
      }
      return msg;
    }
    let msg = `Hi BeyondEducations, I would like admissions counselling`;
    if (selectedLevel && selectedLevel !== 'all') {
      msg += ` for ${selectedLevel.toUpperCase()} programs`;
    }
    if (selectedHub && selectedHub !== 'All') {
      msg += ` in ${selectedHub}`;
    }
    msg += `. Please share details.`;
    return msg;
  };

  const handleOpenWhatsApp = (messageText?: string) => {
    const textToSend = messageText || customMsg.trim() || getDefaultMessage();
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Mini Popup Dialog */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#14305E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  BE
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#14305E] absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">BeyondEducations Counsellor</h4>
                <p className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      contactSettings.counsellorStatus === 'online'
                        ? 'bg-emerald-400 animate-pulse'
                        : contactSettings.counsellorStatus === 'busy'
                        ? 'bg-amber-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {contactSettings.counsellorStatus === 'online'
                      ? 'Online'
                      : contactSettings.counsellorStatus === 'busy'
                      ? 'Busy'
                      : 'Away'}{' '}
                    · {contactSettings.responseTimeText || 'Replies in ~5 mins'}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-4 bg-slate-50 space-y-2 text-xs">
            <p className="text-slate-600 font-medium">Quick options to chat about:</p>
            <div className="space-y-1.5">
              {(contactSettings.quickPrompts && contactSettings.quickPrompts.length > 0
                ? contactSettings.quickPrompts
                : [
                    '🎓 Direct UG Admissions (BTech / MBBS / BBA)',
                    '🏛️ MBA & PGDM Admissions (Bangalore & Kerala)',
                    '✈️ Study Abroad (UK, Ireland, Germany, Australia)',
                    '💰 Fee structures & scholarship quotas',
                  ]
              ).map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOpenWhatsApp(`Hi, I want information about: ${opt}`)}
                  className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-[#25D366] text-slate-700 font-semibold transition-all shadow-2xs hover:bg-emerald-50/50"
                >
                  {opt}
                </button>
              ))}
            </div>


            {/* Custom Input */}
            <div className="pt-2 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Type your question..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpenWhatsApp();
                }}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-xs transition-all active:scale-95"
                title="Send on WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 border-2 border-white"
        title="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
        <span className="w-2.5 h-2.5 rounded-full bg-white" />
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-extrabold hidden sm:inline tracking-wide">
          Chat with Counsellor
        </span>
      </button>
    </div>
  );
};
