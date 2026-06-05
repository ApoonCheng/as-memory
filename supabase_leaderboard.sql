-- ============================================================
-- 翻牌配對 線上排行榜資料表
-- 在 Supabase 專案的 SQL Editor 貼上整段執行一次即可。
-- （可沿用你重訓 App 的同一個 Supabase 專案）
-- 這是公開排行榜：任何人都能讀取與新增成績（無需登入）。
-- ============================================================

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  time_seconds numeric not null,
  moves int,
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

-- 任何人都能看排行榜
create policy "anyone can read leaderboard"
  on public.leaderboard for select using (true);

-- 任何人都能上傳成績
create policy "anyone can insert score"
  on public.leaderboard for insert with check (true);
