// Printable packing slips for admin fulfillment. Opens a print window with one page per order.

interface SlipItem {
  quantity: number;
  product_variant?: { size?: string | null; color?: string | null } | null;
  products?: { title?: string | null } | null;
}

export interface SlipOrder {
  order_number: string;
  created_at: string;
  customer_email?: string | null;
  shipping_address?: Record<string, unknown> | null;
  carrier_name?: string | null;
  tracking_number?: string | null;
  order_items?: SlipItem[];
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function slip(o: SlipOrder): string {
  const a = (o.shipping_address ?? {}) as Record<string, string>;
  const name = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
  const address = [a.address, a.city, a.state, a.zipCode, a.country].filter(Boolean).map(esc).join('<br>');
  const rows = (o.order_items ?? []).map((i) => {
    const variant = [i.product_variant?.color, i.product_variant?.size].filter(Boolean).join(' / ');
    return `<tr><td class="box"></td><td>${esc(i.products?.title ?? 'Item')}</td><td>${esc(variant)}</td><td class="qty">${i.quantity}</td></tr>`;
  }).join('');
  return `<section class="slip">
    <header><h1>MerchDrop</h1><div><strong>${esc(o.order_number)}</strong><br>${esc(new Date(o.created_at).toLocaleDateString())}</div></header>
    <div class="ship"><h2>Ship to</h2><p><strong>${esc(name)}</strong><br>${address}${a.phone ? `<br>${esc(a.phone)}` : ''}${o.customer_email ? `<br>${esc(o.customer_email)}` : ''}</p>
    ${o.tracking_number ? `<p>Carrier: ${esc(o.carrier_name)} · Tracking: ${esc(o.tracking_number)}</p>` : ''}</div>
    <table><thead><tr><th class="box">✓</th><th>Item</th><th>Variant</th><th class="qty">Qty</th></tr></thead><tbody>${rows}</tbody></table>
    <footer>Thank you for supporting independent artists. Questions? Reply to your order email.</footer>
  </section>`;
}

/** Open the browser print dialog with a packing slip per order. Returns false if pop-ups are blocked. */
export function printPackingSlips(orders: SlipOrder[]): boolean {
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return false;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Packing slips</title><style>
    body{font-family:system-ui,Arial,sans-serif;color:#111;margin:0}
    .slip{padding:32px;page-break-after:always}
    .slip:last-child{page-break-after:auto}
    header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:12px}
    h1{margin:0;font-size:24px} h2{font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#555;margin:20px 0 4px}
    table{width:100%;border-collapse:collapse;margin-top:20px} th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd}
    .qty{text-align:right;width:60px} .box{width:28px} td.box::before{content:'';display:inline-block;width:14px;height:14px;border:1px solid #111}
    footer{margin-top:32px;color:#555;font-size:13px}
  </style></head><body>${orders.map(slip).join('')}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
