// ===========================================================================
// ดาวน์โหลด PDF รายการสินค้า (รูปแบบเหมือนชีตตรวจนับสต็อก)
// คอลัมน์: ProductID | ชื่อสินค้า | จำนวนคงเหลือ | ส่วนต่างที่หาย | หน่วยนับ | หมวดหมู่
// หัวตารางสีส้ม ตัวหนังสือขาว แถวสลับสีชมพูอ่อน/ขาว มีเส้นขอบทุกช่อง
// ใช้งาน: ใส่ <script src="pdf-export.js"></script> ต่อจาก <script> หลักใน index.html
// ===========================================================================
(function(){
  const PDF_ORANGE = '#F96A22';
  const PDF_PINK   = '#FDE3D6';

  function buildPdfHtml(list){
    const { groups, names } = groupProductsByCategory(list);
    const dateText = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' });

    const sections = names.map((cat, idx) => {
      const items = groups[cat];
      const rows = items.map(p => `
        <tr>
          <td>${escapeHtml(String(p.id ?? ''))}</td>
          <td class="left">${escapeHtml(p.name || '')}</td>
          <td>${escapeHtml(String(Number(p.qty) || 0))}</td>
          <td>&nbsp;</td>
          <td>${escapeHtml(p.unit || '')}</td>
          <td class="left">${escapeHtml(p.category || '')}</td>
        </tr>`).join('');
      return `
        <section${idx === names.length - 1 ? ' class="last"' : ''}>
          <div class="sec-head"><span>${escapeHtml(cat)} <small>(${items.length} รายการ)</small></span><small>พิมพ์เมื่อ ${dateText}</small></div>
          <table>
            <colgroup>
              <col style="width:12%"><col style="width:36%"><col style="width:14%"><col style="width:14%"><col style="width:10%"><col style="width:14%">
            </colgroup>
            <thead><tr>
              <th>ProductID</th><th>ชื่อสินค้า</th><th>จำนวนคงเหลือ</th><th>ส่วนต่างที่หาย</th><th>หน่วยนับ</th><th>หมวดหมู่</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8">
<title>สต็อกสินค้า</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page{ size:A4 portrait; margin:10mm; }
  *{ box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body{ margin:0; font-family:'IBM Plex Sans Thai','Sarabun','Tahoma',sans-serif; color:#000; font-size:11px; }
  section{ page-break-after:always; }
  section.last{ page-break-after:auto; }
  .sec-head{ display:flex; justify-content:space-between; align-items:baseline; font-weight:700; font-size:14px; margin-bottom:6px; }
  .sec-head small{ font-weight:400; font-size:10px; color:#444; }
  table{ width:100%; border-collapse:collapse; table-layout:fixed; }
  thead{ display:table-header-group; }
  tr{ page-break-inside:avoid; }
  th{ background:${PDF_ORANGE}; color:#fff; font-weight:600; font-size:12px; border:1px solid #000; padding:5px 6px; text-align:center; }
  td{ border:1px solid #000; padding:4px 6px; height:22px; text-align:center; vertical-align:middle; word-wrap:break-word; }
  td.left{ text-align:left; }
  tbody tr:nth-child(even) td{ background:${PDF_PINK}; }
</style></head>
<body>${sections}</body></html>`;
  }

  window.downloadProductsPDF = function(){
    const btn = document.getElementById('download-products-pdf-btn');
    if(btn) btn.disabled = true;
    const catSel = document.getElementById('product-category-filter');
    const cat = catSel ? catSel.value : '';

    apiGet('getProducts')
      .then(list => {
        PRODUCTS = list; PRODUCTS_LOADED_AT = Date.now();
        const use = cat ? list.filter(p => String(p.category ?? '').trim() === cat) : list;
        if(!use.length){ toast('ไม่มีสินค้าให้ดาวน์โหลด', 'error'); return; }

        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        const oldTitle = document.title;
        const cleanup = () => { document.title = oldTitle; setTimeout(() => iframe.remove(), 500); };

        iframe.onload = () => {
          const win = iframe.contentWindow;
          const go = () => {
            document.title = `สต็อกสินค้า${cat ? '-' + cat : ''}-${todayStamp()}`;
            win.onafterprint = cleanup;
            win.focus();
            win.print();
          };
          const fontsReady = (win.document.fonts && win.document.fonts.ready) ? win.document.fonts.ready : Promise.resolve();
          fontsReady.then(() => setTimeout(go, 400));
        };
        iframe.srcdoc = buildPdfHtml(use);
        document.body.appendChild(iframe);
        toast('เลือก "บันทึกเป็น PDF" ในหน้าต่างพิมพ์เพื่อดาวน์โหลด', 'success');
      })
      .catch(showError)
      .finally(() => { if(btn) btn.disabled = false; });
  };

  // เพิ่มปุ่ม "ดาวน์โหลด PDF" ข้างปุ่ม Excel ในหน้าสินค้า
  const excelBtn = document.getElementById('download-products-btn');
  if(excelBtn && !document.getElementById('download-products-pdf-btn')){
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'download-products-pdf-btn';
    b.className = 'btn secondary';
    b.onclick = window.downloadProductsPDF;
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>ดาวน์โหลด PDF';
    excelBtn.insertAdjacentElement('afterend', b);
  }
})();
