import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmitEvidence } from '../../src/pages/worker/SubmitEvidence';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as executionApi from '@/features/execution/api/execution.api';

// Mock execution.api hooks
vi.mock('@/features/execution/api/execution.api', () => ({
  useGetAssignmentById: vi.fn(),
  useSubmitWork: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useGetPresignedUrl: vi.fn(() => ({ mutateAsync: vi.fn() })),
  uploadFileToPresignedUrl: vi.fn(),
}));

// Mock WorkflowStepper
vi.mock('@/features/execution/components/WorkflowStepper', () => ({
  WorkflowStepper: () => <div data-testid="workflow-stepper">WorkflowStepper</div>,
}));

// Mock RaiseDisputeModal
vi.mock('@/features/disputes/components/RaiseDisputeModal', () => ({
  RaiseDisputeModal: () => <div data-testid="raise-dispute-modal">RaiseDisputeModal</div>,
}));

describe('SubmitEvidence Component Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders warning card and custom notes when assignment status is REVISION_REQUESTED', () => {
    const mockAssignment = {
      id: 'assign-123',
      status: 'REVISION_REQUESTED',
      createdAt: '2026-05-17T00:00:00.000Z',
      revisionNotes: 'Please correct paragraph 3 translation; tone is too informal.',
      gig: {
        title: 'English to Swahili Translation',
        category: 'TRANSLATION',
        currency: 'KES',
        payAmount: 1500,
        evidenceTemplate: [
          { id: 'ev-1', type: 'FILE', label: 'Translated Swahili Document', required: true }
        ],
        employer: { name: 'Safaricom DevTeam' }
      },
      evidence: []
    };

    vi.spyOn(executionApi, 'useGetAssignmentById').mockReturnValue({
      data: mockAssignment,
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    } as any);

    render(
      <MemoryRouter initialEntries={['/worker/assignments/assign-123/submit']}>
        <Routes>
          <Route path="/worker/assignments/:id/submit" element={<SubmitEvidence />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify warning block title is in the document
    expect(screen.getByText('Revision Requested')).toBeInTheDocument();

    // Verify revision notes are correctly rendered
    expect(screen.getByText(/"Please correct paragraph 3 translation; tone is too informal."/)).toBeInTheDocument();
  });

  test('pre-populates evidence input values when partial evidence exists', () => {
    const mockAssignment = {
      id: 'assign-123',
      status: 'ACCEPTED',
      createdAt: '2026-05-17T00:00:00.000Z',
      gig: {
        title: 'Logo Design Review',
        category: 'MARKETING',
        currency: 'KES',
        payAmount: 3000,
        evidenceTemplate: [
          { id: 'ev-logo', type: 'IMAGE', label: 'High Res PNG', required: true }
        ],
        employer: { name: 'DesignHub' }
      },
      evidence: [
        { requirementTag: 'ev-logo', fileUrl: 'https://supabase.co/logo_v1.png' }
      ]
    };

    vi.spyOn(executionApi, 'useGetAssignmentById').mockReturnValue({
      data: mockAssignment,
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    } as any);

    render(
      <MemoryRouter initialEntries={['/worker/assignments/assign-123/submit']}>
        <Routes>
          <Route path="/worker/assignments/:id/submit" element={<SubmitEvidence />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify evidence file label matches and indicates file is ready / uploaded
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('logo_v1.png')).toBeInTheDocument();
  });

  test('renders mediation locked UI instead of actions when assignment status is DISPUTED', () => {
    const mockAssignment = {
      id: 'assign-123',
      status: 'DISPUTED',
      createdAt: '2026-05-17T00:00:00.000Z',
      gig: {
        title: 'High Performance API Service',
        category: 'DEVELOPMENT',
        currency: 'KES',
        payAmount: 12000,
        evidenceTemplate: [
          { id: 'ev-repo', type: 'GITHUB', label: 'Backend Repo URL', required: true }
        ],
        employer: { name: 'Safaricom DevTeam' }
      },
      evidence: []
    };

    vi.spyOn(executionApi, 'useGetAssignmentById').mockReturnValue({
      data: mockAssignment,
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    } as any);

    render(
      <MemoryRouter initialEntries={['/worker/assignments/assign-123/submit']}>
        <Routes>
          <Route path="/worker/assignments/:id/submit" element={<SubmitEvidence />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify mediation text and locked alert card is displayed
    expect(screen.getByText('Mediation in Progress')).toBeInTheDocument();
    expect(screen.getByText(/A dispute has been raised for this assignment/)).toBeInTheDocument();

    // Verify submit and save actions are blocked/hidden from DOM
    expect(screen.queryByRole('button', { name: /Submit Work/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Save Draft/i })).toBeNull();
  });
});
