import { respond } from '../utils/respond.js';
import { ReportService } from '../services/report.service.js';

/**
 * ReportController
 * Serves pre-formatted data for client-side PDF generation.
 * All endpoints accept optional ?startDate=&endDate= query params.
 */

const parseDates = (query) => ({
  startDate: query.startDate || undefined,
  endDate: query.endDate || undefined,
});

// ─── Worker Reports ───────────────────────────────────────

export const getWorkerEarnings = async (req, res) => {
  try {
    const data = await ReportService.getWorkerEarningsData(req.user.id, parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Worker Earnings Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate earnings data.' }]);
  }
};

export const getWorkerHistory = async (req, res) => {
  try {
    const data = await ReportService.getWorkerCompletionHistory(req.user.id, parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Worker History Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate history data.' }]);
  }
};

export const getWorkerPerformance = async (req, res) => {
  try {
    const data = await ReportService.getWorkerPerformanceData(req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Worker Performance Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate performance data.' }]);
  }
};

export const getWorkerSkills = async (req, res) => {
  try {
    const data = await ReportService.getWorkerSkillsData(req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Worker Skills Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate skills data.' }]);
  }
};

export const getWorkerGigCompletion = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!assignmentId) return respond(res, 400, null, null, [{ code: 'BAD_REQUEST', message: 'Assignment ID is required' }]);
    
    const data = await ReportService.getWorkerGigCompletionReport(assignmentId, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Worker Gig Completion Report Error:', error.message);
    const status = error.message === 'Access denied' ? 403 : error.message.includes('not found') ? 404 : 500;
    return respond(res, status, null, null, [{ code: 'REPORT_ERROR', message: error.message }]);
  }
};

export const getEmployerAssignmentReport = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!assignmentId) return respond(res, 400, null, null, [{ code: 'BAD_REQUEST', message: 'Assignment ID is required' }]);
    
    const data = await ReportService.getEmployerAssignmentReport(assignmentId, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Employer Assignment Report Error:', error.message);
    const status = error.message === 'Access denied' ? 403 : error.message.includes('not found') ? 404 : 500;
    return respond(res, status, null, null, [{ code: 'REPORT_ERROR', message: error.message }]);
  }
};

// ─── Employer Reports ─────────────────────────────────────

export const getEmployerSpending = async (req, res) => {
  try {
    const data = await ReportService.getEmployerSpendingData(req.user.id, parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Employer Spending Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate spending data.' }]);
  }
};

export const getEmployerGigActivity = async (req, res) => {
  try {
    const data = await ReportService.getEmployerGigActivity(req.user.id, parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Employer Gig Activity Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate gig activity data.' }]);
  }
};

export const getEmployerPaymentLedger = async (req, res) => {
  try {
    const data = await ReportService.getEmployerPaymentLedger(req.user.id, parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Employer Payment Ledger Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate payment ledger.' }]);
  }
};

export const getEmployerWorkerReview = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!workerId) return respond(res, 400, null, null, [{ code: 'BAD_REQUEST', message: 'Worker ID is required' }]);
    
    const data = await ReportService.getWorkerPerformanceReview(req.user.id, workerId);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Employer Worker Review Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate worker review.' }]);
  }
};

export const getEmployerHiringEfficiency = async (req, res) => {
  try {
    const data = await ReportService.getHiringEfficiency(req.user.id, parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Employer Hiring Efficiency Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate hiring efficiency data.' }]);
  }
};

// ─── Admin Reports ────────────────────────────────────────

export const getAdminPlatformActivity = async (req, res) => {
  try {
    const data = await ReportService.getAdminPlatformActivity(parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Platform Report Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate platform report.' }]);
  }
};

export const getAdminFinancialRecon = async (req, res) => {
  try {
    const data = await ReportService.getAdminFinancialRecon(parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Financial Recon Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate reconciliation data.' }]);
  }
};

export const getAdminUserTrust = async (req, res) => {
  try {
    const data = await ReportService.getAdminUserTrust(parseDates(req.query));
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin User Trust Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to generate user trust data.' }]);
  }
};
