-- REPLICA IDENTITY FULL ensures UPDATE payloads include old row values,
-- which is required for the realtime subscription to detect is_read changes
-- and correctly decrement the unread notification count.
alter table public.notifications replica identity full;
