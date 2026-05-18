import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import prisma from '../config/prisma.js';
import { DisputeService } from '../services/dispute.service.js';

describe('Dispute Resolution & Escrow Transactions Service Tests', () => {
  const originals = {};

  before(() => {
    originals.transaction = prisma.$transaction;
    originals.assignmentFindUnique = prisma.assignment ? prisma.assignment.findUnique : undefined;
    originals.assignmentUpdate = prisma.assignment ? prisma.assignment.update : undefined;
    originals.disputeCreate = prisma.dispute ? prisma.dispute.create : undefined;
    originals.disputeFindUnique = prisma.dispute ? prisma.dispute.findUnique : undefined;
    originals.disputeUpdate = prisma.dispute ? prisma.dispute.update : undefined;
    originals.notificationCreate = prisma.notification ? prisma.notification.create : undefined;
    originals.notificationCreateMany = prisma.notification ? prisma.notification.createMany : undefined;
    originals.userFindMany = prisma.user ? prisma.user.findMany : undefined;
    originals.userActivityCreate = prisma.userActivity ? prisma.userActivity.create : undefined;
    originals.gigUpdate = prisma.gig ? prisma.gig.update : undefined;
  });

  after(() => {
    prisma.$transaction = originals.transaction;
    if (prisma.assignment) {
      prisma.assignment.findUnique = originals.assignmentFindUnique;
      prisma.assignment.update = originals.assignmentUpdate;
    }
    if (prisma.dispute) {
      prisma.dispute.create = originals.disputeCreate;
      prisma.dispute.findUnique = originals.disputeFindUnique;
      prisma.dispute.update = originals.disputeUpdate;
    }
    if (prisma.notification) {
      prisma.notification.create = originals.notificationCreate;
      prisma.notification.createMany = originals.notificationCreateMany;
    }
    if (prisma.user) {
      prisma.user.findMany = originals.userFindMany;
    }
    if (prisma.userActivity) {
      prisma.userActivity.create = originals.userActivityCreate;
    }
    if (prisma.gig) {
      prisma.gig.update = originals.gigUpdate;
    }
  });

  test('raiseDispute should block unauthorized raisers and raise successful disputes atomically', async () => {
    const mockAssignment = {
      id: 'assign-1',
      status: 'SUBMITTED',
      workerId: 'worker-1',
      gig: { id: 'gig-1', title: 'Data Cleaning', employerId: 'employer-1' },
      worker: { id: 'worker-1', name: 'Al K' },
      dispute: null
    };

    // Set transaction mock to call the callback directly
    prisma.$transaction = async (cb) => cb(prisma);

    prisma.assignment = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'assign-1');
        return mockAssignment;
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'assign-1');
        assert.strictEqual(data.status, 'DISPUTED');
        return mockAssignment;
      }
    };

    prisma.dispute = {
      create: async ({ data }) => {
        assert.strictEqual(data.assignmentId, 'assign-1');
        assert.strictEqual(data.raisedById, 'worker-1');
        assert.strictEqual(data.reason, 'Employer refused completed work without feedback');
        return { id: 'dispute-1', ...data };
      }
    };

    prisma.notification = {
      create: async ({ data }) => {
        assert.strictEqual(data.userId, 'employer-1');
        assert.strictEqual(data.type, 'DISPUTE_RAISED');
        return { id: 'notif-1' };
      },
      createMany: async ({ data }) => {
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].userId, 'admin-1');
        assert.strictEqual(data[0].type, 'DISPUTE_RAISED');
        return { count: 1 };
      }
    };

    prisma.user = {
      findMany: async ({ where }) => {
        assert.strictEqual(where.role, 'ADMIN');
        return [{ id: 'admin-1' }];
      }
    };

    prisma.userActivity = {
      create: async ({ data }) => {
        assert.strictEqual(data.userId, 'worker-1');
        assert.strictEqual(data.action, 'DISPUTE_RAISED');
        return { id: 'act-1' };
      }
    };

    // Case 1: Unauthorized raiser throws error
    await assert.rejects(
      DisputeService.raiseDispute('assign-1', 'malicious-user', 'Steal escrow'),
      /You are not a party to this assignment/
    );

    // Case 2: Correct raise dispute by worker
    const dispute = await DisputeService.raiseDispute(
      'assign-1',
      'worker-1',
      'Employer refused completed work without feedback'
    );
    assert.strictEqual(dispute.id, 'dispute-1');
  });

  test('resolveDispute should release escrow funds to worker and update states', async () => {
    const mockDispute = {
      id: 'disp-10',
      assignmentId: 'assign-10',
      status: 'OPEN',
      assignment: {
        id: 'assign-10',
        status: 'DISPUTED',
        gig: { id: 'gig-10', title: 'Image Tagging', payAmount: 2000, employerId: 'employer-10' },
        worker: { id: 'worker-10', name: 'John Doe', phone: '254708374149' }
      }
    };

    prisma.$transaction = async (cb) => cb(prisma);

    prisma.dispute = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'disp-10');
        return mockDispute;
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'disp-10');
        assert.strictEqual(data.status, 'RESOLVED_FOR_WORKER');
        return { id: 'disp-10', ...data };
      }
    };

    let assignmentUpdated = false;
    prisma.assignment = {
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'assign-10');
        assert.strictEqual(data.status, 'APPROVED');
        assignmentUpdated = true;
        return {};
      }
    };

    let gigUpdated = false;
    prisma.gig = {
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'gig-10');
        assert.strictEqual(data.status, 'COMPLETED');
        gigUpdated = true;
        return {};
      }
    };

    prisma.notification = {
      createMany: async ({ data }) => {
        assert.strictEqual(data.length, 2);
        assert.ok(data.some(n => n.userId === 'worker-10'));
        assert.ok(data.some(n => n.userId === 'employer-10'));
        return { count: 2 };
      }
    };

    const res = await DisputeService.resolveDispute('disp-10', {
      resolution: 'Completed work matches specifications. Releasing funds.',
      resolvedFor: 'WORKER',
      adminNotes: 'Admin override.'
    }, 'admin-1');

    assert.strictEqual(res.status, 'RESOLVED_FOR_WORKER');
    assert.strictEqual(res.resolvedBy, 'admin-1');
    assert.ok(assignmentUpdated);
    assert.ok(gigUpdated);
  });

  test('resolveDispute should refund escrow to employer, reopen gig and update states', async () => {
    const mockDispute = {
      id: 'disp-20',
      assignmentId: 'assign-20',
      status: 'OPEN',
      assignment: {
        id: 'assign-20',
        status: 'DISPUTED',
        gig: { id: 'gig-20', title: 'Data Entry Task', payAmount: 1500, employerId: 'employer-20' },
        worker: { id: 'worker-20', name: 'Poor Worker', phone: '254708374149' }
      }
    };

    prisma.$transaction = async (cb) => cb(prisma);

    prisma.dispute = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'disp-20');
        return mockDispute;
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'disp-20');
        assert.strictEqual(data.status, 'RESOLVED_FOR_EMPLOYER');
        return { id: 'disp-20', ...data };
      }
    };

    let assignmentUpdated = false;
    prisma.assignment = {
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'assign-20');
        assert.strictEqual(data.status, 'CANCELLED');
        assignmentUpdated = true;
        return {};
      }
    };

    let gigUpdated = false;
    prisma.gig = {
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'gig-20');
        assert.strictEqual(data.status, 'OPEN'); // Reopened for employer!
        gigUpdated = true;
        return {};
      }
    };

    prisma.notification = {
      createMany: async ({ data }) => {
        assert.strictEqual(data.length, 2);
        return { count: 2 };
      }
    };

    const res = await DisputeService.resolveDispute('disp-20', {
      resolution: 'Worker did not complete the work according to evidence guidelines. Re-opening.',
      resolvedFor: 'EMPLOYER',
      adminNotes: 'Admin refund.'
    }, 'admin-1');

    assert.strictEqual(res.status, 'RESOLVED_FOR_EMPLOYER');
    assert.ok(assignmentUpdated);
    assert.ok(gigUpdated);
  });
});
