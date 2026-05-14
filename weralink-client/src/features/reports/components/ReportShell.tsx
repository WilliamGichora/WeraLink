import { forwardRef, type ReactNode } from 'react';
import { format } from 'date-fns';
import { WeraLinkLogo } from '@/components/ui/WeraLinkLogo';

interface ReportShellProps {
  title: string;
  subtitle?: string;
  reportId?: string;
  children: ReactNode;
}

/**
 * ReportShell — branded PDF wrapper for all WeraLink reports.
 * Renders a letterhead + footer that matches WeraLink branding.
 * 
 * Usage: Wrap report content, then use html2canvas + jsPDF on the ref.
 * Uses forwardRef so parent can capture the DOM node for PDF generation.
 */
export const ReportShell = forwardRef<HTMLDivElement, ReportShellProps>(
  function ReportShell({ title, subtitle, reportId, children }, ref) {
    const generatedDate = format(new Date(), 'MMMM dd, yyyy · HH:mm');
    const id = reportId || `WR-${Date.now().toString(36).toUpperCase()}`;

    return (
      <div
        ref={ref}
        className="bg-white w-[794px] mx-auto font-sans"
        style={{ fontFamily: "'Figtree Variable', sans-serif" }}
      >
        {/* ─── Letterhead ───────────────────────────────────── */}
        <div className="px-12 pt-10 pb-6 border-b-2 border-[#EF626C]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <WeraLinkLogo size="md" variant="dark" />
              <div>
                <p className="text-[8px] font-bold text-[#211112]/40 uppercase tracking-[0.3em]">
                  Digital Gig Platform
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-[#211112]/40 uppercase tracking-wider">
                Report ID
              </p>
              <p className="text-xs font-black text-[#211112] font-mono">{id}</p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#211112] tracking-tight">{title}</h2>
              {subtitle && (
                <p className="text-sm text-[#211112]/50 font-medium mt-0.5">{subtitle}</p>
              )}
            </div>
            <p className="text-[10px] text-[#211112]/40 font-bold">Generated {generatedDate}</p>
          </div>
        </div>

        {/* ─── Report Body ──────────────────────────────────── */}
        <div className="px-12 py-8 min-h-[600px]">{children}</div>

        {/* ─── Footer ───────────────────────────────────────── */}
        <div className="px-12 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[8px] text-[#211112]/30 font-bold">
            © {new Date().getFullYear()} WeraLink · Confidential
          </p>
          <p className="text-[8px] text-[#211112]/30 font-bold">
            Generated on {generatedDate}
          </p>
        </div>
      </div>
    );
  }
);
