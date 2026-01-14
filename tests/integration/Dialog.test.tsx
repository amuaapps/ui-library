import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';
import { Button } from '@/components/button';

describe('Dialog Component', () => {
  describe('rendering', () => {
    it('renders trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
    });

    it('does not render content initially', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });

    it('renders content when opened', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog Description')).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });
    });

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });

    it('can be controlled with open prop', () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Title')).not.toBeInTheDocument();

      rerender(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('composition', () => {
    it('renders complete dialog structure', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <div>Dialog Content</div>
            <DialogFooter>
              <Button>Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog Description')).toBeInTheDocument();
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has dialog role', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('has accessible title', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleName('Accessible Title');
      });
    });

    it('has accessible description', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>This is a description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleDescription('This is a description');
      });
    });

    it('traps focus within dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            <Button>First Button</Button>
            <Button>Second Button</Button>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });

      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', { name: /second button/i });
      const closeButton = screen.getByRole('button', { name: /close/i });

      // Focus should be trapped within the dialog
      // Tab through all focusable elements
      await user.tab();
      const focusedElement = document.activeElement;
      
      // Verify focus is on one of the dialog's buttons
      expect([firstButton, secondButton, closeButton]).toContain(focusedElement);
    });
  });

  describe('token compliance', () => {
    it('uses semantic color tokens', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.className).toContain('bg-background');
        expect(dialog.className).not.toMatch(/#[0-9a-f]{3,6}/i);
      });
    });
  });
});
