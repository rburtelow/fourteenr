import { createClient } from '@/lib/supabase/server';
import type { Group, GroupMember, GroupWithUnread } from './groups.types';

export type GroupSortOption = 'newest' | 'most_members' | 'recently_active';

interface GetGroupsOptions {
  search?: string;
  category?: string;
  sort?: GroupSortOption;
  limit?: number;
}

export async function getGroups(options: GetGroupsOptions = {}): Promise<Group[]> {
  const { search, category, sort = 'newest', limit = 50 } = options;
  const supabase = await createClient();

  let query = supabase
    .from('groups')
    .select('*, peaks(name, slug, elevation)')
    .limit(limit);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category as import('./groups.types').GroupCategory);
  }

  switch (sort) {
    case 'most_members':
      query = query.order('member_count', { ascending: false });
      break;
    case 'recently_active':
      query = query.order('updated_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }

  return (data || []) as Group[];
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select('groups(*, peaks(name, slug, elevation))')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }

  return (data || [])
    .map((row) => row.groups)
    .filter(Boolean) as Group[];
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('groups')
    .select('*, peaks(name, slug, elevation)')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching group by slug:', error);
    return null;
  }

  return data as Group | null;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(screen_name, full_name, avatar_url)')
    .eq('group_id', groupId)
    .eq('status', 'active')
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching group members:', error);
    return [];
  }

  return (data || []) as GroupMember[];
}

export async function getPendingMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(screen_name, full_name, avatar_url)')
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending members:', error);
    return [];
  }

  return (data || []) as GroupMember[];
}

export async function getGroupPinnedPostIds(groupId: string): Promise<string[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('group_pinned_posts')
    .select('post_id')
    .eq('group_id', groupId)
    .order('pinned_at', { ascending: false });

  if (error) {
    console.error('Error fetching pinned posts:', error);
    return [];
  }

  return ((data as { post_id: string }[]) || []).map((r) => r.post_id);
}

export async function getPublicGroupsForUser(
  profileUserId: string,
  viewerUserId?: string
): Promise<Group[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select('groups(*, peaks(name, slug, elevation))')
    .eq('user_id', profileUserId)
    .eq('status', 'active');

  if (error || !data) {
    console.error('Error fetching user groups for profile:', error);
    return [];
  }

  const groups = (data || [])
    .map((row) => row.groups)
    .filter(Boolean) as Group[];

  if (!viewerUserId || viewerUserId === profileUserId) {
    return groups.filter((g) => g.privacy === 'public');
  }

  // Get viewer's active group IDs to reveal private groups they share
  const { data: viewerMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', viewerUserId)
    .eq('status', 'active');

  const viewerGroupIds = new Set(
    (viewerMemberships || []).map((m) => m.group_id)
  );

  return groups.filter(
    (g) => g.privacy === 'public' || viewerGroupIds.has(g.id)
  );
}

export async function getUserGroupsForSidebar(userId: string, limit = 5): Promise<GroupWithUnread[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select('last_visited_at, joined_at, groups(id, name, slug, cover_image_url, category, privacy, member_count, updated_at, created_at, description, peak_id, created_by)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching sidebar groups:', error);
    return [];
  }

  const rows = (data || []) as {
    last_visited_at: string | null;
    joined_at: string;
    groups: Group | null;
  }[];

  return rows
    .filter((r) => r.groups !== null)
    .map((r) => {
      const group = r.groups as Group;
      const seenAt = r.last_visited_at ?? r.joined_at;
      const hasUnread = new Date(group.updated_at) > new Date(seenAt);
      return { ...group, hasUnread };
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit);
}

export async function getUserMembership(
  groupId: string,
  userId: string
): Promise<GroupMember | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(screen_name, full_name, avatar_url)')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user membership:', error);
    return null;
  }

  return data as GroupMember | null;
}
