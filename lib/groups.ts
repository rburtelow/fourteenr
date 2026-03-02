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

export async function getGroupInvitedUserIds(groupId: string): Promise<string[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('group_invites')
    .select('invitee_id')
    .eq('group_id', groupId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching invited user ids:', error);
    return [];
  }

  return ((data as { invitee_id: string }[]) || []).map((r) => r.invitee_id);
}

export async function getSuggestedGroups(userId: string, limit = 6): Promise<Group[]> {
  const supabase = await createClient();

  // Get groups user is already in
  const { data: userMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  const userGroupIds = new Set((userMemberships || []).map((m) => m.group_id));

  const scoreMap = new Map<string, number>(); // group_id -> relevance score

  // Signal 1 (score +2): Groups linked to peaks the user has summited
  const { data: userSummits } = await supabase
    .from('summit_logs')
    .select('peak_id')
    .eq('user_id', userId);

  const userPeakIds = [...new Set((userSummits || []).map((s: { peak_id: string }) => s.peak_id))];

  if (userPeakIds.length > 0) {
    const { data: peakGroups } = await supabase
      .from('groups')
      .select('id')
      .in('peak_id', userPeakIds);

    for (const g of peakGroups || []) {
      if (!userGroupIds.has(g.id)) {
        scoreMap.set(g.id, (scoreMap.get(g.id) ?? 0) + 2);
      }
    }
  }

  // Signal 2 (score +1): Groups that followed users belong to
  const { data: followingRows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  const followingIds = (followingRows || []).map((f: { following_id: string }) => f.following_id);

  if (followingIds.length > 0) {
    const { data: followingGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .in('user_id', followingIds)
      .eq('status', 'active');

    for (const gm of followingGroups || []) {
      if (!userGroupIds.has(gm.group_id)) {
        scoreMap.set(gm.group_id, (scoreMap.get(gm.group_id) ?? 0) + 1);
      }
    }
  }

  // Get ranked group IDs
  const rankedIds = [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, limit);

  if (rankedIds.length === 0) {
    // Fallback: popular public groups the user isn't already in
    const { data: popularGroups } = await supabase
      .from('groups')
      .select('*, peaks(name, slug, elevation)')
      .order('member_count', { ascending: false })
      .limit(limit + userGroupIds.size + 5);

    return ((popularGroups || []) as Group[])
      .filter((g) => !userGroupIds.has(g.id))
      .slice(0, limit);
  }

  const { data: suggestedGroups } = await supabase
    .from('groups')
    .select('*, peaks(name, slug, elevation)')
    .in('id', rankedIds);

  return ((suggestedGroups || []) as Group[]).sort(
    (a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0)
  );
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
