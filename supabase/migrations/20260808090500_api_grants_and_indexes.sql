-- Keep private tables undiscoverable to anonymous API clients while granting
-- signed-in users only the operations exercised by the application.
revoke all on public.profiles, public.saved_verses, public.prayer_journal,
  public.user_memories, public.conversations, public.daily_checkins,
  public.saved_devotionals from anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_verses to authenticated;
grant select, insert, delete on public.prayer_journal to authenticated;
grant select, insert, update, delete on public.user_memories to authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert on public.daily_checkins to authenticated;
grant select, insert, update, delete on public.saved_devotionals to authenticated;

create index if not exists idx_daily_checkins_user on public.daily_checkins(user_id);
create index if not exists idx_saved_devotionals_user on public.saved_devotionals(user_id);
