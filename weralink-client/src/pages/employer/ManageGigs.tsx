import { ManageGigsTable } from '@/features/gigs/components/ManageGigsTable';

export default function ManageGigsPage() {
  return (
    <div className="min-h-screen pb-12 pt-8 md:pt-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <ManageGigsTable />
      </div>
    </div>
  );
}
