import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gigHooks } from '../api/gig.api';
import type { CreateGigInput } from '../schemas/gig.schema';
import { CreateGigSchema } from '../schemas/gig.schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const steps = [
  'Basic Info',
  'Skills Required',
  'Evidence Template',
  'Budget & Deadline',
  'Review',
];

const CATEGORY_DB_MAP: Record<string, string> = {
  TRANSLATION: 'Translation',
  MARKETING: 'Marketing',
  DATA_ENTRY: 'Data Entry',
  BUG_HUNTING: 'QA Testing',
  AI_LABELING: 'AI & Data Labeling',
  RESEARCH: 'Research',
};

interface CreateGigFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export const CreateGigForm: React.FC<CreateGigFormProps> = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { mutateAsync: createGig, isPending: isCreating } = gigHooks.useCreateGig();
  const { mutateAsync: updateGig, isPending: isUpdating } = gigHooks.useUpdateGig(initialData?.id || '');
  const isPending = isCreating || isUpdating;
  const { data: skillsData, isLoading: isLoadingSkills } = gigHooks.useGetSkills();

  const defaultValues: Partial<CreateGigInput> = React.useMemo(() => {
    if (isEdit && initialData) {
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'TRANSLATION',
        workType: initialData.workType || 'REMOTE',
        location: initialData.location || '',
        payAmount: initialData.payAmount ? Number(initialData.payAmount) : undefined,
        currency: initialData.currency || 'KES',
        expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : '',
        skillIds: initialData.skills?.map((s: any) => s.skillId) || [],
        evidenceTemplate: initialData.evidenceTemplate || [],
      } as unknown as CreateGigInput;
    }
    return {
      title: '',
      description: '',
      category: 'TRANSLATION',
      workType: 'REMOTE',
      location: '',
      payAmount: undefined as unknown as number,
      currency: 'KES',
      expiresAt: '' as unknown as Date,
      skillIds: [],
      evidenceTemplate: [],
    } as unknown as CreateGigInput;
  }, [isEdit, initialData]);

  const form = useForm<any>({
    resolver: zodResolver(CreateGigSchema),
    defaultValues: defaultValues as any,
    mode: 'onTouched',
  });

  const { control, handleSubmit, register, formState: { errors }, watch, setValue, trigger } = form;

  const { fields: evidenceFields, append: appendEvidence, remove: removeEvidence } = useFieldArray({
    control,
    name: 'evidenceTemplate',
  });

  const watchAll = watch();

  const nextStep = async () => {
    let valid = false;
    if (currentStep === 0) {
      valid = await trigger(['title', 'description', 'category', 'workType', 'location']);
    } else if (currentStep === 1) {
      valid = await trigger(['skillIds']);
    } else if (currentStep === 2) {
      valid = await trigger(['evidenceTemplate']);
    } else if (currentStep === 3) {
      valid = await trigger(['payAmount', 'currency', 'expiresAt']);
    }

    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data: CreateGigInput) => {
    try {
      if (isEdit && initialData) {
        // Compute diff for performance
        const payload: Partial<CreateGigInput> & { skills?: any[] } = {};
        const keys = Object.keys(data) as Array<keyof CreateGigInput>;
        keys.forEach(key => {
            if (JSON.stringify(data[key]) !== JSON.stringify((defaultValues as any)[key])) {
                (payload as any)[key] = data[key];
            }
        });

        // Safely format skills for backend PUT
        if (payload.skillIds) {
            payload.skills = payload.skillIds.map((id: string) => ({ skillId: id, requiredLevel: 1 }));
            delete payload.skillIds;
        }

        if (Object.keys(payload).length === 0) {
            toast.info('No changes detected.');
            navigate('/employer/gigs');
            return;
        }

        await updateGig(payload);
        toast.success('Gig updated successfully!');
      } else {
        // Format skills for backend Create
        const payloadData: any = { ...data };
        if (payloadData.skillIds) {
            payloadData.skills = payloadData.skillIds.map((id: string) => ({ skillId: id, requiredLevel: 1 }));
            delete payloadData.skillIds;
        }
        await createGig(payloadData);
        toast.success('Gig created successfully!');
      }
      navigate('/employer/gigs');
    } catch (error) {
      toast.error(isEdit ? 'Failed to update gig' : 'Failed to create gig');
    }
  };

  const toggleSkill = (skillId: string) => {
    const current = watchAll.skillIds || [];
    if (current.includes(skillId)) {
      setValue('skillIds', current.filter((id: string) => id !== skillId));
    } else {
      setValue('skillIds', [...current, skillId]);
    }
  };

  const filteredSkills = React.useMemo(() => {
    if (!Array.isArray(skillsData)) return [];
    return skillsData.filter((s) => s.category === CATEGORY_DB_MAP[watchAll.category]);
  }, [skillsData, watchAll.category]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">

      {/* Progress Stepper Component */}
      <div className="mb-10 md:mb-14 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-accent-dark mb-10">{isEdit ? 'Edit Gig' : 'Post a New Gig'}</h1>
        <div className="flex items-center justify-between w-full relative px-4 max-w-3xl mx-auto">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary-wera rounded-full z-0 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * (100 - 12)}%` }}
          ></div>

          {steps.map((label, idx) => (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base border-[3px] transition-all duration-300
                      ${idx < currentStep ? 'bg-primary-wera border-primary-wera text-white' :
                  idx === currentStep ? 'bg-white border-primary-wera text-primary-wera shadow-[0_0_15px_rgba(239,98,108,0.2)]' :
                    'bg-white border-slate-200 text-slate-400'}`}
              >
                {idx < currentStep ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
              </div>
              <span className={`absolute top-14 text-[10px] md:text-sm text-center w-24 -ml-8 md:-ml-6 font-bold hidden sm:block
                        ${idx <= currentStep ? 'text-accent-dark' : 'text-slate-400'}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="bg-white border border-primary-wera/10 shadow-xl overflow-visible rounded-2xl">
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <CardContent className="pt-8 sm:p-12 min-h-[400px]">

            {/* STEP 0: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-accent-dark font-bold text-base">Gig Title <span className="text-primary-wera">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g. Translate 5-page legal document from English to Swahili"
                    className="bg-slate-50 border-primary-wera/10 text-text-main focus:bg-white focus:border-primary-wera focus:ring-2 focus:ring-primary-wera/20 rounded-xl h-12 text-base"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-red-500 text-sm font-semibold mt-1">{errors.title.message as string}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-accent-dark font-bold text-base">Description <span className="text-primary-wera">*</span></Label>
                  <textarea
                    id="description"
                    placeholder="Describe the task clearly. Include any specific requirements, context, and expectations."
                    className="w-full min-h-[150px] p-4 bg-slate-50 border border-primary-wera/10 text-text-main focus:bg-white focus:border-primary-wera focus:ring-2 focus:ring-primary-wera/20 rounded-xl transition-colors outline-none resize-y text-base"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-red-500 text-sm font-semibold mt-1">{errors.description.message as string}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-accent-dark font-bold text-base">Category <span className="text-primary-wera">*</span></Label>
                    <Select
                      value={watchAll.category}
                      onValueChange={(val: any) => setValue('category', val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="bg-slate-50 border-primary-wera/10 text-text-main focus:ring-primary-wera/20 focus:border-primary-wera h-12 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-primary-wera/10 text-text-main">
                        {['TRANSLATION', 'MARKETING', 'DATA_ENTRY', 'BUG_HUNTING', 'AI_LABELING', 'RESEARCH'].map(cat => (
                          <SelectItem key={cat} value={cat}>{cat === 'BUG_HUNTING' ? 'QA Testing' : cat.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="workType" className="text-accent-dark font-bold text-base">Work Type <span className="text-primary-wera">*</span></Label>
                    <Select
                      value={watchAll.workType}
                      onValueChange={(val: any) => setValue('workType', val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="bg-slate-50 border-primary-wera/10 text-text-main focus:ring-primary-wera/20 focus:border-primary-wera h-12 rounded-xl">
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-primary-wera/10 text-text-main">
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ON_SITE">On-Site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 mt-8">
                  <Label htmlFor="location" className="text-accent-dark font-bold text-base">
                    {watchAll.workType === 'REMOTE' ? 'Location (Worker Region / Virtual)' : 'Exact Location'} <span className="text-primary-wera">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder={watchAll.workType === 'REMOTE' ? 'e.g. Kenya, Global, or Virtual' : 'e.g. Westlands, Nairobi'}
                    className="bg-slate-50 border-primary-wera/10 text-text-main focus:bg-white focus:border-primary-wera focus:ring-2 focus:ring-primary-wera/20 rounded-xl h-12 text-base"
                    {...register('location')}
                  />
                  {errors.location && <p className="text-red-500 text-sm font-semibold mt-1">{errors.location.message as string}</p>}
                </div>
              </div>
            )}

            {/* STEP 1: Skills Required */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-accent-dark mb-2">Required Skills</h3>
                  <p className="text-base text-text-main/70">Select the specific skills a worker needs to successfully complete this gig. We have filtered the list based on your chosen category.</p>
                </div>

                {isLoadingSkills ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary-wera border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 p-6 bg-slate-50 border border-primary-wera/10 rounded-2xl">
                    {filteredSkills.map((skill) => {
                      const isSelected = watchAll.skillIds.includes(skill.id);
                      return (
                        <button
                          type="button"
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 border-2 
                                        ${isSelected
                              ? 'bg-primary-wera/5 border-primary-wera text-primary-wera shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-primary-wera/50 hover:bg-white/50'}`}
                        >
                          {skill.name}
                          {isSelected && <CheckCircle2 className="w-4 h-4 ml-1" />}
                        </button>
                      );
                    })}
                    {filteredSkills.length === 0 && (
                      <p className="text-text-main/60 text-sm font-medium">No specific skills found for this category. You can proceed without them.</p>
                    )}
                  </div>
                )}
                {errors.skillIds && <p className="text-red-500 font-semibold text-sm mt-4">{errors.skillIds.message as string}</p>}
              </div>
            )}

            {/* STEP 2: Evidence Template */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-accent-dark mb-2">Proof of Work (Evidence)</h3>
                  <p className="text-base text-text-main/70 mb-6">Define exactly what the worker needs to submit when finishing the gig. This protects you and ensures quality delivery.</p>
                </div>

                <div className="space-y-4">
                  {evidenceFields.map((field, index) => (
                    <Card key={field.id} className="bg-slate-50 border-slate-200 relative group rounded-xl shadow-sm">
                      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                        <button
                          type="button"
                          title="Remove requirement"
                          onClick={() => removeEvidence(index)}
                          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="md:col-span-4 space-y-3">
                          <Label className="text-accent-dark text-xs font-bold uppercase tracking-wider">Requirement Name</Label>
                          <Input
                            placeholder="e.g. Translated Document"
                            {...register(`evidenceTemplate.${index}.label` as const)}
                            className="bg-white border-slate-200 text-text-main h-11 focus:border-primary-wera focus:ring-primary-wera"
                          />
                          {/* Using watch to auto-generate a tag based on label - simplified for UI */}
                          <input type="hidden" {...register(`evidenceTemplate.${index}.tag` as const)} value={`req_${index}`} />
                        </div>

                        <div className="md:col-span-4 space-y-3">
                          <Label className="text-accent-dark text-xs font-bold uppercase tracking-wider">Type</Label>
                          <Select
                            onValueChange={(val: any) => setValue(`evidenceTemplate.${index}.type` as const, val)}
                            defaultValue={(field as any).type}
                          >
                            <SelectTrigger className="bg-white border-slate-200 text-text-main h-11 focus:border-primary-wera focus:ring-primary-wera">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-text-main">
                              <SelectItem value="FILE">File Document</SelectItem>
                              <SelectItem value="IMAGE">Image / Screenshot</SelectItem>
                              <SelectItem value="LINK">URL Link</SelectItem>
                              <SelectItem value="TEXT">Text Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-3 space-y-3 pt-1">
                          <Label className="text-accent-dark text-xs font-bold uppercase tracking-wider">Required?</Label>
                          <div className="flex items-center h-10 mt-1">
                            <input
                              type="checkbox"
                              {...register(`evidenceTemplate.${index}.required` as const)}
                              className="w-5 h-5 rounded border-slate-300 text-primary-wera focus:ring-primary-wera cursor-pointer"
                            />
                            <span className="ml-3 text-sm font-bold text-text-main">Mandatory</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {evidenceFields.length === 0 && (
                    <div className="text-center p-10 border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
                      <p className="text-red-600 font-bold mb-2">No evidence requirements added yet.</p>
                      <p className="text-sm text-red-500/80">You MUST add at least one proof of work requirement to proceed.</p>
                    </div>
                  )}
                  {errors.evidenceTemplate && <p className="text-red-500 font-bold text-center text-sm mt-4">{errors.evidenceTemplate.message as string}</p>}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendEvidence({ tag: `req_${Date.now()}`, label: '', type: 'FILE', required: true, min: 1 })}
                    className="w-full h-14 border-2 border-dashed border-primary-wera/30 text-primary-wera hover:bg-primary-wera/5 bg-transparent flex items-center gap-2 rounded-xl font-bold mt-4 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Evidence Requirement
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Budget & Deadline */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-accent-dark mb-2">Gig Budget</h3>
                      <p className="text-base text-text-main/70">Set a fair price for the effort required.</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="payAmount" className="text-accent-dark font-bold text-base">Fixed Payment Amount <span className="text-primary-wera">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main/50 font-bold select-none">
                          {watchAll.currency}
                        </span>
                        <Input
                          id="payAmount"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="2000"
                          className="pl-14 bg-slate-50 border-primary-wera/20 text-accent-dark focus:bg-white focus:border-primary-wera focus:ring-2 focus:ring-primary-wera/20 text-xl font-bold h-16 rounded-xl shadow-inner"
                          {...register('payAmount', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.payAmount && <p className="text-red-500 font-semibold text-sm mt-1">{errors.payAmount.message as string}</p>}
                    </div>

                    <div className="bg-primary-wera/5 border border-primary-wera/20 rounded-xl p-5 flex gap-4">
                      <CheckCircle2 className="w-6 h-6 text-primary-wera shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-accent-dark">Minimum suggested: KES 500</h4>
                        <p className="text-xs text-text-main/70 mt-1 leading-relaxed">Gigs priced fairly receive 3x more applications from top-rated workers and complete faster.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-accent-dark mb-2">Timeline</h3>
                      <p className="text-base text-text-main/70">When do you need this completed?</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="expiresAt" className="text-accent-dark font-bold text-base">Deadline <span className="text-primary-wera">*</span></Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        className="bg-slate-50 border-primary-wera/20 text-text-main/80 focus:bg-white focus:border-primary-wera focus:ring-2 focus:ring-primary-wera/20 h-16 rounded-xl font-bold px-4"
                        {...register('expiresAt')}
                      />
                      {errors.expiresAt && <p className="text-red-500 font-semibold text-sm mt-1">{errors.expiresAt.message as string}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-bold text-accent-dark mb-3">Review your Gig</h3>
                  <p className="text-text-main/70 text-lg">Make sure everything looks good before publishing to the marketplace.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-10 space-y-8 shadow-sm">
                  <div>
                    <div className="flex items-start justify-between flex-wrap gap-6 mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-accent-dark leading-tight">{watchAll.title}</h2>
                        <div className="flex items-center gap-3 mt-4">
                          <Badge variant="outline" className="text-primary-wera border-primary-wera/30 bg-white font-bold">{watchAll.category.replace('_', ' ')}</Badge>
                          <Badge variant="outline" className="text-text-main border-slate-300 bg-white font-bold">
                            {watchAll.workType === 'REMOTE' ? '🌐 Remote' : '📍 ' + (watchAll.location || 'On-Site')}
                          </Badge>
                        </div>
                      </div>
                      <div className="bg-white border border-primary-wera/10 px-6 py-4 rounded-2xl text-right shadow-sm border-b-4 border-b-primary-wera/20 min-w-[150px]">
                        <span className="block text-xs uppercase tracking-wider text-text-main/50 font-bold mb-1">Budget Setup</span>
                        <span className="text-2xl font-black text-primary-wera">{watchAll.currency} {watchAll.payAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none text-text-main/80 mt-6 whitespace-pre-wrap bg-white p-6 rounded-2xl border border-slate-100">
                      {watchAll.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-accent-dark mb-4 flex items-center gap-2">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {watchAll.skillIds.map((id: string) => {
                          const skill = Array.isArray(skillsData) ? skillsData.find(s => s.id === id) : undefined;
                          return <Badge key={id} variant="secondary" className="bg-white border border-slate-200 text-text-main font-semibold shadow-sm">{skill?.name || id}</Badge>
                        })}
                        {(watchAll.skillIds.length === 0) && <span className="text-text-main/50 text-sm italic font-medium">None specified</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-accent-dark mb-4 flex items-center gap-2">
                        Evidence Requirements
                      </h4>
                      <ul className="space-y-3">
                        {watchAll.evidenceTemplate?.map((ev: any, i: number) => (
                          <li key={i} className="flex flex-col p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-accent-dark">{ev.label || 'Unnamed Requirement'}</span>
                              <Badge variant="outline" className="text-xs bg-slate-50 text-text-main border-slate-200">{ev.type}</Badge>
                            </div>
                            {ev.required && <span className="text-[10px] text-primary-wera uppercase tracking-wider mt-2 font-black w-max bg-primary-wera/10 px-2 py-0.5 rounded">Required</span>}
                          </li>
                        ))}
                        {(!watchAll.evidenceTemplate || watchAll.evidenceTemplate.length === 0) && <li className="text-text-main/50 text-sm italic font-medium list-none">None specified</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="p-6 sm:px-12 sm:pb-10 pt-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 md:pt-8 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0 || isPending}
              className="w-full sm:w-auto text-text-main/60 hover:text-accent-dark hover:bg-slate-200 font-bold h-12 px-6 rounded-xl"
            >
              {currentStep > 0 && <ChevronLeft className="w-5 h-5 mr-2" />}
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto bg-accent-dark hover:bg-black text-white min-w-[140px] h-12 font-bold px-8 rounded-xl shadow-lg shadow-black/10 transition-transform active:scale-95"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isPending}
                className="w-full sm:w-auto bg-primary-wera hover:bg-primary-dark text-white shadow-xl shadow-primary-wera/30 min-w-[200px] h-14 text-lg font-bold rounded-xl transition-transform active:scale-95"
              >
                {isPending ? 'Publishing...' : 'Publish Gig Now'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
