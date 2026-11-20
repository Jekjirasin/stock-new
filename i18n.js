/* ===========================================================================
 * i18n.js — สลับภาษา ไทย / English สำหรับระบบเช็คสต็อก
 * วิธีใช้: วางไฟล์นี้ไว้โฟลเดอร์เดียวกับ index.html แล้วเพิ่มบรรทัดนี้
 * "ก่อน </body>" (ต้องอยู่หลัง <script> หลักของหน้า):
 *     <script src="i18n.js"></script>
 * - ค่าในฐานข้อมูลยังเป็นภาษาไทยเหมือนเดิม (รับเข้า/เบิกออก/ปรับปรุงยอด)
 *   เปลี่ยนเฉพาะข้อความที่แสดงบนหน้าจอ
 * - ชื่อสินค้า / ชื่อตู้ / หน่วยนับ ที่ผู้ใช้กรอกเป็นภาษาไทย จะไม่ถูกแปล
 * ========================================================================= */
(function () {
  'use strict';

  var KEY = 'stock_lang';
  var lang = 'th';
  try { lang = localStorage.getItem(KEY) === 'en' ? 'en' : 'th'; } catch (e) {}

  var THAI = /[\u0E00-\u0E7F]/;
  var ATTRS = ['placeholder', 'title', 'data-label'];
  var ATTR_SEL = '[placeholder],[title],[data-label]';

  // ---------------------------------------------------------------- dictionary
  var EXACT = {
    // brand / nav
    'ระบบเช็คสต็อก': 'Stock Check System',
    'คลังสต็อกอุปกรณ์ช่าง': 'Technician Parts Stock',
    'แดชบอร์ด': 'Dashboard',
    'สินค้า': 'Products',
    'รับ/เบิก': 'In / Out',
    'ประวัติ': 'History',
    'ของใกล้หมด/หมด': 'Low / Out of Stock',
    'รายงานรายเดือน': 'Monthly Report',
    'สต็อกอัพเดตเมื่อวันที่ 15 กรกฎาคม 2569': 'Stock updated on 15 July 2026',
    'หน้าหลัก': 'Home',
    'ใกล้หมด': 'Low',
    'รายงาน': 'Report',
    'ต้องการเบิกอะไหล่? กดตรงนี้': 'Need to withdraw parts? Tap here',
    'เบิกอะไหล่กดตรงนี้': 'Withdraw parts here',

    // common
    'รีเฟรช': 'Refresh',
    'กำลังโหลด...': 'Loading...',
    'ดาวน์โหลด Excel': 'Download Excel',
    'ดาวน์โหลด PDF': 'Download PDF',
    'ดาวน์โหลด CSV': 'Download CSV',
    'ยกเลิก': 'Cancel',
    'ยืนยัน': 'Confirm',
    'บันทึก': 'Save',
    'แก้ไข': 'Edit',
    'ลบ': 'Delete',
    'ไม่ระบุหมวดหมู่': 'Uncategorized',

    // dashboard
    'จำนวนสินค้าทั้งหมด': 'Total products',
    'ของใกล้หมด': 'Low stock',
    'รายการวันนี้': "Today's transactions",
    'มูลค่าสต็อกรวม (บาท)': 'Total stock value (THB)',
    '⚠ ของใกล้หมด / ต้องสั่งเพิ่ม': '⚠ Low stock / Need to reorder',
    'รายการล่าสุด': 'Recent transactions',
    'ไม่มีสินค้าใกล้หมด ✓': 'No low-stock items ✓',
    'ยังไม่มีรายการ': 'No transactions yet',
    '(ยอดใหม่)': '(new balance)',

    // products
    'รายการสินค้า': 'Product list',
    'เพิ่มสินค้า': 'Add product',
    'ค้นหาชื่อสินค้า, รหัส, หมวดหมู่...': 'Search name, code, category...',
    'ทุกตู้ / หมวดหมู่': 'All cabinets / categories',
    'ขยายทั้งหมด': 'Expand all',
    'ย่อทั้งหมด': 'Collapse all',
    'รหัส': 'Code',
    'ชื่อสินค้า': 'Product name',
    'หมวดหมู่': 'Category',
    'คงเหลือ': 'In stock',
    'ราคา/หน่วย': 'Price / unit',
    'ไม่พบสินค้า': 'No products found',
    'รับเข้า': 'Receive',
    'เบิกออก': 'Withdraw',
    'ปรับปรุงยอด': 'Adjust',
    'ปรับปรุง': 'Adjust',
    'รับเข้า (เพิ่มสต็อก)': 'Receive (add stock)',
    'เบิกออก (ลดสต็อก)': 'Withdraw (reduce stock)',

    // transact
    'รับเข้า / เบิกออก': 'Receive / Withdraw',
    'บันทึกทุกครั้งที่มีการเคลื่อนไหวสต็อก': 'Record every stock movement',
    'เพิ่มสินค้าใหม่เข้าสต็อก': 'Add new item to stock',
    '⬇ รับเข้า': '⬇ Receive',
    '⬆ เบิกออก': '⬆ Withdraw',
    'เพิ่มสต็อก': 'Add stock',
    'ลดสต็อก': 'Reduce stock',
    'รหัสสินค้า': 'Product code',
    'พิมพ์รหัสสินค้า เช่น P0001': 'Type product code, e.g. P0001',
    'พิมพ์รหัสสินค้าเพื่อดูชื่อสินค้า': 'Type a product code to see the name',
    'จำนวนที่รับเข้า': 'Quantity received',
    'จำนวนที่เบิกออก': 'Quantity withdrawn',
    'ยอดคงเหลือใหม่ (ตั้งค่าตรงๆ)': 'New balance (set directly)',
    'ผู้ทำรายการ': 'Operator',
    'ชื่อผู้ทำรายการ': 'Operator name',
    'หมายเหตุ': 'Note',
    'เช่น รับจากซัพพลายเออร์/เบิกใช้แผนก...': 'e.g. received from supplier / used by department...',
    'กรุณากรอกหมายเหตุ (ห้ามมีช่องว่าง)': 'Please enter a note',
    'เลือกสินค้าเพื่อดูยอดคงเหลือ': 'Select a product to see the balance',
    'บันทึกรายการ': 'Save transaction',
    'กำลังบันทึก...': 'Saving...',

    // history
    'ประวัติการทำรายการ': 'Transaction history',
    'ค้นหาชื่อสินค้า, รหัส, ผู้ทำรายการ, หมายเหตุ...': 'Search name, code, operator, note...',
    'ทุกประเภท': 'All types',
    'ทุกสินค้า': 'All products',
    'ล้างตัวกรอง': 'Clear filters',
    'วันเวลา': 'Date / time',
    'สินค้า ': 'Product',
    'ประเภท': 'Type',
    'จำนวน': 'Qty',
    'คงเหลือหลังทำรายการ': 'Balance after',
    'ไม่พบรายการ': 'No records found',

    // low stock page
    'ของใกล้หมด / ของหมด': 'Low stock / Out of stock',
    'หมด = คงเหลือ 0 · ใกล้หมด = คงเหลือไม่เกินจำนวนขั้นต่ำ': 'Out = 0 in stock · Low = at or below the minimum quantity',
    'สินค้าหมด (คงเหลือ 0)': 'Out of stock (0 left)',
    'สินค้าใกล้หมด': 'Low-stock items',
    'ดาวน์โหลด Excel (แยก 2 ชีต)': 'Download Excel (2 sheets)',
    'ดาวน์โหลดเฉพาะของหมด': 'Download out-of-stock only',
    'ดาวน์โหลดเฉพาะของใกล้หมด': 'Download low-stock only',
    '⛔ สินค้าหมด': '⛔ Out of stock',
    '⚠ สินค้าใกล้หมด': '⚠ Low stock',
    'ตู้ / หมวดหมู่': 'Cabinet / Category',
    'ขั้นต่ำ': 'Minimum',
    'ควรสั่งเพิ่มอย่างน้อย': 'Min. to reorder',
    'ควรสั่งเพิ่ม': 'Reorder',
    'ไม่มีสินค้าหมด ✓': 'No out-of-stock items ✓',

    // report
    '‹ เดือนก่อน': '‹ Prev month',
    'เดือนถัดไป ›': 'Next month ›',
    'รายการทั้งหมดในเดือนนี้': 'Total transactions this month',
    'รับเข้ารวม (หน่วย)': 'Total received (units)',
    'เบิกออกรวม (หน่วย)': 'Total withdrawn (units)',
    'มูลค่าเบิกออก (บาท)': 'Value withdrawn (THB)',
    'สินค้าที่เบิกออกมากที่สุด (Top 5)': 'Most withdrawn items (Top 5)',
    'เลือกเดือนเพื่อดูรายงาน': 'Select a month to view the report',
    'สรุปเคลื่อนไหวรายสินค้า': 'Movement summary by product',
    'คงเหลือสิ้นเดือน': 'End-of-month balance',
    'ของมีจริงตอนนี้': 'Actual stock now',
    '🧊 สินค้าที่ไม่ถูกเบิกเลยในเดือนนี้': '🧊 Items not withdrawn this month',
    'คงเหลือปัจจุบัน': 'Current stock',
    'สถานะเดือนนี้': 'Status this month',
    'ไม่มีความเคลื่อนไหวเลยในเดือนนี้': 'No movement this month',
    'มีรับเข้า/ปรับปรุงยอด แต่ไม่มีการเบิก': 'Received / adjusted but not withdrawn',
    'ไม่มีการเคลื่อนไหวในเดือนนี้': 'No movement this month',
    'ทุกรายการถูกเบิกออกอย่างน้อย 1 ครั้งในเดือนนี้ ✓': 'Every item was withdrawn at least once this month ✓',
    'ไม่มีการเบิกออกในเดือนนี้': 'No withdrawals this month',
    'ไม่สามารถโหลดรายงานได้': 'Unable to load the report',

    // modals
    'ยืนยันตัวตน': 'Verify identity',
    'กรุณาใส่รหัสผ่านเพื่อดำเนินการต่อ': 'Enter the password to continue',
    'เพิ่มสินค้าใหม่': 'Add new product',
    'แก้ไขสินค้า': 'Edit product',
    '-- เลือกตู้ --': '-- Select cabinet --',
    '+ ตู้ใหม่...': '+ New cabinet...',
    'พิมพ์ชื่อตู้ใหม่': 'Type new cabinet name',
    'รหัสสินค้า (พิมพ์เอง)': 'Product code (enter manually)',
    'เช่น A2/15': 'e.g. A2/15',
    'หน่วยนับ': 'Unit',
    'ชิ้น, กล่อง, ขวด...': 'pcs, box, bottle...',
    'จำนวนเริ่มต้น': 'Initial quantity',
    'จำนวนขั้นต่ำ (แจ้งเตือน)': 'Minimum quantity (alert)',
    'ราคาต่อหน่วย (บาท)': 'Price per unit (THB)',

    // toasts / errors
    'รหัสผ่านไม่ถูกต้อง': 'Incorrect password',
    'เกิดข้อผิดพลาด': 'An error occurred',
    'แก้ไขสินค้าเรียบร้อย': 'Product updated',
    'เพิ่มสินค้าเรียบร้อย': 'Product added',
    'ลบสินค้าเรียบร้อย': 'Product deleted',
    'ยังไม่มีข้อมูลรายงานให้ดาวน์โหลด': 'No report data to download',
    'ยังไม่มีสินค้าให้ดาวน์โหลด': 'No products to download',
    'ดาวน์โหลดสต็อกสินค้าเรียบร้อย': 'Stock list downloaded',
    'ไม่มีสินค้าใกล้หมดให้ดาวน์โหลด': 'No low-stock items to download',
    'ดาวน์โหลดรายการของใกล้หมดเรียบร้อย': 'Low-stock list downloaded',
    'ไม่มีสินค้าให้ดาวน์โหลด': 'No products to download',
    'เลือก "บันทึกเป็น PDF" ในหน้าต่างพิมพ์เพื่อดาวน์โหลด': 'Choose "Save as PDF" in the print window to download',
    'ไม่มีสินค้าหมดให้ดาวน์โหลด': 'No out-of-stock items to download',
    'ไม่มีสินค้าหมดหรือใกล้หมดให้ดาวน์โหลด': 'No out-of-stock or low-stock items to download',
    'ดาวน์โหลดเรียบร้อย': 'Downloaded',
    'โหลดตัวสร้างไฟล์ Excel ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรช': 'Could not load the Excel library. Check your internet and refresh.',
    'กรุณาเลือกตู้ (หรือพิมพ์ชื่อตู้ใหม่)': 'Please select a cabinet (or type a new cabinet name)',
    'กรุณาใส่รหัสสินค้า': 'Please enter a product code',
    'ไม่พบสินค้าตามรหัสที่พิมพ์ กรุณาตรวจสอบรหัสอีกครั้ง': 'Product code not found. Please check the code.',
    'กรุณากรอกหมายเหตุ': 'Please enter a note'
  };
  // "สินค้า" as a table header on History page and as nav label share the same text
  delete EXACT['สินค้า '];

  var REGEX = [
    [/^ไม่พบสินค้ารหัส "(.*)"$/, 'Product code "$1" not found'],
    [/^คงเหลือปัจจุบัน:\s*(.*?)\s*→\s*หลังทำรายการ:\s*(.*)$/, 'Current: $1 → After: $2'],
    [/^รหัส "(.*)" มีในระบบแล้ว$/, 'Code "$1" already exists'],
    [/^ยืนยันลบ "(.*)" ออกจากระบบ\?$/, 'Delete "$1" from the system?'],
    [/^บันทึกสำเร็จ · ยอดใหม่ (.*)$/, 'Saved · new balance $1'],
    [/^ทั้งหมด (\d+) รายการ(?: · แสดง (\d+) รายการใน "(.*)")?$/, function (m, a, b, c) {
      return a + ' items total' + (b ? ' · showing ' + b + ' in "' + c + '"' : '');
    }],
    [/^พบ (\d+) จาก (\d+) รายการ$/, '$1 of $2 records'],
    [/^พบ (\d+) รายการ$/, '$1 records found'],
    [/^ประจำเดือน (.*) \((.*) ถึง (.*)\)$/, 'Month: $1 ($2 to $3)'],
    [/^(\d[\d,]*) รายการ$/, '$1 items'],
    [/^(\d+) ครั้ง$/, '$1 times'],
    [/^ใกล้หมด (\d+)$/, 'Low $1'],
    [/^(.*·\s*)คงเหลือ (.*)$/, '$1In stock $2']
  ];

  var PARTIAL = [
    [/(\d[\d,]*)\s*รายการ/g, '$1 items'],
    [/(\d[\d,]*)\s*ครั้ง/g, '$1 times'],
    [/ใกล้หมด (\d+)/g, 'Low $1']
  ];

  function tr(s) {
    if (typeof s !== 'string' || !THAI.test(s)) return s;
    var m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var core = m[2];
    if (!core) return s;
    if (Object.prototype.hasOwnProperty.call(EXACT, core)) return m[1] + EXACT[core] + m[3];
    var i, out;
    for (i = 0; i < REGEX.length; i++) {
      if (REGEX[i][0].test(core)) return m[1] + core.replace(REGEX[i][0], REGEX[i][1]) + m[3];
    }
    out = core;
    for (i = 0; i < PARTIAL.length; i++) out = out.replace(PARTIAL[i][0], PARTIAL[i][1]);
    return m[1] + out + m[3];
  }

  // -------------------------------------------------------------- DOM translate
  var textStore = new WeakMap(); // textNode -> {o: thai, t: english}
  var attrStore = new WeakMap(); // element  -> { attr: {o, t} }

  function processText(n) {
    var v = n.nodeValue;
    var rec = textStore.get(n);
    if (rec && v === rec.t) {                 // เราเป็นคนตั้งค่านี้เอง
      if (lang === 'th') { n.nodeValue = rec.o; textStore.delete(n); }
      return;
    }
    if (lang !== 'en') { if (rec) textStore.delete(n); return; }
    var t = tr(v);
    if (t !== v) { textStore.set(n, { o: v, t: t }); n.nodeValue = t; }
    else if (rec) textStore.delete(n);
  }

  function processAttr(el, a) {
    var v = el.getAttribute(a);
    if (v === null) return;
    var m = attrStore.get(el);
    if (!m) { m = {}; attrStore.set(el, m); }
    var rec = m[a];
    if (rec && v === rec.t) {
      if (lang === 'th') { el.setAttribute(a, rec.o); delete m[a]; }
      return;
    }
    if (lang !== 'en') { if (rec) delete m[a]; return; }
    var t = tr(v);
    if (t !== v) { m[a] = { o: v, t: t }; el.setAttribute(a, t); }
  }

  function sweep(root) {
    if (!root) return;
    if (root.nodeType === 3) { processText(root); return; }
    if (root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return (p === 'SCRIPT' || p === 'STYLE') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(processText);
    var els = Array.prototype.slice.call(root.querySelectorAll(ATTR_SEL));
    if (root.matches && root.matches(ATTR_SEL)) els.push(root);
    els.forEach(function (el) { ATTRS.forEach(function (a) { processAttr(el, a); }); });
  }

  var observer = new MutationObserver(function (muts) {
    if (lang !== 'en') return;
    muts.forEach(function (m) {
      if (m.type === 'childList') {
        Array.prototype.forEach.call(m.addedNodes, sweep);
      } else if (m.type === 'characterData') {
        processText(m.target);
      } else if (m.type === 'attributes') {
        processAttr(m.target, m.attributeName);
      }
    });
  });

  // ------------------------------------------------- dates, confirm, PDF output
  ['toLocaleDateString', 'toLocaleString'].forEach(function (fn) {
    var orig = Date.prototype[fn];
    Date.prototype[fn] = function (loc, opts) {
      if (lang === 'en' && loc === 'th-TH') loc = 'en-GB';
      return orig.call(this, loc, opts);
    };
  });

  var origConfirm = window.confirm;
  window.confirm = function (msg) { return origConfirm.call(window, lang === 'en' ? tr(String(msg)) : msg); };

  if (typeof window.buildProductsPdfHtml === 'function') {
    var origPdf = window.buildProductsPdfHtml;
    window.buildProductsPdfHtml = function (list) {
      var html = origPdf(list);
      if (lang !== 'en') return html;
      html = html.replace(/<th>([^<]*)<\/th>/g, function (_, t) {
        var map = { 'จำนวนคงเหลือในระบบ': 'Qty in system', 'ยอดจริงที่เหลือในตู้': 'Actual qty in cabinet' };
        return '<th>' + (map[t] || tr(t)) + '</th>';
      });
      html = html.replace(/\((\d+) รายการ\)/g, '($1 items)').replace(/พิมพ์เมื่อ/g, 'Printed');
      return html.replace('<title>สต็อกสินค้า</title>', '<title>Stock list</title>');
    };
  }

  // ------------------------------------------------------------- note field fix
  // ช่องหมายเหตุเดิมห้ามเว้นวรรค (เหมาะกับภาษาไทย) — ในโหมด EN ปลดข้อจำกัดนี้เพื่อให้พิมพ์ประโยคอังกฤษได้
  var noteOrig = null;
  function applyNoteField() {
    var note = document.getElementById('tx-note');
    if (!note) return;
    if (!noteOrig) noteOrig = { oninput: note.getAttribute('oninput'), pattern: note.getAttribute('pattern') };
    if (lang === 'en') {
      note.removeAttribute('oninput');
      note.setAttribute('pattern', '.*\\S.*');
    } else {
      if (noteOrig.oninput !== null) note.setAttribute('oninput', noteOrig.oninput);
      if (noteOrig.pattern !== null) note.setAttribute('pattern', noteOrig.pattern);
    }
  }

  // ------------------------------------------------------------------ toggle UI
  var css = document.createElement('style');
  css.textContent =
    '.lang-bar{display:flex;justify-content:flex-end;margin:0 0 12px 0;}' +
    '.lang-switch{display:inline-flex;border:1px solid var(--line,#E4E7EB);border-radius:8px;overflow:hidden;background:var(--surface,#fff);}' +
    '.lang-switch button{border:none;background:transparent;padding:7px 14px;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--ink-soft,#3D4C57);font-family:inherit;}' +
    '.lang-switch button.on{background:var(--brand,#2F6F4E);color:#fff;}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'lang-bar';
  bar.innerHTML = '<div class="lang-switch"><button type="button" data-l="th">ไทย</button><button type="button" data-l="en">EN</button></div>';
  var mainEl = document.querySelector('main');
  if (mainEl) mainEl.insertBefore(bar, mainEl.firstChild);
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-l]');
    if (b && b.dataset.l !== lang) setLang(b.dataset.l, true);
  });

  function markToggle() {
    Array.prototype.forEach.call(bar.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.dataset.l === lang);
    });
  }

  function setLang(l, refresh) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l;
    document.title = l === 'en' ? 'Stock Check System' : 'ระบบเช็คสต็อก';
    applyNoteField();
    sweep(document.body);
    markToggle();
    if (refresh && typeof window.switchView === 'function') {
      var v = document.querySelector('.view.active');
      if (v) window.switchView(v.id.replace('view-', ''));
    }
  }

  // ----------------------------------------------------------------------- init
  observer.observe(document.body, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ATTRS
  });
  markToggle();
  if (lang === 'en') {
    setLang('en', false);
    var tl = document.getElementById('today-label');
    if (tl) tl.textContent = new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
})();
