create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert their own email)
create policy "anyone can subscribe"
  on public.newsletter_subscribers
  for insert
  with check (true);

-- Only admins can read the full list
create policy "admins can view subscribers"
  on public.newsletter_subscribers
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role in ('admin', 'moderator')
        and status = 'active'
    )
  );

-- Admins can update (e.g. mark inactive)
create policy "admins can update subscribers"
  on public.newsletter_subscribers
  for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role in ('admin', 'moderator')
        and status = 'active'
    )
  );
