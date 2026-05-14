import prisma from '../config/prisma.js';

/**
 * SupportService
 * Manages support ticket CRUD for users and admin workflows.
 */
export class SupportService {

  /**
   * Creates a new support ticket.
   */
  static async createTicket(userId, { category, subject, message }) {
    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: { userId, category, subject, message },
        include: { user: { select: { name: true, email: true, role: true } } },
      });

      // Notify all admins about the new ticket
      const admins = await tx.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'New Support Ticket',
            message: `${ticket.user.name} submitted a "${category}" ticket: "${subject}"`,
            type: 'SUPPORT_TICKET',
            linkUrl: '/admin/support',
          })),
        });
      }

      // Log activity
      await tx.userActivity.create({
        data: {
          userId,
          action: 'SUPPORT_TICKET_CREATED',
          metadata: { ticketId: ticket.id, category, subject },
        },
      });

      return ticket;
    });
  }

  /**
   * Gets tickets for a specific user.
   */
  static async getMyTickets(userId) {
    return await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets a single ticket by ID.
   */
  static async getTicketById(ticketId) {
    return await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
    });
  }

  /**
   * Lists all tickets with filtering (admin use).
   */
  static async listTickets({ page = 1, limit = 20, status, category, search } = {}) {
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return { tickets, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Admin updates ticket status with optional notes.
   */
  static async updateTicketStatus(ticketId, { status, adminNotes }, adminId) {
    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw new Error('Ticket not found');

      const updateData = { status };
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = adminId;
      }

      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
        include: { user: { select: { id: true, name: true } } },
      });

      // Notify the ticket owner
      await tx.notification.create({
        data: {
          userId: ticket.userId,
          title: `Support Ticket ${status === 'RESOLVED' ? 'Resolved' : 'Updated'}`,
          message: `Your ticket "${ticket.subject}" has been ${status.toLowerCase().replace('_', ' ')}. ${adminNotes || ''}`.trim(),
          type: 'SUPPORT_TICKET_UPDATE',
        },
      });

      return updated;
    });
  }
}
