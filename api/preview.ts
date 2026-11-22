// Link previews for social apps (WhatsApp, X, Facebook, ...). Their crawlers don't run
// JavaScript, so vercel.json routes only those bots here for /product/* and /artist/*.
// Everyone else, including Google, gets the normal app.
export const config = { runtime: 'edge' };

const SITE_NAME = 'MerchDrop';
const DEFAULT_DESCRIPTION = 'Shop official merch from independent artists on MerchDrop.';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function query(path: string): Promise<Record<string, unknown> | null> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

const naira = (cents: unknown) => `₦${Math.round(Number(cents) / 100).toLocaleString('en-NG')}`;

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const type = url.searchParams.get('type');
  const id = decodeURIComponent(url.searchParams.get('id') ?? '');
  const pageUrl = `${origin}/${type}/${encodeURIComponent(id)}`;

  let title = SITE_NAME;
  let description = DEFAULT_DESCRIPTION;
  let image = `${origin}/Merchdrop.png`;

  try {
    if (type === 'product' && id) {
      const isUuid = /^[0-9a-f-]{36}$/i.test(id);
      const p = await query(`products?select=title,description,price_cents,main_image_url,artist_profiles(artist_name)`
        + `&status=eq.published&${isUuid ? 'id' : 'slug'}=eq.${encodeURIComponent(id)}&limit=1`);
      if (p) {
        const artist = (p.artist_profiles as { artist_name?: string } | null)?.artist_name;
        title = `${p.title}${artist ? ` by ${artist}` : ''} · ${naira(p.price_cents)}`;
        description = String(p.description || DEFAULT_DESCRIPTION).slice(0, 200);
        if (p.main_image_url) image = String(p.main_image_url);
      }
    } else if (type === 'artist' && id) {
      const a = await query(`public_artist_profiles?select=artist_name,bio,avatar_url,product_count`
        + `&artist_slug=eq.${encodeURIComponent(id)}&limit=1`);
      if (a) {
        title = `${a.artist_name} merch on ${SITE_NAME}`;
        description = String(a.bio || `Shop ${a.product_count} products from ${a.artist_name}.`).slice(0, 200);
        if (a.avatar_url) image = String(a.avatar_url);
      }
    }
  } catch {
    // Fall back to the generic card.
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${type === 'product' ? 'product' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@merchdrop">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="canonical" href="${esc(pageUrl)}">
</head><body><a href="${esc(pageUrl)}">${esc(title)}</a></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, s-maxage=600' },
  });
}
