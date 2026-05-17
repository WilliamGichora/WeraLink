import { respond } from '../utils/respond.js';
import { AdminService } from '../services/admin.service.js';
import { DisputeService } from '../services/dispute.service.js';
import { SupportService } from '../services/support.service.js';

/**
 * AdminController
 * REST endpoints for centralized admin management.
 */

// ─── User Management ──────────────────────────────────────

export const listUsers = async (req, res) => {
  try {
    const { page, limit, search, role, status, sortBy, order, startDate, endDate } = req.query;
    const data = await AdminService.listUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search, role, status, sortBy, order, startDate, endDate
    });
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin List Users Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to list users.' }]);
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const data = await AdminService.getUserDetail(req.params.id);
    if (!data) return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'User not found.' }]);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin User Detail Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get user detail.' }]);
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const data = await AdminService.suspendUser(req.params.id, reason, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Suspend Error:', error.message);
    const status = error.message.includes('not found') ? 404 : error.message.includes('already') ? 409 : 400;
    return respond(res, status, null, null, [{ code: 'ADMIN_ERROR', message: error.message }]);
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const data = await AdminService.unsuspendUser(req.params.id, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Unsuspend Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return respond(res, status, null, null, [{ code: 'ADMIN_ERROR', message: error.message }]);
  }
};

export const editUser = async (req, res) => {
  try {
    const data = await AdminService.editUserDetails(req.params.id, req.body, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Edit User Error:', error.message);
    if (error.code === 'P2002') return respond(res, 409, null, null, [{ code: 'CONFLICT', message: 'Email or phone already in use.' }]);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: error.message }]);
  }
};

// ─── Gig Management ────────────────────────────────────────

export const listGigs = async (req, res) => {
  try {
    const { page, limit, search, status, difficulty, category, employerId, workerId, startDate, endDate, sortBy, order } = req.query;
    const data = await AdminService.listGigs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search, status, difficulty, category, employerId, workerId, startDate, endDate, sortBy, order
    });
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin List Gigs Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to list gigs.' }]);
  }
};

export const getGigDetail = async (req, res) => {
  try {
    const data = await AdminService.getGigDetail(req.params.id);
    if (!data) return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'Gig not found.' }]);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Gig Detail Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get gig detail.' }]);
  }
};

// ─── Platform Stats ────────────────────────────────────────

export const getPlatformStats = async (req, res) => {
  try {
    const data = await AdminService.getPlatformStats();
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Platform Stats Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get platform stats.' }]);
  }
};

// ─── Dispute Management ────────────────────────────────────

export const listDisputes = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const data = await DisputeService.listDisputes({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status, search,
    });
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin List Disputes Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to list disputes.' }]);
  }
};

export const getDisputeDetail = async (req, res) => {
  try {
    const data = await DisputeService.getDisputeById(req.params.id);
    if (!data) return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'Dispute not found.' }]);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Dispute Detail Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get dispute detail.' }]);
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { resolution, resolvedFor, adminNotes } = req.body;
    if (!resolvedFor || !['WORKER', 'EMPLOYER'].includes(resolvedFor)) {
      return respond(res, 400, null, null, [{ code: 'VALIDATION_ERROR', message: 'resolvedFor must be WORKER or EMPLOYER.' }]);
    }
    const data = await DisputeService.resolveDispute(req.params.id, { resolution, resolvedFor, adminNotes }, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Resolve Dispute Error:', error.message);
    const status = error.message.includes('not found') ? 404 : error.message.includes('already') ? 409 : 400;
    return respond(res, status, null, null, [{ code: 'DISPUTE_ERROR', message: error.message }]);
  }
};

// ─── Support Ticket Management ─────────────────────────────

export const listSupportTickets = async (req, res) => {
  try {
    const { page, limit, status, category, search } = req.query;
    const data = await SupportService.listTickets({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status, category, search,
    });
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin List Tickets Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to list tickets.' }]);
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) return respond(res, 400, null, null, [{ code: 'VALIDATION_ERROR', message: 'Status is required.' }]);
    const data = await SupportService.updateTicketStatus(req.params.id, { status, adminNotes }, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Update Ticket Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: error.message }]);
  }
};

// ─── LMS & Learning Hub Management (Admin) ─────────────────

export const listLmsModules = async (req, res) => {
  try {
    const { page, limit, search, category, skillId, isActive, startDate, endDate, sortBy, order } = req.query;
    const data = await AdminService.listLmsModules({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search, category, skillId, isActive, startDate, endDate, sortBy, order
    });
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin List LMS Modules Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to list LMS modules.' }]);
  }
};

export const getLmsModuleDetail = async (req, res) => {
  try {
    const data = await AdminService.getLmsModuleDetail(req.params.id);
    if (!data) return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'LMS module not found.' }]);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin LMS Module Detail Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get LMS module detail.' }]);
  }
};

export const createLmsModule = async (req, res) => {
  try {
    const data = await AdminService.createLmsModule(req.body, req.user.id);
    return respond(res, 201, data);
  } catch (error) {
    console.error('Admin Create LMS Module Error:', error.message);
    return respond(res, 400, null, null, [{ code: 'BAD_REQUEST', message: error.message }]);
  }
};

export const updateLmsModule = async (req, res) => {
  try {
    const data = await AdminService.updateLmsModule(req.params.id, req.body, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Update LMS Module Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return respond(res, status, null, null, [{ code: 'ADMIN_ERROR', message: error.message }]);
  }
};

export const deleteLmsModule = async (req, res) => {
  try {
    const data = await AdminService.deleteLmsModule(req.params.id, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin Delete LMS Module Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return respond(res, status, null, null, [{ code: 'ADMIN_ERROR', message: error.message }]);
  }
};

export const listSkills = async (req, res) => {
  try {
    const data = await AdminService.listAllSkills();
    return respond(res, 200, data);
  } catch (error) {
    console.error('Admin List Skills Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to list platform skills.' }]);
  }
};

