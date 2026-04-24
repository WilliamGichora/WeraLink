import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAddSkill } from '../hooks/useProfile';
import { useSkills } from '../hooks/useSkills';
import { Loader2, Search, Award } from 'lucide-react';
import { toast } from 'sonner';

interface AddSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose }) => {
    const { data: availableSkills, isLoading: isLoadingSkills } = useSkills();
    const { mutate: addSkill, isPending } = useAddSkill();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<{skillId: string, level: number}[]>([]);

    const filteredSkills = availableSkills?.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        skill.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const toggleSkill = (skillId: string) => {
        setSelectedSkills(prev => {
            if (prev.some(s => s.skillId === skillId)) {
                return prev.filter(s => s.skillId !== skillId);
            }
            return [...prev, { skillId, level: 1 }];
        });
    };

    const updateSkillLevel = (skillId: string, level: number) => {
        setSelectedSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, level } : s));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSkills.length === 0) {
            toast.error("Please select at least one skill");
            return;
        }

        addSkill(selectedSkills, {
            onSuccess: () => {
                toast.success(`${selectedSkills.length} skill(s) added to profile!`);
                setSearchQuery('');
                setSelectedSkills([]);
                onClose();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.errors?.[0]?.message || "Failed to add skills");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-stitch-primary/20 rounded-3xl overflow-hidden shadow-2xl p-0">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-stitch-primary/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh] relative z-10">
                    <DialogHeader className="pt-6 px-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="w-6 h-1 bg-stitch-primary rounded-full"></span>
                            Add Skills
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Select one or more skills and set your proficiency level.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {/* Search Input */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-primary transition-colors" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-stitch-primary/30 text-base"
                                placeholder="Search skills..." 
                            />
                        </div>

                        {/* Skill Selection List */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Available Skills</label>
                                {selectedSkills.length > 0 && (
                                    <span className="text-xs font-bold text-stitch-primary">{selectedSkills.length} selected</span>
                                )}
                            </div>
                            
                            {isLoadingSkills ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-stitch-primary" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredSkills.map(skill => {
                                        const isSelected = selectedSkills.some(s => s.skillId === skill.id);
                                        const currentLevel = selectedSkills.find(s => s.skillId === skill.id)?.level || 1;

                                        return (
                                            <div 
                                                key={skill.id}
                                                className={`flex flex-col gap-3 p-3 text-left rounded-xl border transition-all ${
                                                    isSelected 
                                                    ? 'bg-stitch-primary/5 border-stitch-primary shadow-sm' 
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-stitch-primary/50'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSkill(skill.id)}
                                                    className="flex items-center gap-3 w-full"
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                        isSelected ? 'bg-stitch-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                    }`}>
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                    <div className="overflow-hidden flex-1 text-left">
                                                        <p className="font-bold text-sm truncate text-slate-900 dark:text-slate-100">{skill.name}</p>
                                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 truncate">{skill.category}</p>
                                                    </div>
                                                </button>

                                                {/* Inline Level Picker */}
                                                {isSelected && (
                                                    <div className="grid grid-cols-3 gap-2 mt-1 animate-in fade-in slide-in-from-top-1 pl-11">
                                                        {[
                                                            { value: 1, label: "Beginner" },
                                                            { value: 2, label: "Intermediate" },
                                                            { value: 3, label: "Expert" }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); updateSkillLevel(skill.id, opt.value); }}
                                                                className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all ${
                                                                    currentLevel === opt.value
                                                                    ? 'bg-stitch-primary text-white border-stitch-primary'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredSkills.length === 0 && (
                                        <p className="col-span-full py-4 text-center text-slate-500 text-sm">No skills found matching your search.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 gap-3 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="rounded-xl h-12 font-bold px-6">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || selectedSkills.length === 0} className="rounded-xl h-12 font-bold px-8 bg-stitch-primary hover:bg-stitch-primary/90 text-white shadow-lg">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                </>
                            ) : "Add Skills"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
