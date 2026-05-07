import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const fetchReport = async (endpoint: string, params?: Record<string, string>) => {
  const response = await api.get(endpoint, { params });
  return response.data.data;
};

// ─── Worker Reports ───────────────────────────────────────
export const useWorkerEarningsReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'worker-earnings', startDate, endDate],
    queryFn: () => fetchReport('/reports/worker/earnings', { startDate: startDate!, endDate: endDate! }),
    enabled: false, // Only fetch on demand (user clicks "Generate")
  });

export const useWorkerHistoryReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'worker-history', startDate, endDate],
    queryFn: () => fetchReport('/reports/worker/history', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

export const useWorkerPerformanceReport = () =>
  useQuery({
    queryKey: ['report', 'worker-performance'],
    queryFn: () => fetchReport('/reports/worker/performance'),
    enabled: false,
  });

export const useWorkerSkillsReport = () =>
  useQuery({
    queryKey: ['report', 'worker-skills'],
    queryFn: () => fetchReport('/reports/worker/skills'),
    enabled: false,
  });

// ─── Employer Reports ─────────────────────────────────────
export const useEmployerSpendingReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'employer-spending', startDate, endDate],
    queryFn: () => fetchReport('/reports/employer/spending', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

export const useEmployerGigActivityReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'employer-gig-activity', startDate, endDate],
    queryFn: () => fetchReport('/reports/employer/gig-activity', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

export const useEmployerPaymentLedgerReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'employer-payment-ledger', startDate, endDate],
    queryFn: () => fetchReport('/reports/employer/payment-ledger', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

export const useEmployerWorkerReviewReport = (workerId: string) =>
  useQuery({
    queryKey: ['report', 'employer-worker-review', workerId],
    queryFn: () => fetchReport(`/reports/employer/worker-review/${workerId}`),
    enabled: false,
  });

export const useEmployerHiringEfficiencyReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'employer-hiring-efficiency', startDate, endDate],
    queryFn: () => fetchReport('/reports/employer/hiring-efficiency', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

// ─── Admin Reports ────────────────────────────────────────
export const useAdminPlatformReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'admin-platform', startDate, endDate],
    queryFn: () => fetchReport('/reports/admin/platform-activity', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

export const useAdminFinancialReconReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'admin-financial-recon', startDate, endDate],
    queryFn: () => fetchReport('/reports/admin/financial-recon', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });

export const useAdminUserTrustReport = (startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['report', 'admin-user-trust', startDate, endDate],
    queryFn: () => fetchReport('/reports/admin/user-trust', { startDate: startDate!, endDate: endDate! }),
    enabled: false,
  });
