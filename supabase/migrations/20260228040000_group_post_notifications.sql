-- Story 2.3: Group post notifications
-- Updates like/comment triggers to populate group_id and include group name in message.

-- Update handle_new_post_like to capture group context
create or replace function public.handle_new_post_like()
returns trigger
language plpgsql
security definer
as $$
declare
  post_owner_id uuid;
  actor_name text;
  v_group_id uuid;
  v_group_name text;
begin
  -- Get the post owner and group_id
  select user_id, group_id into post_owner_id, v_group_id
  from public.community_posts
  where id = NEW.post_id;

  -- Skip if actor is the post owner
  if NEW.user_id = post_owner_id then
    return NEW;
  end if;

  -- Get actor display name
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.user_id;

  if v_group_id is not null then
    select name into v_group_name from public.groups where id = v_group_id;
    insert into public.notifications (user_id, actor_id, type, post_id, group_id, message)
    values (
      post_owner_id,
      NEW.user_id,
      'like',
      NEW.post_id,
      v_group_id,
      actor_name || ' liked your post in ' || v_group_name
    );
  else
    insert into public.notifications (user_id, actor_id, type, post_id, message)
    values (
      post_owner_id,
      NEW.user_id,
      'like',
      NEW.post_id,
      actor_name || ' liked your post'
    );
  end if;

  return NEW;
end;
$$;

-- Update handle_new_post_comment to capture group context
create or replace function public.handle_new_post_comment()
returns trigger
language plpgsql
security definer
as $$
declare
  post_owner_id uuid;
  actor_name text;
  v_group_id uuid;
  v_group_name text;
begin
  -- Get the post owner and group_id
  select user_id, group_id into post_owner_id, v_group_id
  from public.community_posts
  where id = NEW.post_id;

  -- Skip if actor is the post owner
  if NEW.user_id = post_owner_id then
    return NEW;
  end if;

  -- Get actor display name
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.user_id;

  if v_group_id is not null then
    select name into v_group_name from public.groups where id = v_group_id;
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id, group_id, message)
    values (
      post_owner_id,
      NEW.user_id,
      'comment',
      NEW.post_id,
      NEW.id,
      v_group_id,
      actor_name || ' commented on your post in ' || v_group_name
    );
  else
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id, message)
    values (
      post_owner_id,
      NEW.user_id,
      'comment',
      NEW.post_id,
      NEW.id,
      actor_name || ' commented on your post'
    );
  end if;

  return NEW;
end;
$$;
