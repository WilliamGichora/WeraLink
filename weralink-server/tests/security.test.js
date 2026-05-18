import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import prisma from '../config/prisma.js';
import { requireAuth, requireRole, requirePermission } from '../middlewares/auth.middleware.js';
import { supabase } from '../config/supabase.js';

describe('Security Hardening & Account Protection Middleware Tests', () => {
  const originals = {};

  before(() => {
    originals.userFindUnique = prisma.user ? prisma.user.findUnique : undefined;
    originals.getUser = supabase.auth.getUser;
  });

  after(() => {
    if (prisma.user) {
      prisma.user.findUnique = originals.userFindUnique;
    }
    supabase.auth.getUser = originals.getUser;
  });

  test('requireAuth should reject missing token immediately', async () => {
    const req = {
      cookies: {},
      headers: {}
    };

    let nextError = null;
    const next = (err) => {
      nextError = err;
    };

    await requireAuth(req, {}, next);
    assert.ok(nextError);
    assert.strictEqual(nextError.statusCode, 401);
    assert.strictEqual(nextError.code, 'UNAUTHORIZED');
  });

  test('requireAuth should let active worker access normal API endpoints', async () => {
    const req = {
      cookies: { access_token: 'valid-token' },
      url: '/api/gigs/apply',
      originalUrl: '/api/gigs/apply'
    };

    supabase.auth.getUser = async (token) => {
      assert.strictEqual(token, 'valid-token');
      return { data: { user: { id: 'usr-active-1' } }, error: null };
    };

    prisma.user = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'usr-active-1');
        return { id: 'usr-active-1', role: 'WORKER', status: 'ACTIVE', email: 'worker@weralink.com' };
      }
    };

    let nextCalled = false;
    let nextError = null;
    const next = (err) => {
      if (err) nextError = err;
      else nextCalled = true;
    };

    await requireAuth(req, {}, next);
    assert.ok(nextCalled);
    assert.strictEqual(nextError, null);
    assert.strictEqual(req.dbUser.status, 'ACTIVE');
  });

  test('requireAuth should block suspended user attempting to access guarded endpoints', async () => {
    const req = {
      cookies: { access_token: 'suspended-token' },
      url: '/api/gigs/apply',
      originalUrl: '/api/gigs/apply'
    };

    supabase.auth.getUser = async (token) => {
      assert.strictEqual(token, 'suspended-token');
      return { data: { user: { id: 'usr-suspended-1' } }, error: null };
    };

    prisma.user = {
      findUnique: async ({ where }) => {
        assert.strictEqual(where.id, 'usr-suspended-1');
        return { id: 'usr-suspended-1', role: 'WORKER', status: 'SUSPENDED', email: 'suspended@weralink.com' };
      }
    };

    let nextError = null;
    const next = (err) => {
      nextError = err;
    };

    await requireAuth(req, {}, next);
    assert.ok(nextError);
    assert.strictEqual(nextError.statusCode, 403);
    assert.strictEqual(nextError.code, 'SUSPENDED');
  });

  test('requireAuth should allow suspended user to access whitelisted routes (e.g. support channel)', async () => {
    const req = {
      cookies: { access_token: 'suspended-token' },
      url: '/api/support/tickets',
      originalUrl: '/api/support/tickets'
    };

    supabase.auth.getUser = async (token) => {
      return { data: { user: { id: 'usr-suspended-1' } }, error: null };
    };

    prisma.user = {
      findUnique: async ({ where }) => {
        return { id: 'usr-suspended-1', role: 'WORKER', status: 'SUSPENDED', email: 'suspended@weralink.com' };
      }
    };

    let nextCalled = false;
    let nextError = null;
    const next = (err) => {
      if (err) nextError = err;
      else nextCalled = true;
    };

    await requireAuth(req, {}, next);
    assert.ok(nextCalled);
    assert.strictEqual(nextError, null);
  });

  test('requireRole should block unauthorized user roles', async () => {
    const req = {
      user: { id: 'usr-employer-1' },
      dbUser: { id: 'usr-employer-1', role: 'EMPLOYER', status: 'ACTIVE' }
    };

    let nextError = null;
    const next = (err) => {
      nextError = err;
    };

    // requireRole ADMIN should deny access to EMPLOYER
    const roleMiddleware = requireRole(['ADMIN']);
    await roleMiddleware(req, {}, next);

    assert.ok(nextError);
    assert.strictEqual(nextError.statusCode, 403);
    assert.strictEqual(nextError.code, 'FORBIDDEN');
  });
});
