import { useState, useEffect } from 'react';
import { X, Save, Building, Globe, MapPin, AlignLeft, Briefcase } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMyProfile } from '@/features/profile/api/profile.api';
import { toast } from 'sonner';

interface EditEmployerProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
}

export function EditEmployerProfileModal({ open, onClose, profile }: EditEmployerProfileModalProps) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    industry: '',
    website: '',
    location: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        companyDescription: profile.companyDescription || '',
        industry: profile.industry || '',
        website: profile.website || '',
        location: profile.location || '',
        name: profile.user?.name || '',
        phone: profile.user?.phone || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myProfile'] });
      toast.success('Company profile updated successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile');
    }
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-accent-dark">Edit Company Profile</h2>
            <p className="text-sm text-text-main/50">Update your company details visible to workers.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="employer-profile-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-accent-dark flex items-center gap-2">
                  <Building className="w-4 h-4 text-text-main/40" /> Company Name
                </label>
                <input
                  name="companyName" value={formData.companyName} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-accent-dark flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-text-main/40" /> Industry
                </label>
                <input
                  name="industry" value={formData.industry} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none"
                  placeholder="e.g. Technology, Retail"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-accent-dark flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-text-main/40" /> Company Description
              </label>
              <textarea
                name="companyDescription" value={formData.companyDescription} onChange={handleChange} rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none resize-none"
                placeholder="Describe your company and the kind of work you do..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-accent-dark flex items-center gap-2">
                  <Globe className="w-4 h-4 text-text-main/40" /> Website
                </label>
                <input
                  name="website" value={formData.website} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-accent-dark flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-text-main/40" /> Location / Address
                </label>
                <input
                  name="location" value={formData.location} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <hr className="border-slate-100" />
            <h3 className="text-sm font-bold text-accent-dark tracking-widest uppercase mb-4">Contact Person</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-accent-dark">Full Name</label>
                <input
                  name="name" value={formData.name} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-accent-dark">Phone Number</label>
                <input
                  name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-wera/30 outline-none"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            type="submit" form="employer-profile-form" disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-primary-wera text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-wera/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
