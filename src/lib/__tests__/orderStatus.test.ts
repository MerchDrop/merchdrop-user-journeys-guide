import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ORDER_FLOW, ORDER_STATUS_LABELS, isStalePending } from '../orderStatus';

const read = (p: string) => readFileSync(resolve(__dirname, '../../..', p), 'utf8');

describe('order statuses', () => {
  it('match the edge functions and the database constraint', () => {
    const statuses = Object.keys(ORDER_STATUS_LABELS).sort();

    const shared = read('supabase/functions/_shared/orders.ts');
    const sharedLabels = shared.slice(shared.indexOf('STATUS_LABELS'), shared.indexOf('};'));
    expect([...sharedLabels.matchAll(/^\s+(\w+):/gm)].map((m) => m[1]).sort()).toEqual(statuses);

    const migration = read('supabase/migrations/20261122000000_orders_fulfillment.sql');
    const check = migration.slice(migration.indexOf('ADD CONSTRAINT orders_status_check'));
    const inCheck = [...check.slice(0, check.indexOf('));')).matchAll(/'(\w+)'/g)].map((m) => m[1]).sort();
    expect(inCheck).toEqual(statuses);

    const flowSrc = shared.slice(shared.indexOf('export const FLOW'), shared.indexOf('];', shared.indexOf('export const FLOW')));
    expect([...flowSrc.matchAll(/"(\w+)"/g)].map((m) => m[1])).toEqual(ORDER_FLOW);
  });

  it('hides only unpaid orders older than 24 hours', () => {
    const now = Date.parse('2026-11-22T12:00:00Z');
    const old = '2026-11-21T11:00:00Z';
    const fresh = '2026-11-22T11:00:00Z';
    expect(isStalePending({ status: 'payment_pending', created_at: old }, now)).toBe(true);
    expect(isStalePending({ status: 'payment_pending', created_at: fresh }, now)).toBe(false);
    expect(isStalePending({ status: 'payment_received', created_at: old }, now)).toBe(false);
  });
});
