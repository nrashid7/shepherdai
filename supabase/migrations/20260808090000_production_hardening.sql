-- Production RLS hardening. Public scripture data remains read-only.
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "profiles_select_owner" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_owner" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_owner" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own saved verses" on public.saved_verses;
drop policy if exists "Users can insert their own saved verses" on public.saved_verses;
drop policy if exists "Users can update their own saved verses" on public.saved_verses;
drop policy if exists "Users can delete their own saved verses" on public.saved_verses;
create policy "saved_verses_select_owner" on public.saved_verses for select to authenticated using ((select auth.uid()) = user_id);
create policy "saved_verses_insert_owner" on public.saved_verses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saved_verses_update_owner" on public.saved_verses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "saved_verses_delete_owner" on public.saved_verses for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own prayers" on public.prayer_journal;
drop policy if exists "Users can insert their own prayers" on public.prayer_journal;
drop policy if exists "Users can delete their own prayers" on public.prayer_journal;
create policy "prayer_journal_select_owner" on public.prayer_journal for select to authenticated using ((select auth.uid()) = user_id);
create policy "prayer_journal_insert_owner" on public.prayer_journal for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "prayer_journal_delete_owner" on public.prayer_journal for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own memories" on public.user_memories;
drop policy if exists "Users can insert their own memories" on public.user_memories;
drop policy if exists "Users can update their own memories" on public.user_memories;
drop policy if exists "Users can delete their own memories" on public.user_memories;
create policy "user_memories_select_owner" on public.user_memories for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_memories_insert_owner" on public.user_memories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_memories_update_owner" on public.user_memories for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_memories_delete_owner" on public.user_memories for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own conversations" on public.conversations;
drop policy if exists "Users can insert their own conversations" on public.conversations;
create policy "conversations_select_owner" on public.conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy "conversations_insert_owner" on public.conversations for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can select own checkins" on public.daily_checkins;
drop policy if exists "Users can insert own checkins" on public.daily_checkins;
create policy "daily_checkins_select_owner" on public.daily_checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy "daily_checkins_insert_owner" on public.daily_checkins for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own devotionals" on public.saved_devotionals;
create policy "saved_devotionals_all_owner" on public.saved_devotionals for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- These functions exist only for database triggers and must not be callable via the API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- Make reference-table access explicit and immutable for API roles.
revoke insert, update, delete, truncate on public.bible_verses, public.cross_references, public.study_notes from anon, authenticated;
