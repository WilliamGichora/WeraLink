import { GigDetailView } from '@/features/gigs/components/GigDetailView';

export default function EmployerGigDetailPage() {
  return (
    <div className="min-h-screen pb-12 pt-8 md:pt-12">
      <GigDetailView viewerRole="employer" />
    </div>
  );
}
