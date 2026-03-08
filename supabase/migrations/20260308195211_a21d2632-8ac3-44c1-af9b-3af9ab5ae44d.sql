
-- saved_devotionals table
create table public.saved_devotionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  days_count int not null,
  devotional_json jsonb not null,
  created_at timestamptz default now()
);
alter table public.saved_devotionals enable row level security;
create policy "Users manage own devotionals" on public.saved_devotionals
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
