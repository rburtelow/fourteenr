-- Fix direct follow notifications.
-- Previously handle_new_follow_request fired for ALL inserts to follows,
-- including direct follows (status='accepted'), always sending a 'follow_request'
-- notification with "X wants to follow you" and a follow_id (showing accept/decline buttons).
-- Now we differentiate: pending → follow_request (with follow_id); accepted → follow_request
-- notification with follow_id=null and "X followed you" (no action buttons).

create or replace function public.handle_new_follow_request()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name text;
begin
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.follower_id;

  if NEW.status = 'pending' then
    -- Follow request that needs approval
    insert into public.notifications (user_id, actor_id, type, follow_id, message)
    values (
      NEW.following_id,
      NEW.follower_id,
      'follow_request',
      NEW.id,
      actor_name || ' wants to follow you'
    );
  else
    -- Direct follow (status = 'accepted') — notify without follow_id so no action buttons appear
    insert into public.notifications (user_id, actor_id, type, follow_id, message)
    values (
      NEW.following_id,
      NEW.follower_id,
      'follow_request',
      null,
      actor_name || ' followed you'
    );
  end if;

  return NEW;
end;
$$;
