import React, { useState, useEffect } from 'react';
import {
  FastTrackQuestion,
  FastTrackOption,
  getLocalFastTrackQuestions,
  saveFastTrackQuestion,
  deleteFastTrackQuestion,
  resetFastTrackQuestionsToDefault,
  subscribeToFastTrackQuestions,
} from '../../lib/fastTrackService';
import { isFirebaseConfigured } from '../../lib/firebase';
import {
  Building,
  Globe2,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Check,
  X,
  Search,
  Radio,
  Database,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const FastTrackQuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<FastTrackQuestion[]>(() =>
    getLocalFastTrackQuestions()
  );
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pg' | 'abroad'>('all');
  const [search, setSearch] = useState<string>('');
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(() => isFirebaseConfigured());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<FastTrackQuestion | null>(null);
  const [formData, setFormData] = useState<Partial<FastTrackQuestion>>({
    category: 'pg',
    order: 1,
    title: '',
    subtitle: '',
    type: 'single',
    options: [],
    active: true,
  });
  const [optionsInput, setOptionsInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToFastTrackQuestions((liveList) => {
      setQuestions(liveList);
      setIsFirebaseLive(isFirebaseConfigured());
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      category: categoryFilter === 'all' ? 'pg' : categoryFilter,
      order: questions.length + 1,
      title: '',
      subtitle: '',
      type: 'single',
      options: [],
      active: true,
    });
    setOptionsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: FastTrackQuestion) => {
    setEditingQuestion(q);
    setFormData({ ...q });
    const formattedOptions = q.options.map((o) => o.label).join('\n');
    setOptionsInput(formattedOptions);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (q: FastTrackQuestion) => {
    try {
      const updated: FastTrackQuestion = { ...q, active: !q.active };
      await saveFastTrackQuestion(updated);
      showToast(`Question ${updated.active ? 'activated' : 'hidden'}`);
    } catch {
      showToast('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteFastTrackQuestion(id);
        showToast('Question deleted');
      } catch {
        showToast('Failed to delete');
      }
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Reset all PG & Study Abroad fast-track questions to default state? Custom edits will be overwritten.'
      )
    ) {
      try {
        await resetFastTrackQuestionsToDefault();
        showToast('Reset to defaults');
      } catch {
        showToast('Error resetting questions');
      }
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Question title is required');
      return;
    }

    setIsSaving(true);
    try {
      // Parse options from textarea
      const lines = optionsInput
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const parsedOptions: FastTrackOption[] = lines.map((line) => ({
        value: line,
        label: line,
      }));

      const id = editingQuestion ? editingQuestion.id : `${formData.category}-${Date.now()}`;

      const questionToSave: FastTrackQuestion = {
        id,
        category: (formData.category as 'pg' | 'abroad') || 'pg',
        order: Number(formData.order) || 1,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || undefined,
        type: 'single',
        options: parsedOptions.length > 0 ? parsedOptions : (formData.options || []),
        active: formData.active !== false,
      };

      await saveFastTrackQuestion(questionToSave);
      showToast(editingQuestion ? 'Question updated' : 'New question added');
      setIsModalOpen(false);
    } catch {
      showToast('Error saving question');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.subtitle ? q.subtitle.toLowerCase().includes(search.toLowerCase()) : false);
    return matchesCategory && matchesSearch;
  });

  const pgCount = questions.filter((q) => q.category === 'pg').length;
  const abroadCount = questions.filter((q) => q.category === 'abroad').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header card */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#14305E]">
                PG &amp; Study Abroad Fast-Track Questions
              </h2>
              {isFirebaseLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Database className="w-3 h-3 text-amber-600" />
                  Local Storage
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Control the questions asked to Masters/MBA applicants and Study Abroad aspirants. Changes reflect live on the homepage modals in real-time.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#F2A12B]" />
              <span>Add Fast-Track Question</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#14305E] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('pg')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'pg'
                  ? 'bg-[#14305E] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-[#F2A12B]" />
              <span>PG / Masters ({pgCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('abroad')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === 'abroad'
                  ? 'bg-[#1B7A9C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-white" />
              <span>Study Abroad ({abroadCount})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#1B7A9C]"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              q.active ? 'border-slate-200/90 shadow-2xs' : 'border-slate-200/50 bg-slate-50/50 opacity-60'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    q.category === 'pg'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {q.category === 'pg' ? 'Postgraduate' : 'Study Abroad'}
                </span>
                <span className="text-xs font-bold text-slate-400">Order #{q.order}</span>
                {!q.active && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Hidden
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900">{q.title}</h4>
              {q.subtitle && <p className="text-xs text-slate-500">{q.subtitle}</p>}

              {/* Options Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {q.options.map((opt, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                  >
                    {opt.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleActive(q)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  q.active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-100'
                }`}
                title={q.active ? 'Question is Live (Click to hide)' : 'Question is Hidden (Click to activate)'}
              >
                {q.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(q)}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                title="Edit Question & Options"
              >
                <Edit3 className="w-4 h-4 text-[#14305E]" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(q.id)}
                className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold">No fast-track questions found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or click "Add Fast-Track Question"</p>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 sm:p-6 bg-[#14305E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#F2A12B] uppercase tracking-wider">
                  {editingQuestion ? 'Edit Fast-Track Question' : 'New Fast-Track Question'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {formData.category === 'pg' ? 'Postgraduate (PG) Question' : 'Study Abroad Question'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="pg">Postgraduate (PG / Masters)</option>
                    <option value="abroad">Study Abroad (Global)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Which Postgraduate Course do you want to pursue?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Helper Hint</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Select your target higher education specialization"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Options (1 per line)</label>
                  <span className="text-[10px] text-slate-400">Press enter for each option</span>
                </div>
                <textarea
                  rows={5}
                  value={optionsInput}
                  onChange={(e) => setOptionsInput(e.target.value)}
                  placeholder="MBA / PGDM&#10;MCA (Computer Applications)&#10;MTech (Data Science)&#10;MSc / Others"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 leading-relaxed font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active !== false}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#14305E] border-slate-300"
                />
                <label htmlFor="activeCheck" className="font-bold text-slate-700 cursor-pointer">
                  Question is active and visible in the modal
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#14305E] hover:bg-[#1B7A9C] text-white font-bold transition-all shadow-xs"
                >
                  {isSaving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
