import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskStatusIndicator } from '../../client/src/components/ui/UiPrimitives.tsx';
import { DemoNoticeBanner } from '../../client/src/components/ui/UiPrimitives.tsx';
import { ClinicalDisclaimerNotice } from '../../client/src/components/ui/UiPrimitives.tsx';
import { EmptyStatePanel } from '../../client/src/components/ui/UiPrimitives.tsx';
import { ErrorStatePanel } from '../../client/src/components/ui/UiPrimitives.tsx';
import { TableSkeleton } from '../../client/src/components/ui/UiPrimitives.tsx';
import { ModalDialog } from '../../client/src/components/ui/ConfirmModal.tsx';
import { ProtectedRoute } from '../../client/src/components/auth/ProtectedRoute.tsx';
import { AuthProvider, useAuth } from '../../client/src/context/AuthContext.tsx';
import { ROLE_DEMO_PERSONAS } from '../../client/src/data/demoPortalData.ts';
import type { UserRole } from '../../shared/constants/bloodNetwork.ts';

describe('UI Primitives', () => {
  describe('RiskStatusIndicator', () => {
    it('renders CRITICAL with shield alert icon and red color', () => {
      render(<RiskStatusIndicator level="CRITICAL" />);
      expect(screen.getByText('Critical Shortage')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /shield/i })).toBeInTheDocument();
      const indicator = screen.getByText('Critical Shortage').closest('span');
      expect(indicator).toHaveStyle({ color: 'rgb(201, 52, 64)' });
    });

    it('renders MODERATE with alert triangle icon and amber color', () => {
      render(<RiskStatusIndicator level="MODERATE" />);
      expect(screen.getByText('Moderate Watch')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /alert/i })).toBeInTheDocument();
    });

    it('renders LOW with check circle icon and green color', () => {
      render(<RiskStatusIndicator level="LOW" />);
      expect(screen.getByText('Healthy Supply')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /check/i })).toBeInTheDocument();
    });
  });

  describe('DemoNoticeBanner', () => {
    it('renders demo notice with context', () => {
      render(<DemoNoticeBanner context="Test Context" />);
      expect(screen.getByText('DEMO DATA:')).toBeInTheDocument();
      expect(screen.getByText('Test Context')).toBeInTheDocument();
    });

    it('renders compact variant', () => {
      render(<DemoNoticeBanner compact />);
      const banner = screen.getByText('DEMO DATA:').closest('div');
      expect(banner).toHaveClass('px-3.5 py-2 text-xs');
    });

    it('renders forest variant with dark colors', () => {
      render(<DemoNoticeBanner variant="forest" />);
      const banner = screen.getByText('DEMO DATA:').closest('div');
      expect(banner).toHaveClass('bg-[var(--bn-primary)]');
    });
  });

  describe('ClinicalDisclaimerNotice', () => {
    it('renders clinical disclaimer with proper content', () => {
      render(<ClinicalDisclaimerNotice />);
      expect(screen.getByText('Clinical Protocol Notice:')).toBeInTheDocument();
      expect(screen.getByText(/supply visibility only/i)).toBeInTheDocument();
      expect(screen.getByText(/NACO\/NBTC/i)).toBeInTheDocument();
    });

    it('renders forest variant with dark colors', () => {
      render(<ClinicalDisclaimerNotice variant="forest" />);
      const notice = screen.getByText('Clinical Protocol Notice:').closest('div');
      expect(notice).toHaveClass('bg-[#123D2B]');
    });
  });

  describe('EmptyStatePanel', () => {
    it('renders title and description', () => {
      render(<EmptyStatePanel title="No Results" description="Try again" />);
      expect(screen.getByText('No Results')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      const handleAction = vi.fn();
      render(<EmptyStatePanel title="No Results" description="Try again" actionLabel="Retry" onAction={handleAction} />);
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders custom icon when provided', () => {
      render(<EmptyStatePanel title="No Results" description="Try again" icon={<span data-testid="custom-icon" />} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('ErrorStatePanel', () => {
    it('renders error message and retry button', () => {
      const handleRetry = vi.fn();
      render(<ErrorStatePanel message="Something went wrong" onRetry={handleRetry} />);
      expect(screen.getByText('Unable to load network records')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry Request' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Retry Request' }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('has alert role for screen readers', () => {
      render(<ErrorStatePanel message="Error" onRetry={vi.fn()} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('renders specified number of skeleton rows', () => {
      render(<TableSkeleton rows={3} />);
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3);
    });

    it('defaults to 5 rows', () => {
      render(<TableSkeleton />);
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(5);
    });
  });
});

describe('ModalDialog', () => {
  it('renders when open', () => {
    render(<ModalDialog open={true} onClose={vi.fn()} title="Test Modal" />);
    expect(screen.getByRole('dialog', { name: 'Test Modal' })).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ModalDialog open={false} onClose={vi.fn()} title="Test Modal" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<ModalDialog open={true} onClose={vi.fn()} title="Test" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(<ModalDialog open={true} onClose={onClose} title="Test" />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<ModalDialog open={true} onClose={onClose} title="Test" />);
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders children content', () => {
    render(
      <ModalDialog open={true} onClose={vi.fn()} title="Test">
        <p data-testid="modal-content">Modal content here</p>
      </ModalDialog>
    );
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('has close button with aria-label', () => {
    render(<ModalDialog open={true} onClose={vi.fn()} title="Test" />);
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });
});

describe('AuthContext', () => {
  const renderWithAuth = (children: React.ReactNode) => {
    return render(<AuthProvider>{children}</AuthProvider>);
  };

  it('provides login function', () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return null;
    };
    renderWithAuth(<TestComponent />);
    expect(authValue.login).toBeDefined();
    expect(authValue.logout).toBeDefined();
    expect(authValue.requireAuth).toBeDefined();
  });

  it('logs in and sets user', async () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return <button onClick={() => authValue.login('HOSPITAL_COORDINATOR')}>Login</button>;
    };
    renderWithAuth(<TestComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(authValue.user).toEqual(ROLE_DEMO_PERSONAS.HOSPITAL_COORDINATOR);
    expect(authValue.isAuthenticated).toBe(true);
  });

  it('logs out and clears user', async () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return (
        <>
          <button onClick={() => authValue.login('HOSPITAL_COORDINATOR')}>Login</button>
          <button onClick={() => authValue.logout()}>Logout</button>
        </>
      );
    };
    renderWithAuth(<TestComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(authValue.isAuthenticated).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(authValue.user).toBeNull();
    expect(authValue.isAuthenticated).toBe(false);
  });

  it('requireAuth returns false when not authenticated', () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return <span data-testid="result">{String(authValue.requireAuth())}</span>;
    };
    renderWithAuth(<TestComponent />);
    expect(screen.getByTestId('result').textContent).toBe('false');
  });

  it('requireAuth returns true when authenticated with correct role', async () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return <span data-testid="result">{String(authValue.requireAuth(['HOSPITAL_COORDINATOR']))}</span>;
    };
    renderWithAuth(<TestComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByTestId('result').textContent).toBe('true');
  });

  it('requireAuth returns false when authenticated with wrong role', async () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return <span data-testid="result">{String(authValue.requireAuth(['ADMIN']))}</span>;
    };
    renderWithAuth(<TestComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByTestId('result').textContent).toBe('false');
  });

  it('persists user in sessionStorage', async () => {
    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return <button onClick={() => authValue.login('HOSPITAL_COORDINATOR')}>Login</button>;
    };
    renderWithAuth(<TestComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(sessionStorage.getItem('blood-network-user')).toBeTruthy();
  });
});

