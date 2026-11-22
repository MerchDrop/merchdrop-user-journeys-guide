import { Share2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps extends Omit<ButtonProps, 'onClick'> {
  title: string;
  text?: string;
  /** Defaults to the current page. */
  url?: string;
  label?: string;
}

/** Native share sheet on phones; copies the link elsewhere. */
export function ShareButton({ title, text, url, label, ...buttonProps }: ShareButtonProps) {
  const { toast } = useToast();

  const share = async () => {
    const link = url ?? window.location.href.split('#')[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
      } catch { /* user closed the share sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Link copied', description: 'Paste it anywhere to share.' });
    } catch {
      toast({ title: "Couldn't copy the link", description: link, variant: 'destructive' });
    }
  };

  return (
    <Button onClick={share} aria-label={label ? undefined : `Share ${title}`} {...buttonProps}>
      <Share2 className={label ? 'h-4 w-4 mr-2' : 'h-4 w-4'} />
      {label}
    </Button>
  );
}
