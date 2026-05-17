import { useState, useMemo, useRef } from 'react';
import { 
  GraduationCap, Search, ChevronDown, Plus, Eye, Edit, Trash2, X, 
  CheckCircle, Download, Loader2, PlayCircle, BookOpen, FileText, 
  Award, Target, HelpCircle, Check, Calendar, ToggleLeft, ToggleRight, ArrowRight, ArrowLeft,
  Users
} from 'lucide-react';
import { 
  useAdminListLmsModules, 
  useAdminLmsModuleDetail, 
  useAdminCreateLmsModule, 
  useAdminUpdateLmsModule, 
  useAdminDeleteLmsModule, 
  useAdminListSkills,
} from '@/features/admin/api/admin.api';
import type { LmsModule, LmsQuestion } from '@/features/admin/api/admin.api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { ReportShell } from '@/features/reports/components/ReportShell';
import { AdminLmsReport } from '@/features/reports/components/AdminLmsReport';
import { downloadReportAsPdf } from '@/features/reports/utils/downloadPdf';
import { format } from 'date-fns';

const CATEGORIES = ['Translation', 'Marketing', 'Data Entry', 'QA Testing', 'AI & Data Labeling', 'Research'];

export default function AdminLms() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [skillId, setSkillId] = useState('');
  const [isActive, setIsActive] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formStep, setFormStep] = useState<1 | 2>(1);
  
  // Quiz Form State
  const [formData, setFormData] = useState({
    title: '',
    skillId: '',
    videoUrl: '',
    docUrl: '',
    passScore: 80,
    isActive: true,
  });
  
  const [formQuestions, setFormQuestions] = useState<LmsQuestion[]>([
    {
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    }
  ]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 400);
  
  const params = useMemo(() => ({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    category: category || undefined,
    skillId: skillId || undefined,
    isActive: isActive !== '' ? isActive : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [page, debouncedSearch, category, skillId, isActive, startDate, endDate]);

  const { data: lmsData, isLoading, refetch } = useAdminListLmsModules(params);
  const { data: skills } = useAdminListSkills();
  const { data: moduleDetail, isLoading: detailLoading } = useAdminLmsModuleDetail(selectedModuleId);

  const createMutation = useAdminCreateLmsModule();
  const updateMutation = useAdminUpdateLmsModule();
  const deleteMutation = useAdminDeleteLmsModule();

  const modules = lmsData?.modules || [];
  const pagination = lmsData?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Overall statistics aggregated from current filters
  const stats = useMemo(() => {
    if (!lmsData?.modules) return { total: 0, active: 0, attempts: 0, avgPassRate: 0, avgScore: 0 };
    const list = lmsData.modules;
    const activeCount = list.filter(m => m.isActive).length;
    const totalAttempts = list.reduce((sum, m) => sum + (m.stats?.totalCompletions || 0), 0);
    const passedAttempts = list.reduce((sum, m) => sum + (m.stats?.passedCompletions || 0), 0);
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
    
    // Average score calculation: weighted average score of the modules
    const totalScoreWeight = list.reduce((sum, m) => sum + ((m.stats?.avgScore || 0) * (m.stats?.totalCompletions || 0)), 0);
    const avgScore = totalAttempts > 0 ? totalScoreWeight / totalAttempts : 0;
    
    return {
      total: list.length,
      active: activeCount,
      attempts: totalAttempts,
      avgPassRate: passRate,
      avgScore: avgScore
    };
  }, [lmsData]);

  // Skill name helper
  const selectedSkillName = useMemo(() => {
    if (!skillId || !skills) return '';
    return skills.find(s => s.id === skillId)?.name || '';
  }, [skillId, skills]);

  const handleDownloadReport = async () => {
    if (!reportRef.current || !modules || modules.length === 0) {
      toast.error('No learning modules to export.');
      return;
    }
    setDownloading(true);
    try {
      await downloadReportAsPdf(reportRef.current, `WeraLink-Admin-LMS-Portfolio`);
      toast.success('LMS Portfolio PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate portfolio PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSkillId('');
    setIsActive('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const openDetail = (id: string) => {
    setSelectedModuleId(id);
  };

  // Quiz Form Management
  const openCreateForm = () => {
    setFormMode('create');
    setFormData({
      title: '',
      skillId: skills?.[0]?.id || '',
      videoUrl: '',
      docUrl: '',
      passScore: 80,
      isActive: true,
    });
    setFormQuestions([
      {
        text: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]);
    setFormStep(1);
    setShowFormModal(true);
  };

  const openEditForm = (mod: LmsModule) => {
    setFormMode('edit');
    setSelectedModuleId(mod.id);
    setFormData({
      title: mod.title,
      skillId: mod.skillId,
      videoUrl: mod.videoUrl || '',
      docUrl: mod.docUrl || '',
      passScore: mod.passScore,
      isActive: mod.isActive,
    });
    
    // Fetch detailed questions
    if (mod.questions) {
      setFormQuestions(mod.questions);
    } else {
      // Default placeholder if questions weren't loaded
      setFormQuestions([
        {
          text: '',
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]);
    }
    
    setFormStep(1);
    setShowFormModal(true);
  };

  // Sync questions if detailed moduleDetail finishes loading in Edit mode
  useMemo(() => {
    if (showFormModal && formMode === 'edit' && moduleDetail && selectedModuleId === moduleDetail.id) {
      if (moduleDetail.questions) {
        setFormQuestions(moduleDetail.questions);
      }
    }
  }, [moduleDetail, showFormModal, formMode, selectedModuleId]);

  const handleAddQuestion = () => {
    setFormQuestions(prev => [
      ...prev,
      {
        text: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (formQuestions.length <= 1) {
      toast.warning('A skill assessment module must have at least one question.');
      return;
    }
    setFormQuestions(prev => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      copy[qIndex].text = text;
      return copy;
    });
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      copy[qIndex].options[oIndex].text = text;
      return copy;
    });
  };

  const handleOptionCorrectChange = (qIndex: number, oIndex: number) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      copy[qIndex].options = copy[qIndex].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === oIndex
      }));
      return copy;
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Module title is required.');
      return false;
    }
    if (!formData.skillId) {
      toast.error('Associated skill is required.');
      return false;
    }
    if (formData.passScore < 10 || formData.passScore > 100) {
      toast.error('Pass score must be between 10% and 100%.');
      return false;
    }

    // Questions validation
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} text is empty.`);
        return false;
      }
      if (q.options.length < 2) {
        toast.error(`Question ${i + 1} must have at least two options.`);
        return false;
      }
      
      let hasCorrect = false;
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        if (!o.text.trim()) {
          toast.error(`Option ${j + 1} in Question ${i + 1} is empty.`);
          return false;
        }
        if (o.isCorrect) hasCorrect = true;
      }
      
      if (!hasCorrect) {
        toast.error(`Question ${i + 1} must have exactly one correct option marked.`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    const payload = {
      title: formData.title,
      skillId: formData.skillId,
      videoUrl: formData.videoUrl || undefined,
      docUrl: formData.docUrl || undefined,
      passScore: formData.passScore,
      isActive: formData.isActive,
      questions: formQuestions.map(q => ({
        text: q.text,
        options: q.options.map(o => ({
          text: o.text,
          isCorrect: o.isCorrect
        }))
      }))
    };

    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync(payload);
        toast.success('Training module created successfully!');
      } else {
        if (!selectedModuleId) return;
        await updateMutation.mutateAsync({ moduleId: selectedModuleId, payload });
        toast.success('Training module updated successfully!');
      }
      setShowFormModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  // Toggle module active status instantly
  const handleToggleActive = async (mod: LmsModule) => {
    try {
      await updateMutation.mutateAsync({
        moduleId: mod.id,
        payload: { isActive: !mod.isActive }
      });
      toast.success(`Module is now ${!mod.isActive ? 'Active' : 'Inactive'}`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed');
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteModuleId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModuleId) return;
    try {
      await deleteMutation.mutateAsync(deleteModuleId);
      toast.success('Training module deleted successfully!');
      setShowDeleteModal(false);
      setDeleteModuleId(null);
      if (selectedModuleId === deleteModuleId) {
        setSelectedModuleId(null);
      }
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 text-text-main">
      
      {/* Hidden printing shell */}
      <div className="absolute -left-[9999px] top-0 opacity-0 overflow-hidden" aria-hidden="true">
        <ReportShell ref={reportRef} title="LMS Portfolio Report">
          <AdminLmsReport 
            modules={modules} 
            filters={{ 
              search, category, skillId, skillName: selectedSkillName, isActive, startDate, endDate 
            }} 
          />
        </ReportShell>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-stitch-primary/10 p-3 rounded-2xl border border-stitch-primary/20">
            <GraduationCap className="w-7 h-7 text-stitch-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stitch-bg-dark tracking-tight">Learning Hub Command Center</h1>
            <p className="text-text-main/50 text-sm font-medium">Create, edit, and audit skill verification modules and worker completions</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadReport}
            disabled={downloading || modules.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Portfolio
          </button>
          
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-stitch-primary text-white hover:bg-stitch-primary/95 text-sm font-black rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      {/* Statistics Panels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-text-main/40 text-xs font-black uppercase tracking-wider block mb-1">Total Courses</span>
            <span className="text-2xl font-black text-stitch-bg-dark">{stats.total}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl"><BookOpen className="w-5 h-5 text-blue-500" /></div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-text-main/40 text-xs font-black uppercase tracking-wider block mb-1">Active Courses</span>
            <span className="text-2xl font-black text-emerald-600">{stats.active}</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl"><PlayCircle className="w-5 h-5 text-emerald-500" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-text-main/40 text-xs font-black uppercase tracking-wider block mb-1">Total Attempts</span>
            <span className="text-2xl font-black text-[#EF626C]">{stats.attempts}</span>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-xl"><Award className="w-5 h-5 text-[#EF626C]" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-text-main/40 text-xs font-black uppercase tracking-wider block mb-1">Avg Test Score</span>
            <span className="text-2xl font-black text-purple-600">
              {stats.avgScore ? `${stats.avgScore.toFixed(1)}%` : '0%'}
            </span>
            <span className="text-[10px] text-text-main/40 block mt-0.5 font-bold">
              Pass Rate: {stats.avgPassRate.toFixed(1)}%
            </span>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-xl"><Target className="w-5 h-5 text-purple-500" /></div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
            <input
              type="text" 
              placeholder="Search courses by title..."
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-stitch-primary/20 focus:border-stitch-primary outline-none transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setSkillId(''); setPage(1); }}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-semibold focus:ring-2 focus:ring-stitch-primary/20 outline-none cursor-pointer text-slate-800"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Associated Skills Dropdown */}
          <div className="relative">
            <select 
              value={skillId} 
              onChange={(e) => { setSkillId(e.target.value); setPage(1); }}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-semibold focus:ring-2 focus:ring-stitch-primary/20 outline-none cursor-pointer text-slate-800"
            >
              <option value="">All Skill Focus</option>
              {skills?.filter(s => !category || s.category === category).map(sk => (
                <option key={sk.id} value={sk.id}>{sk.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select 
              value={isActive} 
              onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-semibold focus:ring-2 focus:ring-stitch-primary/20 outline-none cursor-pointer text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(search || category || skillId || isActive || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-text-main/50 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Filter Posted Dates:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-stitch-primary/20 outline-none cursor-pointer"
            />
            <span className="text-text-main/30 font-medium">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-stitch-primary/20 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Content (Table + Detail Drawer) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Table Container */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          
          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-stitch-primary mx-auto mb-4" />
              <p className="text-text-main/50 font-bold text-sm">Fetching LMS directory...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-slate-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-stitch-bg-dark mb-1">No learning modules found</h3>
              <p className="text-text-main/50 text-sm max-w-sm mx-auto mb-4">No skill assessments match your applied filters. Clear filters to see available courses.</p>
              <button 
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-stitch-bg-dark rounded-xl transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-text-main/40 font-black text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Course details</th>
                    <th className="py-4 px-6">Associated Skill</th>
                    <th className="py-4 px-6 text-center">Questions</th>
                    <th className="py-4 px-6 text-center">completions</th>
                    <th className="py-4 px-6 text-center">avg score / rate</th>
                    <th className="py-4 px-6 text-center">Active</th>
                    <th className="py-4 px-6 text-right">actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {modules.map((mod) => (
                    <tr 
                      key={mod.id} 
                      className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${selectedModuleId === mod.id ? 'bg-slate-50' : ''}`}
                      onClick={() => openDetail(mod.id)}
                    >
                      <td className="py-4 px-6">
                        <p className="font-black text-stitch-bg-dark line-clamp-1 group-hover:text-stitch-primary transition-colors">{mod.title}</p>
                        <p className="text-[10px] text-text-main/40 mt-0.5">Posted {format(new Date(mod.createdAt), 'MMM dd, yyyy')}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs font-bold text-stitch-bg-dark">{mod.skill?.name}</p>
                        <p className="text-[10px] text-[#EF626C] font-black uppercase tracking-wider">{mod.skill?.category.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-800">{mod._count?.questions || 0}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">
                          {mod.stats?.totalCompletions || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <p className="text-xs font-black text-stitch-bg-dark">{mod.stats?.avgScore ? `${mod.stats.avgScore.toFixed(0)}%` : '0%'}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">
                          Pass: {mod.stats?.passRate ? `${mod.stats.passRate.toFixed(0)}%` : '0%'}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleToggleActive(mod)}
                          className="hover:scale-105 transition-transform"
                        >
                          {mod.isActive ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openDetail(mod.id)}
                            title="Inspect Details"
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-all border border-slate-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditForm(mod)}
                            title="Edit quiz questions"
                            className="p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-all border border-slate-100 hover:border-indigo-200"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(mod.id)}
                            title="Delete Module"
                            className="p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg text-red-600 transition-all border border-slate-100 hover:border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-text-main/50">
                Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total courses)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Details Slide Drawer */}
        {selectedModuleId && (
          <div className="w-full xl:w-[450px] bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-6 animate-in slide-in-from-right duration-300 relative">
            <button 
              onClick={() => setSelectedModuleId(null)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-50 rounded-lg text-text-main/30 hover:text-text-main transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {detailLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-stitch-primary mx-auto mb-2" />
                <p className="text-xs font-bold text-text-main/40">Loading module specifications...</p>
              </div>
            ) : !moduleDetail ? (
              <div className="py-20 text-center text-text-main/40">Module information is missing.</div>
            ) : (
              <>
                {/* Drawer Header */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="bg-stitch-primary/10 text-stitch-primary text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded">
                      {moduleDetail.skill?.category.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${moduleDetail.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-250'}`}>
                      {moduleDetail.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-stitch-bg-dark leading-snug">{moduleDetail.title}</h3>
                  <p className="text-xs text-text-main/50 font-bold mt-1">Focus Skill: <span className="text-stitch-primary">{moduleDetail.skill?.name}</span></p>
                </div>

                {/* Audit quick stats */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-center border-r border-slate-150">
                    <span className="text-[9px] font-black text-text-main/40 uppercase block tracking-wider">Attempts</span>
                    <span className="text-sm font-black text-stitch-bg-dark">{moduleDetail.stats?.totalCompletions || 0}</span>
                  </div>
                  <div className="text-center border-r border-slate-150">
                    <span className="text-[9px] font-black text-text-main/40 uppercase block tracking-wider">Avg Score</span>
                    <span className="text-sm font-black text-[#EF626C]">
                      {moduleDetail.stats?.avgScore ? `${moduleDetail.stats.avgScore.toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-text-main/40 uppercase block tracking-wider">Pass rate</span>
                    <span className="text-sm font-black text-purple-600">
                      {moduleDetail.stats?.passRate ? `${moduleDetail.stats.passRate.toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                </div>

                {/* Material URLs */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-stitch-bg-dark uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stitch-primary" /> Educational materials
                  </h4>
                  <div className="space-y-1 text-xs">
                    {moduleDetail.videoUrl ? (
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 truncate">
                        <PlayCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="font-semibold truncate">Video:</span>
                        <a href={moduleDetail.videoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{moduleDetail.videoUrl}</a>
                      </div>
                    ) : (
                      <p className="text-text-main/30 text-xs italic">No video link configured</p>
                    )}
                    
                    {moduleDetail.docUrl ? (
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 truncate">
                        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-semibold truncate">Document:</span>
                        <a href={moduleDetail.docUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{moduleDetail.docUrl}</a>
                      </div>
                    ) : (
                      <p className="text-text-main/30 text-xs italic">No document PDF configured</p>
                    )}
                  </div>
                </div>

                {/* Quiz specifications list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black text-stitch-bg-dark uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-stitch-primary" /> Assessment Quiz Outline
                    </h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {moduleDetail.questions?.length || 0} Questions
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                    {moduleDetail.questions && moduleDetail.questions.length > 0 ? (
                      moduleDetail.questions.map((q: any, qIdx: number) => (
                        <div key={q.id || qIdx} className="space-y-1.5">
                          <p className="text-xs font-bold text-stitch-bg-dark">
                            {qIdx + 1}. {q.text}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 pl-2">
                            {q.options?.map((opt: any, oIdx: number) => (
                              <div 
                                key={opt.id || oIdx} 
                                className={`px-2 py-1 border rounded text-[10px] font-semibold flex items-center justify-between
                                  ${opt.isCorrect 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                                    : 'bg-slate-50 text-text-main/60 border-slate-150'}`}
                              >
                                <span className="truncate">{opt.text}</span>
                                {opt.isCorrect && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-text-main/40 text-center py-4">No quiz questions configured for this module.</p>
                    )}
                  </div>
                </div>

                {/* Worker Audit Log */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-black text-stitch-bg-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stitch-primary" /> Worker Completion log
                  </h4>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {moduleDetail.completions && moduleDetail.completions.length > 0 ? (
                      moduleDetail.completions.map((comp: any) => (
                        <div key={comp.id} className="flex justify-between items-center p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="truncate pr-2">
                            <p className="text-xs font-black text-stitch-bg-dark truncate">{comp.user?.name}</p>
                            <p className="text-[10px] text-text-main/40 truncate">{comp.user?.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mb-0.5
                              ${comp.passed 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'}`}
                            >
                              Score: {comp.score}%
                            </span>
                            <p className="text-[9px] text-text-main/40 font-semibold">
                              {format(new Date(comp.completedAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-text-main/40 text-center py-4">No workers have attempted this course assessment yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Creation / Editing Modal (Multi-step Form) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-lg text-stitch-bg-dark">
                  {formMode === 'create' ? 'Create Learning Module' : 'Edit Skill Assessment'}
                </h3>
                <p className="text-xs font-semibold text-text-main/40">Step {formStep} of 2: {formStep === 1 ? 'General Configurations' : 'Quiz Question Builder'}</p>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-text-main/30 hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Steps Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 font-semibold text-sm">
              {formStep === 1 ? (
                /* Step 1: General Info */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-text-main/50 uppercase tracking-wider mb-1.5">Course Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Conduct Robust Translation Audits"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-stitch-primary/20 focus:border-stitch-primary outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-text-main/50 uppercase tracking-wider mb-1.5">Associated Skill Focus *</label>
                      <div className="relative">
                        <select
                          value={formData.skillId}
                          onChange={(e) => setFormData(prev => ({ ...prev, skillId: e.target.value }))}
                          className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-stitch-primary/20 outline-none cursor-pointer"
                        >
                          {skills?.map(sk => (
                            <option key={sk.id} value={sk.id}>{sk.name} ({sk.category.replace(/_/g, ' ')})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-text-main/50 uppercase tracking-wider mb-1.5">Quiz Pass Threshold (%) *</label>
                      <input 
                        type="number" 
                        min="10" 
                        max="100"
                        placeholder="80"
                        value={formData.passScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, passScore: parseInt(e.target.value) || 80 }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-stitch-primary/20 focus:border-stitch-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-text-main/50 uppercase tracking-wider mb-1.5">Video Lesson URL (optional)</label>
                    <input 
                      type="url" 
                      placeholder="YouTube Embed URL, e.g. https://www.youtube.com/embed/..."
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-stitch-primary/20 focus:border-stitch-primary outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-text-main/50 uppercase tracking-wider mb-1.5">Document lesson PDF URL (optional)</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://weralink-docs.s3.amazonaws.com/translation-manual.pdf"
                      value={formData.docUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, docUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-stitch-primary/20 focus:border-stitch-primary outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className="hover:scale-105 transition-transform"
                    >
                      {formData.isActive ? (
                        <ToggleRight className="w-9 h-9 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4 className="font-black text-stitch-bg-dark text-sm">Publish Course Assessment</h4>
                      <p className="text-[11px] text-text-main/40 font-semibold">Toggling this active makes it immediately searchable/visible to all system workers in their Learning Hubs.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Quiz Manager Builder */
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <p className="text-xs font-bold text-text-main/50">Assessment Quiz contains {formQuestions.length} Questions</p>
                    <button
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 text-xs font-black text-stitch-primary hover:text-stitch-primary/80 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 space-y-4 relative">
                        <button
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="absolute right-3 top-3 p-1 hover:bg-slate-100 rounded text-red-500 transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="pr-8">
                          <label className="block text-xs font-black text-text-main/50 uppercase tracking-wider mb-1.5">Question {qIdx + 1} Text</label>
                          <input 
                            type="text"
                            placeholder="e.g. Which of the following is a primary rule for translation accuracy?"
                            value={q.text}
                            onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-stitch-primary/20 focus:border-stitch-primary outline-none transition-all font-semibold"
                          />
                        </div>

                        {/* Options builder */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-black text-text-main/40 uppercase tracking-wider">Answer options (Provide 4 choices & select which is Correct)</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`flex items-center gap-2 p-2 border rounded-xl bg-white
                                  ${opt.isCorrect ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200'}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleOptionCorrectChange(qIdx, oIdx)}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0
                                    ${opt.isCorrect 
                                      ? 'bg-emerald-500 border-emerald-600 text-white' 
                                      : 'border-slate-300 hover:border-slate-400'}`}
                                >
                                  {opt.isCorrect && <Check className="w-2.5 h-2.5" />}
                                </button>
                                <input 
                                  type="text"
                                  placeholder={`Option ${oIdx + 1}`}
                                  value={opt.text}
                                  onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                                  className="w-full text-xs font-semibold focus:outline-none bg-transparent"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                {formStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> General Info
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-bold text-text-main/50 hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                
                {formStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Set Quiz Questions <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitForm}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stitch-primary text-white hover:bg-stitch-primary/90 rounded-xl text-xs font-black transition-all shadow-sm disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> {formMode === 'create' ? 'Create Module' : 'Save Quiz'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4 font-semibold text-sm">
              <div className="bg-red-50 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-stitch-bg-dark text-base mb-1">Delete Training Module?</h3>
                <p className="text-text-main/50 text-xs leading-relaxed">
                  Warning! This action will permanently delete the training module, all associated quiz questions, answer options, and historical worker completions. This action is irreversible.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold text-text-main/50 hover:text-text-main transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
