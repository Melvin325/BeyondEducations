import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Question, QuestionOption, RiasecType } from '../../data/questions';
import {
  getLocalQuestions,
  saveQuestion,
  deleteQuestion,
  resetQuestionsToDefault,
  subscribeToQuestions,
} from '../../lib/questionService';
import { isFirebaseConfigured } from '../../lib/firebase';
import {
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Check,
  X,
  Search,
  Radio,
  Database,
  Sliders,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const QuestionManager: React.FC = () => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>(() => getLocalQuestions());
  const [partFilter, setPartFilter] = useState<'All' | 'A' | 'B' | 'C'>('All');
  const [search, setSearch] = useState<string>('');
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(() => isFirebaseConfigured());

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({
    part: 'A',
    type: 'rating',
    riasecType: 'R',
    titleKey: '',
    title: '',
    subtitleKey: '',
    subtitle: '',
    options: [],
    active: true,
  });
  const [optionsInput, setOptionsInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to live questions in Firestore
  useEffect(() => {
    const unsub = subscribeToQuestions((liveList) => {
      setQuestions(liveList);
      setIsFirebaseLive(isFirebaseConfigured());
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getQuestionDisplayTitle = (q: Question) => {
    if (q.title && q.title.trim()) return q.title;
    if (q.titleKey) {
      const translated = t(q.titleKey);
      return translated !== q.titleKey ? translated : q.titleKey;
    }
    return `Question #${q.id}`;
  };

  const getQuestionDisplaySubtitle = (q: Question) => {
    if (q.subtitle && q.subtitle.trim()) return q.subtitle;
    if (q.subtitleKey) {
      const translated = t(q.subtitleKey);
      return translated !== q.subtitleKey ? translated : '';
    }
    return '';
  };

  const openAddModal = () => {
    const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    setEditingQuestion(null);
    setFormData({
      id: nextId,
      part: 'A',
      type: 'rating',
      riasecType: 'R',
      title: '',
      subtitle: '',
      active: true,
      options: [],
    });
    setOptionsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    const existingTitle = q.title || t(q.titleKey);
    const existingSubtitle = q.subtitle || (q.subtitleKey ? t(q.subtitleKey) : '');
    const optionsText = (q.options || [])
      .map((opt) => opt.label || (opt.labelKey ? t(opt.labelKey) : opt.value))
      .join('\n');

    setFormData({
      ...q,
      title: existingTitle,
      subtitle: existingSubtitle,
    });
    setOptionsInput(optionsText);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (q: Question) => {
    const updated: Question = { ...q, active: q.active === false ? true : false };
    await saveQuestion(updated);
    showToast(`Question #${q.id} status updated.`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete Question #${id}?`)) {
      await deleteQuestion(id);
      showToast(`Question #${id} deleted.`);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all quiz questions back to original verified RIASEC bank (23 questions)?')) {
      const reset = await resetQuestionsToDefault();
      setQuestions(reset);
      showToast('Questions reset to original bank.');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Please enter a question title.');
      return;
    }

    setIsSaving(true);

    let parsedOptions: QuestionOption[] | undefined = undefined;
    if (formData.type === 'single' || formData.type === 'multi') {
      const lines = optionsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      if (lines.length > 0) {
        parsedOptions = lines.map((line, idx) => ({
          value: line.replace(/\s+/g, '_').toLowerCase(),
          label: line,
          labelKey: `custom.option.${idx}`,
        }));
      }
    }

    const qToSave: Question = {
      id: editingQuestion ? editingQuestion.id : (formData.id || Date.now()),
      part: formData.part || 'A',
      type: formData.type || 'rating',
      riasecType: formData.riasecType || undefined,
      title: formData.title.trim(),
      titleKey: editingQuestion?.titleKey || `custom.q.${formData.id}.title`,
      subtitle: formData.subtitle?.trim() || undefined,
      subtitleKey: editingQuestion?.subtitleKey,
      options: parsedOptions || editingQuestion?.options,
      subFields: editingQuestion?.subFields,
      active: formData.active !== false,
    };

    await saveQuestion(qToSave);
    setIsSaving(false);
    setIsModalOpen(false);
    showToast(`Saved Question #${qToSave.id}.`);
  };

  // Filtered list
  const filtered = questions.filter((q) => {
    const title = getQuestionDisplayTitle(q).toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase()) || q.id.toString() === search.trim();
    const matchesPart = partFilter === 'All' || q.part === partFilter;
    return matchesSearch && matchesPart;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#14305E] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#14305E]">
              Quiz Questions Manager
            </h2>
            {isFirebaseLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Firestore Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Database className="w-3 h-3" />
                Local Cache
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fully customize the student assessment questions, RIASEC career dimensions, options, and active status in real time.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95"
            title="Restore original 23 questions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#F2A12B]" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Part Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(
            [
              { key: 'All', label: `All (${questions.length})` },
              { key: 'A', label: `Part A: RIASEC (${questions.filter((q) => q.part === 'A').length})` },
              { key: 'B', label: `Part B: Academic (${questions.filter((q) => q.part === 'B').length})` },
              { key: 'C', label: `Part C: Constraints (${questions.filter((q) => q.part === 'C').length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPartFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                partFilter === tab.key
                  ? 'bg-white text-[#14305E] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by question text or #ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B7A9C]/30"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No questions found</p>
          </div>
        ) : (
          filtered.map((q) => {
            const title = getQuestionDisplayTitle(q);
            const subtitle = getQuestionDisplaySubtitle(q);
            const isActive = q.active !== false;

            return (
              <div
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isActive ? 'border-slate-200/90 shadow-2xs' : 'border-slate-200/50 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#14305E] text-white flex items-center justify-center text-xs font-extrabold">
                      {q.id}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B7A9C]/10 text-[#1B7A9C]">
                      Part {q.part}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                      {q.type}
                    </span>

                    {q.riasecType && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F2A12B]/20 text-[#14305E] border border-[#F2A12B]/40">
                        RIASEC: {q.riasecType}
                      </span>
                    )}

                    {!isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        Hidden from Quiz
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {title}
                  </h4>

                  {subtitle && (
                    <p className="text-xs text-slate-500">
                      {subtitle}
                    </p>
                  )}

                  {/* Options Preview for Single/Multi */}
                  {q.options && q.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {q.options.slice(0, 5).map((opt, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                        >
                          {opt.label || (opt.labelKey ? t(opt.labelKey) : opt.value)}
                        </span>
                      ))}
                      {q.options.length > 5 && (
                        <span className="text-[10px] text-slate-400">
                          +{q.options.length - 5} more options
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(q)}
                    className={`p-2 rounded-xl transition-all shadow-2xs ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                    title={isActive ? 'Click to hide question from students' : 'Click to show in quiz'}
                  >
                    {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="p-2 bg-slate-100 hover:bg-[#1B7A9C] hover:text-white text-slate-600 rounded-xl transition-all shadow-2xs"
                    title="Edit question text and options"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition-all shadow-2xs"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-[#14305E]">
                {editingQuestion ? `Edit Question #${editingQuestion.id}` : 'Add New Question'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* Question Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Question Title (Prompts to student) *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. I enjoy working with my hands, building physical things or machines."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B7A9C]/30 resize-none"
                />
              </div>

              {/* Subtitle / Hint */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subtitle / Hint (Optional)</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Rate on scale from 1 (Not me) to 5 (Very me)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Part & Type Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Part</label>
                  <select
                    value={formData.part}
                    onChange={(e) => setFormData({ ...formData, part: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="A">Part A (RIASEC Rating)</option>
                    <option value="B">Part B (Academic / Work Pref)</option>
                    <option value="C">Part C (Constraints &amp; Budget)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Question Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="rating">1-5 Rating Scale</option>
                    <option value="single">Single Choice</option>
                    <option value="multi">Multiple Selection</option>
                  </select>
                </div>
              </div>

              {/* RIASEC Type */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">RIASEC Category (For Part A Scoring)</label>
                <select
                  value={formData.riasecType || ''}
                  onChange={(e) => setFormData({ ...formData, riasecType: e.target.value as RiasecType })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="">None / Not Applicable</option>
                  <option value="R">R - Realistic (Hands-on, Practical, Tools, Machines)</option>
                  <option value="I">I - Investigative (Analytical, Research, Science, Logic)</option>
                  <option value="A">A - Artistic (Creative, Design, Music, Writing, Media)</option>
                  <option value="S">S - Social (Helping, Healthcare, Teaching, People)</option>
                  <option value="E">E - Enterprising (Business, Leadership, Sales, Startups)</option>
                  <option value="C">C - Conventional (Data, Finance, Systems, Accounting)</option>
                </select>
              </div>

              {/* Options (for single/multi) */}
              {(formData.type === 'single' || formData.type === 'multi') && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Options (One option per line)</label>
                  <textarea
                    rows={4}
                    value={optionsInput}
                    onChange={(e) => setOptionsInput(e.target.value)}
                    placeholder="Engineering / Technology&#10;Management / Business&#10;Medical & Health Sciences&#10;Design & Media"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheckbox"
                  checked={formData.active !== false}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#14305E] focus:ring-[#1B7A9C]"
                />
                <label htmlFor="isActiveCheckbox" className="font-bold text-slate-700 cursor-pointer">
                  Show this question in the live assessment
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
