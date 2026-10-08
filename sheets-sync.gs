/**
 * Google Sheets: ดึงข้อมูลจาก Supabase มาลงชีตเพื่อจัดหน้าและพิมพ์เอกสาร
 *
 * วิธีติดตั้ง:
 * 1) เปิด Google Sheets > ส่วนขยาย > Apps Script แล้ววางโค้ดนี้
 * 2) Project Settings > Script properties เพิ่ม 2 ค่า
 *      SUPABASE_URL = https://xxxx.supabase.co
 *      SUPABASE_KEY = anon key (หรือ service_role key ถ้าปิดสิทธิ์ anon แล้ว เก็บไว้ในนี้เท่านั้น)
 * 3) รีโหลดชีต จะมีเมนู "Supabase" ขึ้นมา
 */

const SHEET_PRODUCTS = 'สินค้า';
const SHEET_TX = 'ประวัติ';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Supabase')
    .addItem('ซิงค์ข้อมูลทั้งหมด', 'syncAll')
    .addItem('ซิงค์เฉพาะสินค้า', 'syncProducts')
    .addItem('ซิงค์เฉพาะประวัติ', 'syncTransactions')
    .addToUi();
}

function syncAll() {
  syncProducts();
  syncTransactions();
}

function syncProducts() {
  const rows = fetchTable_('products', 'select=*&order=name.asc');
  const header = ['รหัส', 'ชื่อสินค้า', 'หมวดหมู่', 'หน่วย', 'คงเหลือ', 'ขั้นต่ำ', 'ราคา', 'อัปเดตล่าสุด'];
  const body = rows.map(r => [
    r.id, r.name, r.category, r.unit, r.qty, r.min_qty, r.price, fmtDate_(r.updated_at)
  ]);
  writeSheet_(SHEET_PRODUCTS, header, body);
}

function syncTransactions() {
  const rows = fetchTable_('transactions', 'select=*&order=ts.desc&limit=5000');
  const header = ['เวลา', 'รหัสสินค้า', 'ชื่อสินค้า', 'ประเภท', 'จำนวน', 'คงเหลือหลังทำรายการ', 'ผู้ทำรายการ', 'หมายเหตุ'];
  const body = rows.map(r => [
    fmtDate_(r.ts), r.product_id, r.product_name,
    r.type,
    r.qty, r.balance_after, r.user_name, r.note
  ]);
  writeSheet_(SHEET_TX, header, body);
}

// ---------- helpers ----------
function fetchTable_(table, query) {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL') + '/rest/v1/' + table + '?' + query;
  const key = props.getProperty('SUPABASE_KEY');
  const res = UrlFetchApp.fetch(url, {
    headers: { apikey: key, Authorization: 'Bearer ' + key },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Supabase error ' + res.getResponseCode() + ': ' + res.getContentText());
  }
  return JSON.parse(res.getContentText());
}

function writeSheet_(name, header, body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold').setBackground('#e8eef7');
  if (body.length) sh.getRange(2, 1, body.length, header.length).setValues(body);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, header.length);
}

function fmtDate_(iso) {
  if (!iso) return '';
  return Utilities.formatDate(new Date(iso), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
}
