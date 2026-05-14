import { respond } from '../utils/respond.js';
import { SupportService } from '../services/support.service.js';

/**
 * SupportController
 * User-facing support ticket endpoints.
 */

export const createTicket = async (req, res) => {
  try {
    const { category, subject, message } = req.body;
    if (!category || !subject || !message) {
      return respond(res, 400, null, null, [{ code: 'VALIDATION_ERROR', message: 'category, subject, and message are required.' }]);
    }
    const data = await SupportService.createTicket(req.user.id, { category, subject, message });
    return respond(res, 201, data);
  } catch (error) {
    console.error('Create Ticket Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to create ticket.' }]);
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const data = await SupportService.getMyTickets(req.user.id);
    return respond(res, 200, { tickets: data });
  } catch (error) {
    console.error('Get My Tickets Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get tickets.' }]);
  }
};

export const getTicketById = async (req, res) => {
  try {
    const data = await SupportService.getTicketById(req.params.id);
    if (!data) return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'Ticket not found.' }]);
    // Ensure the user owns this ticket
    if (data.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return respond(res, 403, null, null, [{ code: 'FORBIDDEN', message: 'Access denied.' }]);
    }
    return respond(res, 200, data);
  } catch (error) {
    console.error('Get Ticket Error:', error.message);
    return respond(res, 500, null, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to get ticket.' }]);
  }
};
