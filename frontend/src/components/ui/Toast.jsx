import { Toaster as Sonner } from 'sonner';

export const Toaster = ({ ...props }) => (
  <Sonner
    position="bottom-right"
    toastOptions={{
      classNames: {
        error: 'border-destructive bg-destructive text-destructive-foreground',
        success: 'border-primary bg-primary text-primary-foreground',
      },
    }}
    {...props}
  />
);

export { toast } from 'sonner';
