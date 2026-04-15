import { useParams, useNavigate } from 'react-router-dom';
import { gigHooks } from '@/features/gigs/api/gig.api';
import { CreateGigForm } from '@/features/gigs/components/CreateGigForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditGigPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: gig, isLoading, isError } = gigHooks.useGetGigById(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-accent-dark">
        <div className="w-12 h-12 border-4 border-primary-wera border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Loading gig details...</p>
      </div>
    );
  }

  if (isError || !gig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Gig not found or access denied</h2>
        <Button onClick={() => navigate('/employer/gigs')} variant="outline" className="mt-4">Back to Manage Gigs</Button>
      </div>
    );
  }

  if (gig.status !== 'OPEN' && gig.status !== 'DRAFT') {
     return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Cannot Edit Gig</h2>
        <p className="text-text-main/70 mb-6">Only OPEN or DRAFT gigs can be edited. This gig is currently <strong>{gig.status}</strong>.</p>
        <Button onClick={() => navigate('/employer/gigs')} variant="outline">Back to Manage Gigs</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 pt-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/employer/gigs')} className="text-text-main/70 hover:text-accent-dark">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
      <CreateGigForm initialData={gig} isEdit={true} />
    </div>
  );
}
