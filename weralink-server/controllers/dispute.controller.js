import { respond } from '../utils/respond.js';
import { DisputeService } from '../services/dispute.service.js';

/**
 * DisputeController
 * User-facing dispute endpoints (raise, view, add evidence).
 */

export const raiseDispute = async (req, res) => {
  try {
    const { assignmentId, reason, evidenceUrls } = req.body;
    if (!assignmentId || !reason) {
      return respond(res, 400, null, null, [{ code: 'VALIDATION_ERROR', message: 'assignmentId and reason are required.' }]);
    }
    const data = await DisputeService.raiseDispute(assignmentId, req.user.id, reason, evidenceUrls);
    return respond(res, 201, data);
  } catch (error) {
    console.error('Raise Dispute Error:', error.message);
    const status = error.message.includes('not found') ? 404 : error.message.includes('already exists') ? 409 : 400;
    return respond(res, status, null, null, [{ code: 'DISPUTE_ERROR', message: error.message }]);
  }
};

export const getDispute = async (req, res) => {
  try {
    const data = await DisputeService.getDisputeById(req.params.id);
    if (!data) return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'Dispute not found.' }]);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Get Dispute Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get dispute.' }]);
  }
};

export const addDisputeEvidence = async (req, res) => {
  try {
    const { evidenceUrls } = req.body;
    if (!evidenceUrls || !Array.isArray(evidenceUrls)) {
      return respond(res, 400, null, null, [{ code: 'VALIDATION_ERROR', message: 'evidenceUrls array is required.' }]);
    }
    const data = await DisputeService.addEvidence(req.params.id, evidenceUrls, req.user.id);
    return respond(res, 200, data);
  } catch (error) {
    console.error('Add Dispute Evidence Error:', error.message);
    return respond(res, 400, null, null, [{ code: 'DISPUTE_ERROR', message: error.message }]);
  }
};

export const getMyDisputes = async (req, res) => {
  try {
    const { page, limit } = req.query;
    // Get disputes where user is either the worker or employer on the assignment
    const data = await DisputeService.listDisputes({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    // Filter to only disputes involving this user
    const myDisputes = data.disputes.filter(d =>
      d.raisedBy.id === req.user.id ||
      d.assignment.worker?.id === req.user.id ||
      d.assignment.gig?.employerId === req.user.id
    );
    return respond(res, 200, { disputes: myDisputes, pagination: data.pagination });
  } catch (error) {
    console.error('Get My Disputes Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get disputes.' }]);
  }
};