describe('ProtectedRoute', () => {
  const renderProtected = (props: {
    allowedRoles?: UserRole[];
    children: React.ReactNode;
    onNavigate?: (page: string) => void;
  }) => {
    return render(
      <AuthProvider>
        <ProtectedRoute {...props} />
      </AuthProvider>
    );
  };

  it('shows login prompt when not authenticated', () => {
    renderProtected({
      allowedRoles: ['HOSPITAL_COORDINATOR'],
      children: <div data-testid="protected-content">Protected</div>,
      onNavigate: vi.fn(),
    });
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows login prompt with role selector when multiple roles allowed', () => {
    renderProtected({
      allowedRoles: ['HOSPITAL_COORDINATOR', 'BLOOD_BANK_OFFICER'],
      children: <div data-testid="protected-content">Protected</div>,
      onNavigate: vi.fn(),
    });
    expect(screen.getByText('Select role to continue:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hospital Coordinator' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Blood Bank Officer' })).toBeInTheDocument();
  });

  it('shows access denied when authenticated with wrong role', async () => {
    const onNavigate = vi.fn();
    renderProtected({
      allowedRoles: ['ADMIN'],
      children: <div data-testid="protected-content">Protected</div>,
      onNavigate,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Hospital Coordinator' }));
    expect(screen.getByText('403 · Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Hospital Coordinator')).toBeInTheDocument();
    expect(screen.getByText('Network Admin')).toBeInTheDocument();
  });

  it('renders children when authenticated with correct role', async () => {
    renderProtected({
      allowedRoles: ['HOSPITAL_COORDINATOR'],
      children: <div data-testid="protected-content">Protected Content</div>,
      onNavigate: vi.fn(),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Hospital Coordinator' }));
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});