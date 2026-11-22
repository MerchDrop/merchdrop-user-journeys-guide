import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { couponDiscount } from '../payments';
import { formatTimeLeft } from '@/components/product/DropCountdown';

describe('couponDiscount', () => {
  it('applies percentages and fixed amounts, never below zero', () => {
    expect(couponDiscount({ type: 'percentage', value: 10 }, 15000)).toBe(1500);
    expect(couponDiscount({ type: 'percentage', value: 33 }, 999)).toBe(329.67);
    expect(couponDiscount({ type: 'fixed', value: 2000 }, 15000)).toBe(2000);
    expect(couponDiscount({ type: 'fixed', value: 20000 }, 15000)).toBe(15000);
  });

  it('uses the same formula as the server', () => {
    const server = readFileSync(resolve(__dirname, '../../../supabase/functions/process-payment/index.ts'), 'utf8');
    expect(server).toContain('Math.min(subtotal, Math.round((c.type === "percentage" ? subtotal * c.value / 100 : c.value) * 100) / 100)');
  });
});

describe('formatTimeLeft', () => {
  it('shows days, hours or minutes/seconds', () => {
    expect(formatTimeLeft((2 * 86400 + 4 * 3600 + 12 * 60) * 1000)).toBe('2d 4h 12m');
    expect(formatTimeLeft((3 * 3600 + 5 * 60) * 1000)).toBe('3h 5m');
    expect(formatTimeLeft(249_000)).toBe('4m 09s');
    expect(formatTimeLeft(-5)).toBe('0m 00s');
  });
});
