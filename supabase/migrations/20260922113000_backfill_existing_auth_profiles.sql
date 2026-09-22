-- Hosted production already contains Auth users created before the application
-- schema. Ensure every existing identity receives the same minimal profile that
-- the new-user trigger creates, without changing any existing profile.
insert into public.profiles (user_id, display_name)
select
  users.id,
  nullif(left(trim(coalesce(users.raw_user_meta_data ->> 'display_name', '')), 100), '')
from auth.users as users
on conflict (user_id) do nothing;
