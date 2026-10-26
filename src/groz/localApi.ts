// Browser-side stand-in for the original Express API (public endpoints only).
// Orders are kept in this browser's storage until a real backend is connected.
import { BUSINESS_CONFIG } from './config/business';
import { INITIAL_PRODUCTS } from './data/products';
import seedOrders from './data/seedOrders.json';
import type { Order } from './types';

const ORDERS_KEY = 'groz_local_orders';
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedOrders as Order[];
}
const saveOrders = (o: Order[]) => localStorage.setItem(ORDERS_KEY, JSON.stringify(o));

export function deliveryCharge(area: string) {
  return area === 'inside_noakhali'
    ? BUSINESS_CONFIG.delivery.insideNoakhaliBDT
    : BUSINESS_CONFIG.delivery.outsideNoakhaliBDT;
}

async function handle(path: string, init?: RequestInit): Promise<Response | null> {
  const method = (init?.method || 'GET').toUpperCase();
  if (path.startsWith('/api/products') && method === 'GET') {
    return json(INITIAL_PRODUCTS.filter((p) => p.isPublished !== false));
  }
  if (path === '/api/orders' && method === 'POST') {
    const b = JSON.parse(String(init?.body || '{}'));
    if (!b.customerName || !b.customerPhone || !b.deliveryAddress || !Array.isArray(b.items) || !b.items.length)
      return json({ error: 'Missing required order fields (name, phone, address, items).' }, 400);
    let subtotal = 0;
    const items = b.items.map((it: any) => {
      const p = INITIAL_PRODUCTS.find((x) => x.id === it.productId);
      const price = p ? (typeof p.salePriceBDT === 'number' ? p.salePriceBDT : p.priceBDT) : Number(it.priceBDT) || 0;
      const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
      subtotal += price * qty;
      return { productId: it.productId, productName: p?.nameEn || it.productName, priceBDT: price, quantity: qty, color: it.color, size: it.size, image: p?.image || it.image };
    });
    const dc = deliveryCharge(b.deliveryArea);
    const pay = BUSINESS_CONFIG.paymentMethods.find((m) => m.id === b.paymentMethod);
    const now = new Date().toISOString();
    const order: Order = {
      id: `GROZ-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`,
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
    saveOrders([order, ...getOrders()]);
    return json({ success: true, order }, 201);
  }
  const m = path.match(/^\/api\/orders\/lookup\/(.+)$/);
  if (m && method === 'GET') {
    const q = decodeURIComponent(m[1]).trim().toLowerCase();
    const o = getOrders().find((x) => x.id.toLowerCase() === q || x.customerPhone.includes(q));
    if (!o) return json({ error: 'Order reference not found in archive.' }, 404);
    return json({ id: o.id, customerName: o.customerName, orderStatus: o.orderStatus, paymentStatus: o.paymentStatus, totalBDT: o.totalBDT, deliveryArea: o.deliveryArea, itemsCount: o.items.reduce((s, i) => s + i.quantity, 0), createdAt: o.createdAt });
  }
  if (path.startsWith('/api/admin')) {
    return json({ error: 'Owner dashboard is not connected to a backend yet.' }, 503);
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
    const path = url.startsWith('/') ? url : new URL(url).origin === location.origin ? new URL(url).pathname : '';
    if (path.startsWith('/api/')) {
      const res = await handle(path.split('?')[0], init);
      if (res) return res;
    }
    return orig(input as any, init);
  };
}
