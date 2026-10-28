import React, { useState, useEffect } from 'react';
import { College, CollegeCategory, CollegeRegion, EducationLevel, INITIAL_COLLEGES } from '../../data/colleges';
import {
  getLocalColleges,
  saveCollege,
  deleteCollege,
  resetCollegesToDefault,
  subscribeToColleges,
} from '../../lib/collegeService';
import { isFirebaseConfigured } from '../../lib/firebase';
import {
  Plus,
  Search,
  Building,
  MapPin,
  Edit2,
  Trash2,
  Star,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Award,
  Radio,
  Database,
  Filter,
} from 'lucide-react';

export const CollegeManager: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>(() => getLocalColleges());
  const [search, setSearch] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [partnerOnly, setPartnerOnly] = useState<boolean>(false);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(() => isFirebaseConfigured());

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState<Partial<College>>({
    name: '',
    location: '',
    region: 'Karnataka (Bangalore)',
    category: 'Private',
    levels: ['UG'],
    popularFor: [],
    indicativeFee: '₹2.0L - ₹4.0L / yr',
    isPartner: true,
    accreditation: 'NAAC A+ Accredited',
    website: '',
    featured: false,
  });
  const [coursesInput, setCoursesInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to live Firestore updates
  useEffect(() => {
    const unsub = subscribeToColleges((liveList) => {
      setColleges(liveList);
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

  const openAddModal = () => {
    setEditingCollege(null);
    setFormData({
      name: '',
      location: '',
      region: 'Karnataka (Bangalore)',
      category: 'Private',
      levels: ['UG'],
      popularFor: ['BTech CSE', 'BBA'],
      indicativeFee: '₹2.5L - ₹4.5L / yr',
      isPartner: true,
      accreditation: 'NAAC A+ Accredited',
      website: '',
      featured: false,
    });
    setCoursesInput('BTech CSE, BBA');
    setIsModalOpen(true);
  };

  const openEditModal = (col: College) => {
    setEditingCollege(col);
    setFormData({ ...col });
    setCoursesInput((col.popularFor || []).join(', '));
    setIsModalOpen(true);
  };

  const handleTogglePartner = async (col: College) => {
    const updated: College = { ...col, isPartner: !col.isPartner };
    await saveCollege(updated);
    showToast(`Updated ${col.name} partner status.`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      await deleteCollege(id);
      showToast(`Removed ${name}.`);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset colleges list to default verified list (20+ institutions)?')) {
      const reset = await resetCollegesToDefault();
      setColleges(reset);
      showToast('Colleges reset to verified defaults.');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.location?.trim()) {
      alert('Please fill out college name and location.');
      return;
    }

    setIsSaving(true);
    const popularCourses = coursesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const collegeToSave: College = {
      id: editingCollege ? editingCollege.id : `col-${Date.now()}`,
      name: formData.name.trim(),
      location: formData.location.trim(),
      region: (formData.region as CollegeRegion) || 'Karnataka (Bangalore)',
      category: (formData.category as CollegeCategory) || 'Private',
      levels: (formData.levels as EducationLevel[]) || ['UG'],
      popularFor: popularCourses.length > 0 ? popularCourses : ['Undergraduate Programs'],
      indicativeFee: formData.indicativeFee?.trim() || '₹1.5L - ₹3.5L / yr',
      isPartner: Boolean(formData.isPartner),
      accreditation: formData.accreditation?.trim() || undefined,
      website: formData.website?.trim() || undefined,
      featured: Boolean(formData.featured),
    };

    await saveCollege(collegeToSave);
    setIsSaving(false);
    setIsModalOpen(false);
    showToast(`Successfully saved ${collegeToSave.name}.`);
  };

  const toggleLevel = (lvl: EducationLevel) => {
    const current = formData.levels || [];
    if (current.includes(lvl)) {
      if (current.length > 1) {
        setFormData({ ...formData, levels: current.filter((l) => l !== lvl) });
      }
    } else {
      setFormData({ ...formData, levels: [...current, lvl] });
    }
  };

  // Filtered colleges list
  const filteredColleges = colleges.filter((col) => {
    const matchesSearch =
      col.name.toLowerCase().includes(search.toLowerCase()) ||
      col.location.toLowerCase().includes(search.toLowerCase()) ||
      (col.popularFor || []).some((c) => c.toLowerCase().includes(search.toLowerCase()));

    const matchesRegion = regionFilter === 'All' || col.region === regionFilter;
    const matchesLevel = levelFilter === 'All' || (col.levels || []).includes(levelFilter as EducationLevel);
    const matchesPartner = !partnerOnly || col.isPartner;

    return matchesSearch && matchesRegion && matchesLevel && matchesPartner;
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
              Colleges &amp; Universities Manager
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
            Manage all partner colleges BeyondEducations works with across Karnataka (Bangalore), Kerala, Tamil Nadu, Pan-India &amp; Study Abroad destinations.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95"
            title="Reset to default verified colleges"
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
            <span>Add New College</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Tracked</span>
          <span className="text-2xl font-extrabold text-[#14305E]">{colleges.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Institutions in system</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Direct Partners</span>
          <span className="text-2xl font-extrabold text-[#1B7A9C]">
            {colleges.filter((c) => c.isPartner).length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Verified MoUs</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">South India Hubs</span>
          <span className="text-2xl font-extrabold text-amber-600">
            {colleges.filter((c) => ['Karnataka (Bangalore)', 'Kerala', 'Tamil Nadu'].includes(c.region)).length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">BLR · Kerala · TN</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Study Abroad &amp; Pan-India</span>
          <span className="text-2xl font-extrabold text-indigo-600">
            {colleges.filter((c) => ['Study Abroad', 'Pan-India'].includes(c.region)).length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">UK, EU, AUS, USA &amp; National</span>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search college by name, location, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B7A9C]/30 focus:border-[#1B7A9C]"
            />
          </div>

          {/* Level Filter (UG / PG / Abroad) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'UG', 'PG', 'Study Abroad'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  levelFilter === lvl
                    ? 'bg-white text-[#14305E] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Partner Only Toggle */}
          <button
            type="button"
            onClick={() => setPartnerOnly(!partnerOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              partnerOnly
                ? 'bg-[#14305E] text-[#F2A12B] border-[#14305E]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${partnerOnly ? 'fill-current' : ''}`} />
            <span>Partners Only</span>
          </button>
        </div>

        {/* Region Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Region:
          </span>
          {['All', 'Karnataka (Bangalore)', 'Kerala', 'Tamil Nadu', 'Pan-India', 'Study Abroad'].map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setRegionFilter(reg)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                regionFilter === reg
                  ? 'bg-[#1B7A9C] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {reg === 'Karnataka (Bangalore)' ? 'Bangalore / Karnataka' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Colleges List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Showing {filteredColleges.length} of {colleges.length} colleges</span>
          <span className="text-[11px] text-slate-400 font-normal">Click star to toggle official partner status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredColleges.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No colleges match your filters</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setRegionFilter('All');
                  setLevelFilter('All');
                  setPartnerOnly(false);
                }}
                className="text-xs text-[#1B7A9C] font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredColleges.map((col) => (
              <div
                key={col.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Main Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-base font-bold text-slate-900">{col.name}</span>

                    {/* Partner Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePartner(col)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all ${
                        col.isPartner
                          ? 'bg-[#14305E] text-[#F2A12B] border-[#14305E] shadow-2xs'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                      title="Click to toggle partner status"
                    >
                      <Star className={`w-3 h-3 ${col.isPartner ? 'fill-[#F2A12B]' : ''}`} />
                      <span>{col.isPartner ? 'Partner' : 'Tracked'}</span>
                    </button>

                    {/* Region Badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B7A9C]/10 text-[#1B7A9C]">
                      {col.region}
                    </span>

                    {/* Category Badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {col.category}
                    </span>
                  </div>

                  {/* Location & Accreditations */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {col.location}
                    </span>
                    {col.accreditation && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {col.accreditation}
                      </span>
                    )}
                  </div>

                  {/* Popular Courses & Indicative Fee */}
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#14305E] mr-2">
                      Fee: {col.indicativeFee}
                    </span>
                    <span className="text-slate-300">|</span>
                    {col.levels.map((lvl) => (
                      <span
                        key={lvl}
                        className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700"
                      >
                        {lvl}
                      </span>
                    ))}
                    {(col.popularFor || []).slice(0, 3).map((crs, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        {crs}
                      </span>
                    ))}
                    {(col.popularFor || []).length > 3 && (
                      <span className="text-[10px] text-slate-400">
                        +{col.popularFor.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(col)}
                    className="p-2 bg-slate-100 hover:bg-[#1B7A9C] hover:text-white text-slate-600 rounded-xl transition-all shadow-2xs"
                    title="Edit college"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(col.id, col.name)}
                    className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition-all shadow-2xs"
                    title="Delete college"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit College Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-[#14305E]">
                {editingCollege ? 'Edit College Details' : 'Add New Partner College'}
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
              {/* College Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">College / University Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Christ University or SRM Institute"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B7A9C]/30"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Location (City, State / Country) *</label>
                <input
                  type="text"
                  required
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mysuru Road, Bengaluru, Karnataka"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B7A9C]/30"
                />
              </div>

              {/* Region & Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Region / Hub</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as CollegeRegion })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Karnataka (Bangalore)">Karnataka (Bangalore)</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Pan-India">Pan-India</option>
                    <option value="Study Abroad">Study Abroad</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CollegeCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Private">Private</option>
                    <option value="Deemed">Deemed</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="Government">Government</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              {/* Levels Offered (UG, PG, Study Abroad checkboxes) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Offerings / Degrees</label>
                <div className="flex items-center gap-3">
                  {(['UG', 'PG', 'Study Abroad'] as EducationLevel[]).map((lvl) => {
                    const isChecked = (formData.levels || []).includes(lvl);
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => toggleLevel(lvl)}
                        className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
                          isChecked
                            ? 'bg-[#14305E] text-white border-[#14305E]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#F2A12B]" />}
                        <span>{lvl}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Indicative Fee Range */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Indicative Fee Range</label>
                <input
                  type="text"
                  value={formData.indicativeFee || ''}
                  onChange={(e) => setFormData({ ...formData, indicativeFee: e.target.value })}
                  placeholder="e.g. ₹2.5L - ₹4.5L / yr or £14,000 / yr"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Popular Courses (Comma-separated) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Popular Courses (comma-separated)</label>
                <input
                  type="text"
                  value={coursesInput}
                  onChange={(e) => setCoursesInput(e.target.value)}
                  placeholder="BTech CSE, MBA, BBA, Data Science, MBBS"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Accreditation / Ranking */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Accreditation / Ranking Note</label>
                <input
                  type="text"
                  value={formData.accreditation || ''}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  placeholder="e.g. NAAC A++ · NIRF Top 50 · 2-Year Post Study Visa"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Official Partner Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPartnerCheckbox"
                  checked={Boolean(formData.isPartner)}
                  onChange={(e) => setFormData({ ...formData, isPartner: e.target.checked })}
                  className="w-4 h-4 rounded text-[#14305E] focus:ring-[#1B7A9C]"
                />
                <label htmlFor="isPartnerCheckbox" className="font-bold text-slate-700 cursor-pointer">
                  Mark as Verified Direct Partner Institution
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
                  {isSaving ? 'Saving...' : editingCollege ? 'Save Changes' : 'Add College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
