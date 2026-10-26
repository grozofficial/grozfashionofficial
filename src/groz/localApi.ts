// @ts-nocheck
// Browser-side adapter: keeps the original /api/* calls but serves them from Lovable Cloud.
import { BUSINESS_CONFIG } from './config/business';
import { INITIAL_PRODUCTS } from './data/products';
import { supabase } from '@/integrations/supabase/client';
import type { Order, Product } from './types';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export function deliveryCharge(area: string) {
  return area === 'inside_noakhali'
    ? BUSINESS_CONFIG.delivery.insideNoakhaliBDT
    : BUSINESS_CONFIG.delivery.outsideNoakhaliBDT;
}

// Built-in catalog merged with owner edits stored in the database.
async function loadCatalog(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('id, data, is_deleted, updated_at');
  if (error) throw error;
  const rows = new Map((data || []).map((r) => [r.id, r]));
  const out: Product[] = [];
  for (const p of INITIAL_PRODUCTS) {
    const r = rows.get(p.id);
    if (r?.is_deleted) continue;
    out.push(r ? (r.data as Product) : p);
    rows.delete(p.id);
  }
  const extra = [...rows.values()]
    .filter((r) => !r.is_deleted)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map((r) => r.data as Product);
  return [...extra, ...out];
}

async function saveProduct(p: Product) {
  const now = new Date().toISOString();
  const product = { ...p, createdAt: p.createdAt || now, updatedAt: now };
  const { error } = await supabase.from('products').upsert({
    id: product.id, data: product, is_published: product.isPublished !== false, is_deleted: false, updated_at: now,
  });
  if (error) return json({ error: error.message }, 403);
  return json({ success: true, product });
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function handle(path: string, query: URLSearchParams, init?: RequestInit): Promise<Response | null> {
  const method = (init?.method || 'GET').toUpperCase();
  const body = () => JSON.parse(String(init?.body || '{}'));

  if (path === '/api/products' && method === 'GET') {
    const list = await loadCatalog();
    return json(query.get('all') === 'true' ? list : list.filter((p) => p.isPublished !== false));
  }

  if (path === '/api/orders' && method === 'POST') {
    const b = body();
    if (!b.customerName || !b.customerPhone || !b.deliveryAddress || !Array.isArray(b.items) || !b.items.length)
      return json({ error: 'Missing required order fields (name, phone, address, items).' }, 400);
    const catalog = await loadCatalog();
    let subtotal = 0;
    const items = b.items.map((it: any) => {
      const p = catalog.find((x) => x.id === it.productId);
      const price = p ? (typeof p.salePriceBDT === 'number' ? p.salePriceBDT : p.priceBDT) : Number(it.priceBDT) || 0;
      const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
      subtotal += price * qty;
      return { productId: it.productId, productName: p?.nameEn || it.productName, priceBDT: price, quantity: qty, color: it.color, size: it.size, image: p?.image || it.image };
    });
    const dc = deliveryCharge(b.deliveryArea);
    const pay = BUSINESS_CONFIG.paymentMethods.find((m) => m.id === b.paymentMethod);
    const now = new Date().toISOString();
    const order: Order = {
      id: `GROZ-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: String(b.customerName).trim(),
      customerPhone: String(b.customerPhone).trim(),
      customerEmail: b.customerEmail || undefined,
      deliveryAddress: String(b.deliveryAddress).trim(),
      deliveryArea: b.deliveryArea === 'inside_noakhali' ? 'inside_noakhali' : 'outside_noakhali',
      deliveryChargeBDT: dc,
      items,
      subtotalBDT: subtotal,
      totalBDT: subtotal + dc,
      paymentMethod: b.paymentMethod || 'bkash',
      paymentNumber: pay ? pay.number : BUSINESS_CONFIG.phone,
      transactionId: b.transactionId || undefined,
      customerNotes: b.customerNotes || undefined,
      orderStatus: 'Pending',
      paymentStatus: 'Unverified',
      createdAt: now,
      updatedAt: now,
    };
    const { error } = await supabase.from('orders').insert({
      id: order.id, data: order, customer_phone: order.customerPhone, order_status: 'Pending',
    });
    if (error) return json({ error: 'Could not place order. Please try again.' }, 500);
    return json({ success: true, order }, 201);
  }

  const lookup = path.match(/^\/api\/orders\/lookup\/(.+)$/);
  if (lookup && method === 'GET') {
    const { data } = await supabase.rpc('lookup_order', { _q: decodeURIComponent(lookup[1] ?? '') });
    if (!data) return json({ error: 'Order reference not found in archive.' }, 404);
    return json(data);
  }

  if (path === '/api/admin/logout') return json({ success: true });

  if (path === '/api/admin/orders' && method === 'GET') {
    let q = supabase.from('orders').select('data').order('created_at', { ascending: false });
    const status = query.get('status');
    if (status && status !== 'all') q = q.eq('order_status', status);
    const { data, error } = await q;
    if (error) return json({ error: error.message }, 403);
    return json((data || []).map((r) => r.data));
  }

  const st = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
  if (st && method === 'PATCH') {
    const id = decodeURIComponent(st[1]);
    const b = body();
    const { data: row, error } = await supabase.from('orders').select('data').eq('id', id).maybeSingle();
    if (error || !row) return json({ error: 'Order not found.' }, 404);
    const order = { ...row.data, updatedAt: new Date().toISOString() };
    if (b.orderStatus) order.orderStatus = b.orderStatus;
    if (b.paymentStatus) order.paymentStatus = b.paymentStatus;
    const { error: e2 } = await supabase.from('orders').update({ data: order, order_status: order.orderStatus }).eq('id', id);
    if (e2) return json({ error: e2.message }, 403);
    return json({ success: true, order });
  }

  if (path === '/api/admin/upload' && method === 'POST') {
    // Images are stored with the product itself.
    const b = body();
    if (!b.dataUrl) return json({ error: 'No image provided.' }, 400);
    return json({ url: b.dataUrl });
  }

  if (path === '/api/admin/products' && method === 'POST') {
    const b = body();
    const id = b.id || `groz-${slugify(b.nameEn || 'item')}-${Date.now().toString(36)}`;
    return saveProduct({ ...b, id, slug: b.slug || slugify(b.nameEn || id) });
  }

  const pm = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (pm && method === 'PUT') return saveProduct({ ...body(), id: decodeURIComponent(pm[1]) });
  if (pm && method === 'DELETE') {
    const id = decodeURIComponent(pm[1]);
    const existing = (await loadCatalog()).find((p) => p.id === id);
    const { error } = await supabase.from('products').upsert({
      id, data: existing || { id }, is_deleted: true, is_published: false, updated_at: new Date().toISOString(),
    });
    if (error) return json({ error: error.message }, 403);
    return json({ success: true });
  }

  return null;
}

let installed = false;
export function installLocalApi() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const u = new URL(url, location.origin);
    if (u.origin === location.origin && u.pathname.startsWith('/api/')) {
      try {
        const res = await handle(u.pathname, u.searchParams, init);
        if (res) return res;
      } catch (e: any) {
        return json({ error: e?.message || 'Server error' }, 500);
      }
    }
    return orig(input as any, init);
  };
}
