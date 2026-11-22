import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/** Time left until `dropAt`, e.g. "2d 4h 12m" or "4m 09s" in the last hour. */
export function formatTimeLeft(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(sec).padStart(2, '0')}s`;
}

/** Re-renders every second until the drop time; returns true once it has passed. */
export function useDropOpen(dropAt: string | null | undefined): { open: boolean; msLeft: number } {
  const target = dropAt ? Date.parse(dropAt) : 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target || target <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);
  return { open: !target || target <= now, msLeft: target - now };
}

export function DropCountdown({ msLeft }: { msLeft: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
      <Clock className="h-5 w-5 text-primary shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">This drop opens in</p>
        <p className="text-xl font-bold tabular-nums" aria-live="off">{formatTimeLeft(msLeft)}</p>
      </div>
    </div>
  );
}
