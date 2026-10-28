import React, { useState, useEffect, useMemo } from 'react';
import { FaqItem, INITIAL_FAQS } from '../../data/testimonialsFaq';
import {
  getLocalFaqs,
  getFaqsAsync,
  saveFaq,
  deleteFaq,
  resetFaqsToDefault,
} from '../../lib/faqService';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Radio,
  Eye,
  EyeOff,
  Filter,
  Save,
  X,
  BookOpen,
} from 'lucide-react';

const CATEGORIES: Array<FaqItem['category']> = [
  'General',
  'Admissions & Quota',
  'Fees & Scholarships',
  'UG & PG',
  'Study Abroad',
];

export const FaqManager: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(() => getLocalFaqs());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveCloud, setIsLiveCloud] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [audienceFilter, setAudienceFilter] = useState<string>('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FaqItem>>({
    question: '',
    answer: '',
    category: 'General',
    order: 1,
    isActive: true,
    targetAudience: 'All',
  });

  // Expanded FAQ accordion previews
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { faqs: list, isLive } = await getFaqsAsync();
      setFaqs(list);
      setIsLiveCloud(isLive);
    } catch (err) {
      console.warn('Failed loading FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order || 0)) + 1 : 1;
    setEditingFaq(null);
    setFormData({
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      category: 'General',
      order: nextOrder,
      isActive: true,
      targetAudience: 'All',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FaqItem) => {
    setEditingFaq(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question?.trim() || !formData.answer?.trim()) {
      setFeedback({ type: 'error', message: 'Question and answer are both required.' });
      return;
    }

    const itemToSave: FaqItem = {
      id: formData.id || `faq-${Date.now()}`,
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      category: formData.category || 'General',
      order: Number(formData.order) || 1,
      isActive: formData.isActive !== false,
      targetAudience: formData.targetAudience || 'All',
    };

    try {
      await saveFaq(itemToSave);
      setFaqs((prev) => {
        const exists = prev.some((f) => f.id === itemToSave.id);
        const updated = exists
          ? prev.map((f) => (f.id === itemToSave.id ? itemToSave : f))
          : [...prev, itemToSave];
        return updated.sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: `FAQ "${itemToSave.question.slice(0, 35)}..." saved successfully!`,
      });
    } catch (err) {
      console.error('Failed saving FAQ:', err);
      setFeedback({ type: 'error', message: 'Could not save FAQ to database.' });
    }
  };

  const handleDelete = async (faq: FaqItem) => {
    if (!window.confirm(`Delete the FAQ "${faq.question}"?`)) return;

    try {
      await deleteFaq(faq.id);
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      setFeedback({
        type: 'success',
        message: 'FAQ removed from landing page.',
      });
    } catch (err) {
      console.error('Failed deleting FAQ:', err);
      setFeedback({ type: 'error', message: 'Could not delete FAQ.' });
    }
  };

  const handleToggleActive = async (faq: FaqItem) => {
    const updated: FaqItem = { ...faq, isActive: !faq.isActive };
    await saveFaq(updated);
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Reset FAQ bank to the standard 8 BeyondEducations FAQs? Any custom questions added will be overwritten.'
      )
    ) {
      setIsLoading(true);
      try {
        const defaulted = await resetFaqsToDefault();
        setFaqs(defaulted);
        setFeedback({
          type: 'success',
          message: 'Reset FAQs to system defaults successfully.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const qText = (f.question || '').toLowerCase();
      const aText = (f.answer || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || qText.includes(query) || aText.includes(query);
      const matchesCategory = categoryFilter === 'All' || f.category === categoryFilter;
      const matchesAudience = audienceFilter === 'All' || f.targetAudience === audienceFilter;

      return matchesSearch && matchesCategory && matchesAudience;
    });
  }, [faqs, searchQuery, categoryFilter, audienceFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#14305E] flex items-center justify-center shadow-xs">
            <HelpCircle className="w-6 h-6 text-[#1B7A9C]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14305E] flex items-center gap-2">
              <span>Frequently Asked Questions (FAQ) Manager</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Full CRUD
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage parent &amp; student questions on management quota, scholarships, direct admissions, and study abroad.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Reset to 8 default FAQs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#F2A12B]" />
            <span>Add New FAQ</span>
          </button>
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

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Categories ({faqs.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({faqs.filter((f) => f.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">Audience:</span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Audiences</option>
              <option value="Parents">Parents Only</option>
              <option value="Students">Students Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* FAQ Cards List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No FAQs matching your search criteria.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all shadow-2xs ${
                  faq.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      #{faq.order || idx + 1}
                    </span>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#14305E]/10 text-[#14305E]">
                          {faq.category || 'General'}
                        </span>
                        {faq.targetAudience && faq.targetAudience !== 'All' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {faq.targetAudience}
                          </span>
                        )}
                        {!faq.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                            Hidden from Home
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="text-sm font-extrabold text-[#14305E] cursor-pointer hover:text-[#1B7A9C] transition-colors leading-snug"
                      >
                        {faq.question}
                      </h4>

                      {isExpanded ? (
                        <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100 animate-in fade-in">
                          {faq.answer}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 truncate cursor-pointer" onClick={() => setExpandedId(faq.id)}>
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(faq)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        faq.isActive
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-slate-200 text-slate-400 bg-slate-50 hover:bg-slate-100'
                      }`}
                      title={faq.isActive ? 'Currently Live on Landing Page' : 'Currently Hidden'}
                    >
                      {faq.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(faq)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#14305E] transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(faq)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="p-2 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#14305E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#F2A12B]" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Question Text *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can we get admission without COMEDK / KCET rank?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Answer Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Yes, private engineering colleges in Bangalore reserve institutional quota seats for students based on 12th standard PCM marks..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1B7A9C]/40 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as FaqItem['category'] })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value as 'All' | 'Parents' | 'Students',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    <option value="All">All Audiences</option>
                    <option value="Parents">Parents Perspective</option>
                    <option value="Students">Student Perspective</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-md text-[#14305E] border-slate-300 focus:ring-0"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-700 cursor-pointer">
                  Display this FAQ publicly on the landing page
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#14305E] hover:bg-[#1B7A9C] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#F2A12B]" />
                  <span>{editingFaq ? 'Update FAQ' : 'Create FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
