import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as authContext from '@/features/auth/context/AuthContext';

// Mock AuthContext
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock AccountSuspendedView
vi.mock('@/pages/shared/AccountSuspendedView', () => ({
  AccountSuspendedView: () => <div data-testid="suspended-view">Account is Suspended!</div>,
}));

describe('ProtectedRoute Component Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('allows active user to render child route content successfully', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'usr-1', email: 'worker@weralink.com', name: 'James', role: 'WORKER', status: 'ACTIVE' },
      isAuthenticated: true,
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/worker/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker/dashboard" element={<div data-testid="child-page">Welcome to dashboard!</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Should display dashboard content
    expect(screen.getByTestId('child-page')).toBeInTheDocument();
    expect(screen.queryByTestId('suspended-view')).not.toBeInTheDocument();
  });

  test('blocks normal path and renders AccountSuspendedView for suspended worker', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'usr-2', email: 'suspended@weralink.com', name: 'Suspended Worker', role: 'WORKER', status: 'SUSPENDED' },
      isAuthenticated: true,
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/worker/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker/dashboard" element={<div data-testid="child-page">Welcome to dashboard!</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Should NOT display dashboard content, and show suspended message instead
    expect(screen.queryByTestId('child-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('suspended-view')).toBeInTheDocument();
  });

  test('allows suspended worker to access exempted path (e.g. /support) successfully', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'usr-2', email: 'suspended@weralink.com', name: 'Suspended Worker', role: 'WORKER', status: 'SUSPENDED' },
      isAuthenticated: true,
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/worker/support']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker/support" element={<div data-testid="support-page">Help & Support</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Exempted path must render successfully
    expect(screen.getByTestId('support-page')).toBeInTheDocument();
    expect(screen.queryByTestId('suspended-view')).not.toBeInTheDocument();
  });
});
