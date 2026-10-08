-- รันใน Supabase > SQL Editor (รันซ้ำได้ ไม่ทำลายข้อมูลเดิม)

-- รหัสสินค้ารูปแบบ P0001, P0002, ...
create sequence if not exists product_seq start 1;

create table if not exists products (
  id          text primary key default ('P' || lpad(nextval('product_seq')::text, 4, '0')),
  name        text not null,
  category    text,
  unit        text,
  qty         numeric not null default 0,
  min_qty     numeric not null default 0,
  price       numeric not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists transactions (
  id            bigint generated always as identity primary key,
  ts            timestamptz not null default now(),
  product_id    text,
  product_name  text,
  type          text not null check (type in ('รับเข้า','เบิกออก','ปรับปรุงยอด')),
  qty           numeric not null check (qty >= 0),
  balance_after numeric,
  user_name     text,
  note          text
);

create index if not exists idx_tx_ts on transactions (ts desc);
create index if not exists idx_tx_product on transactions (product_id);

-- รับเข้า / เบิกออก / ปรับปรุงยอด (ตั้งยอดตรงๆ)
-- อัปเดตสต็อกและบันทึกประวัติในครั้งเดียว ยอดไม่เพี้ยนแม้หลายคนกดพร้อมกัน
create or replace function adjust_stock(
  p_product_id text,
  p_type       text,
  p_qty        numeric,
  p_user       text default null,
  p_note       text default null
) returns numeric
language plpgsql
as $$
declare
  v_name text;
  v_cur  numeric;
  v_new  numeric;
begin
  select name, qty into v_name, v_cur from products where id = p_product_id for update;
  if not found then
    raise exception 'ไม่พบสินค้า';
  end if;

  if p_qty is null or p_qty < 0 then
    raise exception 'จำนวนไม่ถูกต้อง';
  end if;

  if p_type = 'รับเข้า' then
    v_new := v_cur + p_qty;
  elsif p_type = 'เบิกออก' then
    v_new := v_cur - p_qty;
    if v_new < 0 then
      raise exception 'สต็อกไม่พอ (คงเหลือ %)', v_cur;
    end if;
  elsif p_type = 'ปรับปรุงยอด' then
    v_new := p_qty;
  else
    raise exception 'ประเภทรายการไม่ถูกต้อง';
  end if;

  update products set qty = v_new, updated_at = now() where id = p_product_id;

  insert into transactions (product_id, product_name, type, qty, balance_after, user_name, note)
  values (p_product_id, v_name, p_type, p_qty, v_new, p_user, p_note);

  return v_new;
end;
$$;

-- Row Level Security
alter table products     enable row level security;
alter table transactions enable row level security;

drop policy if exists products_all     on products;
drop policy if exists transactions_rd  on transactions;
drop policy if exists transactions_ins on transactions;

-- ⚠️ ค่าเริ่มต้น: ใครมี anon key ก็อ่าน/เขียนได้ (เหมาะกับระบบภายใน)
-- เว็บบน GitHub Pages ใครเปิดดูโค้ดก็เห็น key ได้ ก่อนใช้งานจริงควรใช้ Supabase Auth
-- แล้วเปลี่ยน "to anon" เป็น "to authenticated"
create policy products_all     on products     for all    to anon using (true) with check (true);
create policy transactions_rd  on transactions for select to anon using (true);

-- ไม่ให้ insert ตรงเข้า transactions ต้องผ่านฟังก์ชัน adjust_stock เท่านั้น
-- (ฟังก์ชันรันด้วยสิทธิ์ผู้เรียก จึงต้องมี policy insert ด้านล่างด้วย)
create policy transactions_ins on transactions for insert to anon with check (true);

grant execute on function adjust_stock(text, text, numeric, text, text) to anon;
