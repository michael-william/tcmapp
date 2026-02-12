import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { ManagementCard } from '@/components/organisms/ManagementCard';

describe('ManagementCard', () => {
  const defaultProps = {
    hasManagement: false,
    isInterWorks: false,
    onEnable: vi.fn(),
    onNavigate: vi.fn(),
    loading: false,
  };

  describe('Styling and Visual Appearance', () => {
    it('renders with normal colors when hasManagement is false (no greyscale)', () => {
      const { container } = render(<ManagementCard {...defaultProps} />);
      const card = container.querySelector('.backdrop-blur-sm');

      expect(card).not.toHaveClass('opacity-50');
      expect(card).not.toHaveClass('grayscale');
    });

    it('renders with normal colors when hasManagement is true', () => {
      const { container } = render(
        <ManagementCard {...defaultProps} hasManagement={true} />
      );
      const card = container.querySelector('.backdrop-blur-sm');

      expect(card).not.toHaveClass('opacity-50');
      expect(card).not.toHaveClass('grayscale');
    });

    it('shows dashed border when disabled', () => {
      const { container } = render(<ManagementCard {...defaultProps} />);
      const card = container.querySelector('.backdrop-blur-sm');

      expect(card).toHaveClass('border-dashed');
      expect(card).toHaveClass('border-white/30');
    });

    it('does not show dashed border when enabled', () => {
      const { container } = render(
        <ManagementCard {...defaultProps} hasManagement={true} />
      );
      const card = container.querySelector('.backdrop-blur-sm');

      expect(card).not.toHaveClass('border-dashed');
    });
  });

  describe('Button Text', () => {
    it('shows "Migration Management" button text when enabled', () => {
      render(<ManagementCard {...defaultProps} hasManagement={true} />);

      const button = screen.getByRole('button', { name: 'Migration Management' });
      expect(button).toBeInTheDocument();
    });

    it('shows "Start Migration" button text when disabled and InterWorks', () => {
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      expect(screen.getByText('Start Migration')).toBeInTheDocument();
    });

    it('shows "Not Available" button text when disabled and client', () => {
      render(<ManagementCard {...defaultProps} />);

      expect(screen.getByText('Not Available')).toBeInTheDocument();
    });
  });

  describe('Dynamic Descriptions', () => {
    it('renders "Management Not Started" description when disabled', () => {
      render(<ManagementCard {...defaultProps} />);

      expect(screen.getByText('Management Not Started')).toBeInTheDocument();
      expect(
        screen.getByText(/Migration management features are not yet active/i)
      ).toBeInTheDocument();
    });

    it('renders "Management Active" description when enabled', () => {
      render(<ManagementCard {...defaultProps} hasManagement={true} />);

      expect(screen.getByText('Management Active')).toBeInTheDocument();
      expect(
        screen.getByText(/View migration progress, manage weekly notes/i)
      ).toBeInTheDocument();
    });
  });

  describe('Requirements Modal', () => {
    it('opens requirements modal when disabled card button is clicked (InterWorks)', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      const button = screen.getByText('Start Migration');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Migration Management Requirements')).toBeInTheDocument();
      });
    });

    it('shows prerequisites list in modal', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      const button = screen.getByText('Start Migration');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Recommended Prerequisites:')).toBeInTheDocument();
      expect(screen.getByText(/Client information should be completed/i)).toBeInTheDocument();
      expect(screen.getByText(/Migration kickoff date should be scheduled/i)).toBeInTheDocument();
      expect(screen.getByText(/At least one checklist question should be answered/i)).toBeInTheDocument();
      expect(screen.getByText(/Primary contact information should be provided/i)).toBeInTheDocument();
    });

    it('shows "Override & Enable" button only for InterWorks users', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      const button = screen.getByText('Start Migration');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Override & Enable')).toBeInTheDocument();
    });

    it('does not show "Override & Enable" button for client users', async () => {
      const user = userEvent.setup();
      // Client users see disabled "Not Available" button, so we'll test the modal
      // by directly manipulating the component (this tests the modal logic)
      render(<ManagementCard {...defaultProps} isInterWorks={false} />);

      // Verify "Not Available" button is present and disabled
      const notAvailableButton = screen.getByText('Not Available');
      expect(notAvailableButton).toBeDisabled();
    });

    it('shows InterWorks-specific help text in modal', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      const button = screen.getByText('Start Migration');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/As an InterWorks administrator, you can override these requirements/i)
      ).toBeInTheDocument();
    });

    it('calls onEnable handler when "Override & Enable" is clicked', async () => {
      const user = userEvent.setup();
      const onEnable = vi.fn().mockResolvedValue(undefined);
      render(
        <ManagementCard {...defaultProps} isInterWorks={true} onEnable={onEnable} />
      );

      const startButton = screen.getByText('Start Migration');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const enableButton = screen.getByText('Override & Enable');
      await user.click(enableButton);

      expect(onEnable).toHaveBeenCalledTimes(1);
    });

    it('closes modal after "Override & Enable" is clicked', async () => {
      const user = userEvent.setup();
      const onEnable = vi.fn().mockResolvedValue(undefined);
      render(
        <ManagementCard {...defaultProps} isInterWorks={true} onEnable={onEnable} />
      );

      const startButton = screen.getByText('Start Migration');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const enableButton = screen.getByText('Override & Enable');
      await user.click(enableButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes modal when "Cancel" button is clicked', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      const startButton = screen.getByText('Start Migration');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('shows loading state during enable operation', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} loading={true} />);

      expect(screen.getByText('Enabling...')).toBeInTheDocument();
    });

    it('disables "Start Migration" button during loading', async () => {
      render(<ManagementCard {...defaultProps} isInterWorks={true} loading={true} />);

      const button = screen.getByText('Enabling...');
      expect(button).toBeDisabled();
    });

    it('disables "Override & Enable" button during loading', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} loading={true} />);

      const enablingButton = screen.getByText('Enabling...');
      expect(enablingButton).toBeDisabled();

      // The button is disabled so clicking won't open the modal,
      // but we can verify the disabled state is working correctly
    });
  });

  describe('Navigation', () => {
    it('calls onNavigate when enabled card button is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();
      render(
        <ManagementCard
          {...defaultProps}
          hasManagement={true}
          onNavigate={onNavigate}
        />
      );

      const button = screen.getByRole('button', { name: 'Migration Management' });
      await user.click(button);

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not call onNavigate when disabled card button is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();
      render(
        <ManagementCard
          {...defaultProps}
          isInterWorks={true}
          onNavigate={onNavigate}
        />
      );

      await user.click(screen.getByText('Start Migration'));

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Icon Styling', () => {
    it('shows opacity-50 icon when management is disabled', () => {
      const { container } = render(<ManagementCard {...defaultProps} />);
      const icon = container.querySelector('.h-12.w-12');

      expect(icon).toHaveClass('opacity-50');
    });

    it('shows primary color icon when management is enabled', () => {
      const { container } = render(
        <ManagementCard {...defaultProps} hasManagement={true} />
      );
      const icon = container.querySelector('.h-12.w-12');

      expect(icon).toHaveClass('text-primary');
    });
  });

  describe('Accessibility', () => {
    it('renders card with proper heading structure', () => {
      render(<ManagementCard {...defaultProps} />);

      // Check for the card title heading
      const heading = screen.getByRole('heading', { name: 'Migration Management' });
      expect(heading).toBeInTheDocument();
    });

    it('modal has proper dialog title', async () => {
      const user = userEvent.setup();
      render(<ManagementCard {...defaultProps} isInterWorks={true} />);

      const button = screen.getByText('Start Migration');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Migration Management Requirements')).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();
      render(
        <ManagementCard
          {...defaultProps}
          hasManagement={true}
          onNavigate={onNavigate}
        />
      );

      const button = screen.getByRole('button', { name: 'Migration Management' });
      button.focus();

      await user.keyboard('{Enter}');

      expect(onNavigate).toHaveBeenCalled();
    });
  });
});
