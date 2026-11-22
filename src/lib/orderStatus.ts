// Order statuses. Must match supabase/functions/_shared/orders.ts and the orders_status_check constraint.

export const ORDER_STATUS_LABELS: Record<string, string> = {
  payment_pending: 'Payment pending',
  payment_failed: 'Payment failed',
  payment_received: 'Payment received',
  processing: 'Order processing',
  ready_for_pickup: 'Ready for pickup by carrier',
  assigned_to_carrier: 'Shipped',
  picked_up: 'Picked up by carrier',
  on_the_way: 'On its way',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

/** The normal path, in order. */
export const ORDER_FLOW = [
  'payment_received', 'processing', 'ready_for_pickup', 'assigned_to_carrier',
  'picked_up', 'on_the_way', 'delivered', 'completed',
];

/** Statuses an admin can pick (Completed is automatic). */
export const ADMIN_STATUSES = [...ORDER_FLOW.slice(1, -1), 'cancelled'];

/** Reaching these going forward emails the customer. */
export const EMAILED_STATUSES = new Set(['assigned_to_carrier', 'on_the_way', 'delivered', 'cancelled']);

export const orderStatusLabel = (status?: string | null) =>
  ORDER_STATUS_LABELS[status ?? ''] ?? status ?? 'Unknown';

export function orderStatusTone(status?: string | null): string {
  switch (status) {
    case 'payment_failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'payment_pending':
    case 'refunded':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-300';
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'assigned_to_carrier':
    case 'picked_up':
    case 'on_the_way':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }
}

/** Unpaid orders older than this are hidden from the customer's Orders list. */
export const STALE_PENDING_MS = 24 * 60 * 60 * 1000;

export const isStalePending = (order: { status?: string | null; created_at: string }, now = Date.now()) =>
  order.status === 'payment_pending' && now - new Date(order.created_at).getTime() > STALE_PENDING_MS;
