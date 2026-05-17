import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, SlidersHorizontal, MapPin, Briefcase, DollarSign, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterProps {
  onFilterChange: (filters: any) => void;
  className?: string;
  onClose?: () => void;
  initialFilters?: any;
}

export const MarketplaceFilterSidebar: React.FC<FilterProps> = ({ 
  onFilterChange, 
  className = '', 
  onClose,
  initialFilters = {}
}) => {
  const [localFilters, setLocalFilters] = useState({
    categories: initialFilters.category ? initialFilters.category.split(',') : [],
    workTypes: initialFilters.workType ? initialFilters.workType.split(',') : [],
    difficulties: initialFilters.difficulty ? initialFilters.difficulty.split(',') : [],
    minPay: initialFilters.minPay || '',
    location: initialFilters.location || '',
  });

  const toggleFilter = (key: 'categories' | 'workTypes' | 'difficulties', value: string) => {
    setLocalFilters(prev => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const handleApply = () => {
    const apiFilters: any = {};
    if (localFilters.categories.length > 0) apiFilters.category = localFilters.categories.join(',');
    if (localFilters.workTypes.length > 0) apiFilters.workType = localFilters.workTypes.join(',');
    if (localFilters.difficulties.length > 0) apiFilters.difficulty = localFilters.difficulties.join(',');
    if (localFilters.minPay) apiFilters.minPay = localFilters.minPay;
    if (localFilters.location) apiFilters.location = localFilters.location;
    
    onFilterChange(apiFilters);
    if (onClose) onClose();
  };

  const handleReset = () => {
    const resetState = {
      categories: [],
      workTypes: [],
      difficulties: [],
      minPay: '',
      location: '',
    };
    setLocalFilters(resetState);
    onFilterChange({});
    if (onClose) onClose();
  };

  const CATEGORIES = [
    { id: 'TRANSLATION', label: 'Translation' },
    { id: 'MARKETING', label: 'Marketing' },
    { id: 'DATA_ENTRY', label: 'Data Entry' },
    { id: 'BUG_HUNTING', label: 'QA Testing' },
    { id: 'AI_LABELING', label: 'AI Labeling' },
    { id: 'RESEARCH', label: 'Research' },
  ];

  const WORK_TYPES = [
    { id: 'REMOTE', label: 'Remote' },
    { id: 'HYBRID', label: 'Hybrid' },
    { id: 'ON_SITE', label: 'On-Site' },
  ];

  const DIFFICULTIES = [
    { id: 'BEGINNER', label: 'Beginner' },
    { id: 'INTERMEDIATE', label: 'Intermediate' },
    { id: 'EXPERT', label: 'Expert' },
  ];

  return (
    <div className={`bg-white p-6 rounded-2xl border border-primary-wera/10 sticky top-24 shadow-sm h-max ${className}`}>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary-wera" />
                <h3 className="font-bold text-accent-dark text-lg">Filters</h3>
            </div>
            {onClose ? (
                <button onClick={onClose} className="md:hidden text-text-main/60 hover:text-primary-wera p-1">
                    <X className="w-5 h-5" />
                </button>
            ) : (
                <button 
                  onClick={handleReset}
                  className="text-primary-wera text-xs font-bold hover:underline"
                >
                  Clear all
                </button>
            )}
        </div>

        <div className="space-y-8">
            {/* Category */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-black text-accent-dark uppercase tracking-wider">
                    <Briefcase className="w-4 h-4 text-primary-wera" /> Category
                </Label>
                <div className="space-y-3 pl-1">
                    {CATEGORIES.map(cat => (
                        <div key={cat.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleFilter('categories', cat.id)}>
                            <Checkbox 
                                id={`cat-${cat.id}`} 
                                checked={localFilters.categories.includes(cat.id)}
                                onCheckedChange={() => toggleFilter('categories', cat.id)}
                                className="border-primary-wera/20 data-[state=checked]:bg-primary-wera data-[state=checked]:border-primary-wera"
                            />
                            <label className="text-sm font-medium text-text-main leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary-wera transition-colors">
                                {cat.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-black text-accent-dark uppercase tracking-wider">
                    <BrainCircuit className="w-4 h-4 text-primary-wera" /> Skill Level
                </Label>
                <div className="space-y-3 pl-1">
                    {DIFFICULTIES.map(diff => (
                        <div key={diff.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleFilter('difficulties', diff.id)}>
                            <Checkbox 
                                id={`diff-${diff.id}`} 
                                checked={localFilters.difficulties.includes(diff.id)}
                                onCheckedChange={() => toggleFilter('difficulties', diff.id)}
                                className="border-primary-wera/20 data-[state=checked]:bg-primary-wera data-[state=checked]:border-primary-wera"
                            />
                            <label className="text-sm font-medium text-text-main leading-none cursor-pointer group-hover:text-primary-wera transition-colors">
                                {diff.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Work Type */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-black text-accent-dark uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-primary-wera" /> Work Type
                </Label>
                <div className="space-y-3 pl-1">
                    {WORK_TYPES.map(type => (
                        <div key={type.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleFilter('workTypes', type.id)}>
                            <Checkbox 
                                id={`type-${type.id}`} 
                                checked={localFilters.workTypes.includes(type.id)}
                                onCheckedChange={() => toggleFilter('workTypes', type.id)}
                                className="border-primary-wera/20 data-[state=checked]:bg-primary-wera data-[state=checked]:border-primary-wera"
                            />
                            <label className="text-sm font-medium text-text-main leading-none cursor-pointer group-hover:text-primary-wera transition-colors">
                                {type.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Location Search */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-black text-accent-dark uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-primary-wera" /> Location
                </Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
                    <Input 
                      placeholder="e.g. Nairobi" 
                      className="pl-9 h-11 border-primary-wera/10 bg-slate-50 focus:bg-white focus:border-primary-wera"
                      value={localFilters.location}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                </div>
            </div>

            {/* Pay Range */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-black text-accent-dark uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-primary-wera" /> Min Pay (KES)
                </Label>
                <div className="space-y-4">
                    <Input 
                      type="number" 
                      placeholder="e.g. 500" 
                      className="h-11 border-primary-wera/10 bg-slate-50 focus:bg-white focus:border-primary-wera font-bold text-primary-wera"
                      value={localFilters.minPay}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minPay: e.target.value }))}
                    />
                    <input 
                      className="w-full h-1.5 bg-primary-wera/10 rounded-lg appearance-none cursor-pointer accent-primary-wera" 
                      max="5000" 
                      min="0" 
                      step="100" 
                      type="range" 
                      value={localFilters.minPay || 0}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minPay: e.target.value }))}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-primary-wera/10 space-y-3">
                <Button 
                  onClick={handleApply}
                  className="w-full bg-primary-wera hover:bg-primary-dark text-white font-bold h-12 rounded-xl shadow-lg shadow-primary-wera/10 transition-transform active:scale-95"
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleReset}
                  className="w-full text-text-main/60 hover:text-text-main hover:bg-slate-100 font-bold h-12 rounded-xl"
                >
                  Reset All
                </Button>
            </div>
        </div>
    </div>
  );
};
