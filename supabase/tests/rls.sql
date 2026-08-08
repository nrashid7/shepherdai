begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into public.bible_verses (book, chapter, verse_number, text)
values ('RLS Test', 1, 1, 'Public scripture test row');

set local role anon;
select is((select count(*)::integer from public.bible_verses where book = 'RLS Test'), 1, 'anonymous users can read scripture');
select throws_ok($$insert into public.bible_verses (book, chapter, verse_number, text) values ('RLS Test', 1, 2, 'blocked')$$, '42501', null, 'anonymous users cannot write scripture');
select is((select count(*)::integer from public.daily_checkins), 0, 'anonymous users cannot read private check-ins');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select lives_ok($$insert into public.daily_checkins (user_id, emotion) values ('11111111-1111-1111-1111-111111111111', 'hopeful')$$, 'owner can insert a check-in');
select is((select count(*)::integer from public.daily_checkins), 1, 'owner can read their check-in');
select throws_ok($$insert into public.daily_checkins (user_id, emotion) values ('22222222-2222-2222-2222-222222222222', 'blocked')$$, '42501', null, 'owner cannot insert for another user');
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select is((select count(*)::integer from public.daily_checkins), 0, 'cross-user reads are blocked');

select * from finish();
rollback;
