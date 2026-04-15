import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterProps {
  onFilterChange: (filters: any) => void;
  className?: string;
  onClose?: () => void;
}

export const MarketplaceFilterSidebar: React.FC<FilterProps> = ({ onFilterChange, className = '', onClose }) => {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-primary-wera/10 sticky top-24 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-accent-dark text-lg">Filters</h3>
            {onClose ? (
                <button onClick={onClose} className="md:hidden text-text-main/60 hover:text-primary-wera">
                    <X className="w-5 h-5" />
                </button>
            ) : (
                <button className="text-primary-wera text-xs font-semibold hover:underline">Clear all</button>
            )}
        </div>

        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="block text-sm font-bold text-accent-dark mb-3">Category</Label>
                <Select onValueChange={(v) => onFilterChange({ category: v })}>
                    <SelectTrigger className="w-full p-2.5 h-11 text-sm rounded-lg border-primary-wera/10 border-2 bg-background-light text-text-main focus:ring-primary-wera focus:border-primary-wera outline-none">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-primary-wera/10 text-text-main">
                        <SelectItem value="ALL">All Categories</SelectItem>
                        <SelectItem value="TRANSLATION">Translation</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="DATA_ENTRY">Data Entry</SelectItem>
                        <SelectItem value="QA_TESTING">QA Testing</SelectItem>
                        <SelectItem value="AI_LABELING">AI Labeling</SelectItem>
                        <SelectItem value="RESEARCH">Research</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <Label className="block text-sm font-bold text-accent-dark mb-3">Work Type</Label>
                <div className="space-y-2">
                    {['REMOTE', 'HYBRID', 'ON_SITE'].map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded text-primary-wera focus:ring-primary-wera border-primary-wera/20 cursor-pointer" />
                            <span className="text-text-main group-hover:text-primary-wera transition-colors">{type.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label className="block text-sm font-bold text-accent-dark mb-3">Minimum Pay (KES)</Label>
                <Input type="number" placeholder="e.g. 500" className="w-full p-2.5 h-11 text-sm rounded-lg border-primary-wera/10 border-2 bg-background-light focus:border-primary-wera focus:ring-0 text-text-main" />
                <div className="space-y-1">
                    <input className="w-full h-1.5 bg-primary-wera/10 rounded-lg appearance-none cursor-pointer" max="10000" min="200" step="100" type="range" defaultValue={500} />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="block text-sm font-bold text-accent-dark mb-3">Skill Level</Label>
                <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Expert'].map(level => (
                        <label key={level} className="flex items-center gap-2 text-sm cursor-pointer group">
                            <input type="radio" name="skill" className="w-4 h-4 text-primary-wera focus:ring-primary-wera border-primary-wera/20 cursor-pointer" />
                            <span className="text-text-main group-hover:text-primary-wera transition-colors">{level}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-primary-wera/10">
                <Button className="w-full bg-primary-wera hover:bg-primary-dark text-white font-bold h-11 rounded-lg">Apply Filters</Button>
                <Button variant="ghost" className="w-full mt-2 text-text-main/60 hover:text-text-main hover:bg-black/5 font-semibold">Reset</Button>
            </div>
        </div>
    </div>
  );
};
