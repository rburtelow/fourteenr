-- Update badge earned notification to include description,
-- and support consolidation by allowing null badge_id for multi-badge notifications.

create or replace function public.handle_new_badge_earned()
returns trigger
language plpgsql
security definer
as $$
declare
  badge_name text;
  badge_description text;
begin
  select name, description into badge_name, badge_description
  from public.badge_definitions
  where id = NEW.badge_id;

  insert into public.notifications (user_id, type, badge_id, message)
  values (
    NEW.user_id,
    'badge',
    NEW.badge_id,
    'You earned the "' || badge_name || '" badge! ' || coalesce(badge_description, '')
  );

  return NEW;
end;
$$;
