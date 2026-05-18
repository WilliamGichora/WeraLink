import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import prisma from '../config/prisma.js';
import { MpesaWebhookController } from '../controllers/mpesa.webhook.controller.js';

describe('Safaricom M-Pesa API & Webhook Service Integration Tests', () => {
  const originals = {};

  before(() => {
    originals.transaction = prisma.$transaction;
    originals.transactionFindUnique = prisma.transaction ? prisma.transaction.findUnique : undefined;
    originals.transactionFindFirst = prisma.transaction ? prisma.transaction.findFirst : undefined;
    originals.transactionUpdate = prisma.transaction ? prisma.transaction.update : undefined;
    originals.assignmentFindUnique = prisma.assignment ? prisma.assignment.findUnique : undefined;
    originals.assignmentUpdate = prisma.assignment ? prisma.assignment.update : undefined;
    originals.assignmentFindMany = prisma.assignment ? prisma.assignment.findMany : undefined;
    originals.assignmentUpdateMany = prisma.assignment ? prisma.assignment.updateMany : undefined;
    originals.gigUpdate = prisma.gig ? prisma.gig.update : undefined;
    originals.notificationCreate = prisma.notification ? prisma.notification.create : undefined;
    originals.notificationCreateMany = prisma.notification ? prisma.notification.createMany : undefined;
  });

  after(() => {
    prisma.$transaction = originals.transaction;
    if (prisma.transaction) {
      prisma.transaction.findUnique = originals.transactionFindUnique;
      prisma.transaction.findFirst = originals.transactionFindFirst;
      prisma.transaction.update = originals.transactionUpdate;
    }
    if (prisma.assignment) {
      prisma.assignment.findUnique = originals.assignmentFindUnique;
      prisma.assignment.update = originals.assignmentUpdate;
      prisma.assignment.findMany = originals.assignmentFindMany;
      prisma.assignment.updateMany = originals.assignmentUpdateMany;
    }
    if (prisma.gig) {
      prisma.gig.update = originals.gigUpdate;
    }
    if (prisma.notification) {
      prisma.notification.create = originals.notificationCreate;
      prisma.notification.createMany = originals.notificationCreateMany;
    }
  });

  test('handleSTKPushCallback should process success correctly and accept assignment', async () => {
    const mockTransaction = {
      id: 'tx-stk-1',
      assignmentId: 'assign-stk-1',
      checkoutRequestId: 'ws_CO_123',
      amount: 1500,
      type: 'DEPOSIT_TO_ESCROW',
      status: 'PENDING'
    };

    prisma.transaction = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.checkoutRequestId, 'ws_CO_123');
        return mockTransaction;
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'tx-stk-1');
        assert.strictEqual(data.status, 'SUCCESS');
        assert.strictEqual(data.receiptNumber, 'QWERTY1234');
        return {};
      }
    };

    // Mock prisma transaction to run directly
    prisma.$transaction = async (cb) => cb(prisma);

    // Mock all methods executed inside AssignmentService.acceptAssignment(transaction.assignmentId, receiptNumber)
    prisma.assignment = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'assign-stk-1');
        return {
          id: 'assign-stk-1',
          status: 'OFFERED',
          workerId: 'worker-1',
          gigId: 'gig-1',
          gig: { id: 'gig-1', status: 'OPEN', title: 'Task 1', duration: 3 }
        };
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'assign-stk-1');
        assert.strictEqual(data.status, 'ACCEPTED');
        return { id: 'assign-stk-1', status: 'ACCEPTED' };
      },
      findMany: async () => {
        return []; // No competitors
      }
    };

    prisma.gig = {
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'gig-1');
        assert.strictEqual(data.status, 'ASSIGNED');
        return {};
      }
    };

    prisma.notification = {
      create: async ({ data }) => {
        assert.strictEqual(data.userId, 'worker-1');
        assert.strictEqual(data.type, 'ACCEPTED');
        return {};
      }
    };

    const req = {
      body: {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'ws_CO_123',
            ResultCode: 0,
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 1500 },
                { Name: 'MpesaReceiptNumber', Value: 'QWERTY1234' }
              ]
            }
          }
        }
      }
    };

    let statusVal = 0;
    let jsonVal = null;
    const res = {
      status: (code) => {
        statusVal = code;
        return {
          json: (data) => {
            jsonVal = data;
          }
        };
      }
    };

    await MpesaWebhookController.handleSTKPushCallback(req, res);
    assert.strictEqual(statusVal, 200);
    assert.strictEqual(jsonVal.ResultCode, 0);
  });

  test('handleSTKPushCallback should handle STK push failure and update transaction to FAILED', async () => {
    const mockTransaction = {
      id: 'tx-stk-2',
      assignmentId: 'assign-stk-2',
      checkoutRequestId: 'ws_CO_456',
      amount: 1500,
      type: 'DEPOSIT_TO_ESCROW',
      status: 'PENDING'
    };

    prisma.transaction = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.checkoutRequestId, 'ws_CO_456');
        return mockTransaction;
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'tx-stk-2');
        assert.strictEqual(data.status, 'FAILED');
        return {};
      }
    };

    const req = {
      body: {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'ws_CO_456',
            ResultCode: 1032, // User cancelled
            ResultDesc: 'Request cancelled by user'
          }
        }
      }
    };

    let statusVal = 0;
    let jsonVal = null;
    const res = {
      status: (code) => {
        statusVal = code;
        return {
          json: (data) => {
            jsonVal = data;
          }
        };
      }
    };

    await MpesaWebhookController.handleSTKPushCallback(req, res);
    assert.strictEqual(statusVal, 200);
    assert.strictEqual(jsonVal.ResultCode, 0);
  });

  test('handleB2CCallback should complete payout to worker, update assignment status to PAID, and notify worker', async () => {
    const mockTransaction = {
      id: 'tx-b2c-1',
      assignmentId: 'assign-b2c-1',
      checkoutRequestId: 'B2C_CONV_123',
      amount: 3000,
      type: 'PAYOUT_TO_WORKER',
      status: 'PENDING'
    };

    prisma.$transaction = async (cb) => cb(prisma);

    prisma.transaction = {
      findFirst: async ({ where }) => {
        assert.strictEqual(where.checkoutRequestId, 'B2C_CONV_123');
        return mockTransaction;
      },
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'tx-b2c-1');
        assert.strictEqual(data.status, 'SUCCESS');
        assert.strictEqual(data.receiptNumber, 'NLE9876543');
        return {};
      }
    };

    prisma.assignment = {
      update: async ({ where, data }) => {
        assert.strictEqual(where.id, 'assign-b2c-1');
        assert.strictEqual(data.status, 'PAID');
        return {};
      },
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'assign-b2c-1');
        return { id: 'assign-b2c-1', workerId: 'worker-10', gig: { title: 'Swahili Document translation' } };
      }
    };

    prisma.notification = {
      create: async ({ data }) => {
        assert.strictEqual(data.userId, 'worker-10');
        assert.strictEqual(data.type, 'PAID');
        assert.ok(data.message.includes('NLE9876543'));
        return {};
      }
    };

    const req = {
      body: {
        Result: {
          ConversationID: 'B2C_CONV_123',
          ResultCode: 0,
          ResultDesc: 'B2C processed successfully',
          ResultParameters: {
            ResultParameter: [
              { Key: 'B2CReceiptNumber', Value: 'NLE9876543' }
            ]
          }
        }
      }
    };

    let statusVal = 0;
    let jsonVal = null;
    const res = {
      status: (code) => {
        statusVal = code;
        return {
          json: (data) => {
            jsonVal = data;
          }
        };
      }
    };

    await MpesaWebhookController.handleB2CCallback(req, res);
    assert.strictEqual(statusVal, 200);
    assert.strictEqual(jsonVal.ResultCode, 0);
  });
});
