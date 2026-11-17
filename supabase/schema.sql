-- Run in the Supabase SQL editor. No service key belongs in Vite.
create table public.player_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null,
 revision bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.player_saves enable row level security;
create policy "read own save" on public.player_saves for select to authenticated using (auth.uid()=user_id);
create policy "insert own save" on public.player_saves for insert to authenticated with check (auth.uid()=user_id);
create policy "update own save" on public.player_saves for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create table public.game_config(id text primary key, payload jsonb not null, updated_at timestamptz not null default now());
alter table public.game_config enable row level security;
create policy "read published config" on public.game_config for select to anon,authenticated using (true);
create policy "admin insert" on public.game_config for insert to authenticated with check ((auth.jwt()->'app_metadata'->>'role')='admin');
create policy "admin update" on public.game_config for update to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
create policy "admin delete" on public.game_config for delete to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin');
-- app_metadata.role is set only with trusted Supabase admin/server tools, never user_metadata.
-- Saves are self-reported personal habit data, not trusted economy or leaderboards.
