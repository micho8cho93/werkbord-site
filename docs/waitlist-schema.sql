-- Werkbord Team waitlist: database schema.
-- Lives in its own Supabase project (werkbord-waitlist), separate from anything else.
-- The browser never reads or writes the table. It calls three SECURITY DEFINER functions
-- through PostgREST (POST /rest/v1/rpc/<name> with the publishable key in the `apikey` header).
-- Row level security is on with no policies, and anon/authenticated have no table privileges.
-- This file mirrors what is applied in the project; keep the two in step.

create table public.waitlist_signups (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  agent             text,
  team_size         text,
  referral_code     text not null unique,
  referred_by       uuid references public.waitlist_signups (id) on delete set null,
  colleague_emails  text[] not null default '{}',
  colleague_consent boolean not null default false,
  created_at        timestamptz not null default now(),
  constraint waitlist_email_unique   unique (email),
  constraint waitlist_email_format   check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  constraint waitlist_colleagues_max check (cardinality(colleague_emails) <= 5)
);

create index waitlist_signups_referred_by_idx on public.waitlist_signups (referred_by);
create index waitlist_signups_created_at_idx  on public.waitlist_signups (created_at);

alter table public.waitlist_signups enable row level security;
revoke all on public.waitlist_signups from anon, authenticated;

-- Position = signup order, minus 5 places for each person who joined through your link (never below 1).
create or replace function public.waitlist_status(p_referral_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row   public.waitlist_signups;
  v_rank  int;
  v_refs  int;
  v_total int;
begin
  select * into v_row from public.waitlist_signups
   where referral_code = lower(trim(p_referral_code));
  if not found then
    return null;
  end if;
  select count(*) into v_total from public.waitlist_signups;
  select count(*) into v_rank  from public.waitlist_signups where created_at <= v_row.created_at;
  select count(*) into v_refs  from public.waitlist_signups where referred_by = v_row.id;
  return jsonb_build_object(
    'referral_code',    v_row.referral_code,
    'position',         greatest(1, v_rank - 5 * v_refs),
    'referrals',        v_refs,
    'total',            v_total,
    'founding_claimed', least(v_total, 50),
    'founding_total',   50
  );
end;
$$;

create or replace function public.waitlist_counter()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total int;
begin
  select count(*) into v_total from public.waitlist_signups;
  return jsonb_build_object(
    'total',            v_total,
    'founding_claimed', least(v_total, 50),
    'founding_total',   50
  );
end;
$$;

-- Idempotent: joining again with the same email returns the existing row's status.
create or replace function public.join_waitlist(
  p_email             text,
  p_agent             text    default null,
  p_team_size         text    default null,
  p_referral_code     text    default null,
  p_colleagues        text[]  default '{}',
  p_colleague_consent boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email      text := lower(trim(p_email));
  v_row        public.waitlist_signups;
  v_ref        uuid;
  v_colleagues text[];
  v_code       text;
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  select * into v_row from public.waitlist_signups where email = v_email;

  if not found then
    if p_referral_code is not null then
      select id into v_ref from public.waitlist_signups
       where referral_code = lower(trim(p_referral_code));
    end if;

    select coalesce(array_agg(distinct s.e), '{}'::text[]) into v_colleagues
      from (
        select lower(trim(t.x)) as e
          from unnest(coalesce(p_colleagues, '{}'::text[])) as t(x)
      ) s
     where s.e ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
       and length(s.e) <= 254
       and s.e <> v_email;

    if cardinality(v_colleagues) > 5 then
      v_colleagues := v_colleagues[1:5];
    end if;

    if cardinality(v_colleagues) > 0 and not coalesce(p_colleague_consent, false) then
      raise exception 'consent_required' using errcode = '22023';
    end if;

    loop
      v_code := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
      begin
        insert into public.waitlist_signups
          (email, agent, team_size, referral_code, referred_by, colleague_emails, colleague_consent)
        values
          (v_email, left(p_agent, 40), left(p_team_size, 40), v_code, v_ref, v_colleagues,
           coalesce(p_colleague_consent, false))
        returning * into v_row;
        exit;
      exception when unique_violation then
        select * into v_row from public.waitlist_signups where email = v_email;
        exit when found;
      end;
    end loop;
  end if;

  return public.waitlist_status(v_row.referral_code);
end;
$$;

revoke all on function public.join_waitlist(text, text, text, text, text[], boolean) from public;
revoke all on function public.waitlist_status(text) from public;
revoke all on function public.waitlist_counter() from public;
grant execute on function public.join_waitlist(text, text, text, text, text[], boolean) to anon, authenticated;
grant execute on function public.waitlist_status(text) to anon, authenticated;
grant execute on function public.waitlist_counter() to anon, authenticated;

-- Reading the list as the owner (Supabase SQL editor or the dashboard, never from the site):
--   select email, agent, team_size, colleague_emails, created_at from public.waitlist_signups order by created_at;
