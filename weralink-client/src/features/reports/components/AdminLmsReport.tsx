import { format } from 'date-fns';
import type { LmsModule } from '@/features/admin/api/admin.api';

export function AdminLmsReport({ modules, filters }: { modules: LmsModule[]; filters?: any }) {
  if (!modules) return null;

  return (
    <div className="font-sans">
      <div className="mb-8 text-center border-b-2 border-[#211112]/10 pb-6">
        <h2 className="text-2xl font-black text-[#211112] mb-1">LMS & Skill Assessments Directory</h2>
        <p className="text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
          Learning Hub Administration Portfolio • Generated on {format(new Date(), 'MMM dd, yyyy')}
        </p>
      </div>

      {filters && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-xs font-black text-[#211112]/40 uppercase tracking-wider mb-2">Applied Filters</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[#211112]/80">
            {filters.search && <span>Search: "{filters.search}"</span>}
            {filters.category && <span>Category: {filters.category.replace(/_/g, ' ')}</span>}
            {filters.skillId && <span>Skill: {filters.skillName || filters.skillId}</span>}
            {filters.isActive !== undefined && filters.isActive !== '' && (
              <span>Status: {filters.isActive === 'true' || filters.isActive === true ? 'Active' : 'Inactive'}</span>
            )}
            {filters.startDate && <span>From: {format(new Date(filters.startDate), 'MMM dd, yyyy')}</span>}
            {filters.endDate && <span>To: {format(new Date(filters.endDate), 'MMM dd, yyyy')}</span>}
            {!filters.search && !filters.category && !filters.skillId && (filters.isActive === undefined || filters.isActive === '') && !filters.startDate && !filters.endDate && <span>None</span>}
          </div>
        </div>
      )}

      <div className="mb-4 text-xs font-bold text-[#211112]/60 uppercase tracking-wider">
        Total Courses Audited: {modules.length}
      </div>

      <div className="space-y-4">
        {modules.map((mod) => (
          <div key={mod.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-black text-[#211112] text-sm">{mod.title}</h4>
                <p className="text-xs text-[#211112]/60 mt-0.5">
                  Skill Focus: <span className="font-bold">{mod.skill?.name}</span> • Category: <span className="font-bold">{mod.skill?.category}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase mb-1
                  ${mod.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}
                `}>
                  {mod.isActive ? 'Active' : 'Inactive'}
                </span>
                <p className="text-xs font-bold text-[#EF626C]">Pass Threshold: {mod.passScore}%</p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Questions</p>
                <p className="text-xs font-bold text-[#211112]">{mod._count?.questions || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Total Attempts</p>
                <p className="text-xs font-bold text-[#211112]">{mod.stats?.totalCompletions || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Pass Rate (%)</p>
                <p className="text-xs font-bold text-[#211112]">
                  {mod.stats?.passRate ? `${mod.stats.passRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#211112]/40 uppercase tracking-wider">Avg Score (%)</p>
                <p className="text-xs font-bold text-[#211112]">
                  {mod.stats?.avgScore ? `${mod.stats.avgScore.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>

            {(mod.videoUrl || mod.docUrl) && (
              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-[#211112]/60 flex gap-4">
                {mod.videoUrl && (
                  <span className="truncate">
                    🎥 Video Material: <span className="font-medium text-slate-800">{mod.videoUrl}</span>
                  </span>
                )}
                {mod.docUrl && (
                  <span className="truncate">
                    📄 Document Material: <span className="font-medium text-slate-800">{mod.docUrl}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
