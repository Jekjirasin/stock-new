// ===========================================================================
// ชั้น API เดิมของหน้าเว็บ (apiGet / apiPost) ที่เปลี่ยนมาคุยกับ Supabase
// หน้า index.html ไม่ต้องแก้โค้ดส่วนอื่น เพราะชื่อ action และรูปแบบข้อมูลเหมือนเดิม
// ต้องมี SUPABASE_URL และ SUPABASE_ANON_KEY ใน config.js
// ===========================================================================
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const PAGE = 1000; // Supabase คืนสูงสุด 1000 แถวต่อครั้ง

async function ok(promise) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message || 'เกิดข้อผิดพลาด');
  return data;
}

// ดึงทุกแถว (วนหน้าอัตโนมัติ)
async function fetchAll(buildQuery) {
  let all = [], from = 0;
  while (true) {
    const rows = await ok(buildQuery().range(from, from + PAGE - 1));
    all = all.concat(rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

const toProduct = r => ({
  id: r.id, name: r.name, category: r.category || '', unit: r.unit || '',
  qty: Number(r.qty), minQty: Number(r.min_qty), price: Number(r.price)
});

const toTx = r => ({
  timestamp: r.ts,            // ISO string (หน้าเว็บแปลงเป็นเวลาไทยเอง)
  productId: r.product_id,
  productName: r.product_name,
  type: r.type,
  qty: Number(r.qty),
  balanceAfter: Number(r.balance_after),
  user: r.user_name || '',
  note: r.note || ''
});

const num = v => (v === '' || v === null || v === undefined) ? 0 : Number(v);

// เที่ยงคืนตามเวลาไทย (UTC+7)
const bkkStart = d => `${d}T00:00:00+07:00`;
const bkkEnd = d => `${d}T23:59:59.999+07:00`;

async function getProducts() {
  const rows = await fetchAll(() => sb.from('products').select('*').order('id'));
  return rows.map(toProduct);
}

async function getTransactions(f) {
  f = f || {};
  const rows = await fetchAll(() => {
    let q = sb.from('transactions').select('*').order('ts', { ascending: false }).order('id', { ascending: false });
    if (f.type) q = q.eq('type', f.type);
    if (f.productId) q = q.eq('product_id', f.productId);
    if (f.dateFrom) q = q.gte('ts', bkkStart(f.dateFrom));
    if (f.dateTo) q = q.lte('ts', bkkEnd(f.dateTo));
    return q;
  });
  return rows.map(toTx);
}

async function getDashboardData() {
  const products = (await getProducts());
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }); // YYYY-MM-DD
  const [recent, todayCount] = await Promise.all([
    ok(sb.from('transactions').select('*').order('ts', { ascending: false }).limit(8)),
    sb.from('transactions').select('id', { count: 'exact', head: true })
      .gte('ts', bkkStart(today)).lte('ts', bkkEnd(today))
  ]);
  if (todayCount.error) throw new Error(todayCount.error.message);

  const low = products.filter(p => p.qty <= p.minQty);
  return {
    totalProducts: products.length,
    lowStockCount: low.length,
    lowStockList: low,
    todayTransactionCount: todayCount.count || 0,
    totalValue: products.reduce((s, p) => s + p.qty * p.price, 0),
    recentTransactions: recent.map(toTx)
  };
}

async function addProduct(p) {
  const name = String(p.name || '').trim();
  if (!name) throw new Error('กรุณากรอกชื่อสินค้า');
  const initQty = num(p.qty);
  const row = await ok(sb.from('products').insert({
    name, category: p.category || null, unit: p.unit || null,
    qty: initQty, min_qty: num(p.minQty), price: num(p.price)
  }).select().single());
  return toProduct(row);
}

async function updateProduct(p) {
  if (!p.id) throw new Error('ไม่พบรหัสสินค้า');
  // ไม่แก้จำนวนตรงนี้ จำนวนแก้ผ่านหน้า รับ/เบิก เท่านั้น
  const row = await ok(sb.from('products').update({
    name: String(p.name || '').trim(),
    category: p.category || null,
    unit: p.unit || null,
    min_qty: num(p.minQty),
    price: num(p.price),
    updated_at: new Date().toISOString()
  }).eq('id', p.id).select().single());
  return toProduct(row);
}

async function deleteProduct(p) {
  await ok(sb.from('products').delete().eq('id', p.id));
  return { id: p.id };
}

async function stockTransaction(p) {
  const qty = Number(p.qty);
  if (!isFinite(qty) || qty < 0) throw new Error('จำนวนไม่ถูกต้อง');
  const newQty = await ok(sb.rpc('adjust_stock', {
    p_product_id: p.productId, p_type: p.type, p_qty: qty,
    p_user: p.user || null, p_note: p.note || null
  }));
  return { newQty: Number(newQty) };
}

const GET_ACTIONS = { getProducts, getTransactions, getDashboardData };
const POST_ACTIONS = { addProduct, updateProduct, deleteProduct, stockTransaction };

async function apiGet(action, params) {
  const fn = GET_ACTIONS[action];
  if (!fn) throw new Error('ไม่รู้จัก action: ' + action);
  return fn(params || {});
}

async function apiPost(action, data) {
  const fn = POST_ACTIONS[action];
  if (!fn) throw new Error('ไม่รู้จัก action: ' + action);
  return fn(data || {});
}
