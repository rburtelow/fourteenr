export type GroupCategory =
  | 'general'
  | 'route'
  | 'range'
  | 'skill_level'
  | 'local_chapter'
  | 'trip_planning'
  | 'gear'
  | 'conditions';

export type GroupPrivacy = 'public' | 'private';
export type GroupRole = 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'banned';

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  privacy: GroupPrivacy;
  peak_id: string | null;
  category: GroupCategory;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  peaks?: {
    name: string;
    slug: string;
    elevation: number;
  } | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  status: MemberStatus;
  joined_at: string;
  profiles: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const CATEGORY_LABELS: Record<GroupCategory, string> = {
  general: 'General',
  route: 'Route Beta',
  range: 'Mountain Range',
  skill_level: 'Skill Level',
  local_chapter: 'Local Chapter',
  trip_planning: 'Trip Planning',
  gear: 'Gear & Equipment',
  conditions: 'Trail Conditions',
};

export interface GroupWithUnread extends Group {
  hasUnread: boolean;
}

export const CATEGORY_COLORS: Record<GroupCategory, string> = {
  general: 'from-slate-500 to-slate-700',
  route: 'from-emerald-600 to-emerald-800',
  range: 'from-green-700 to-green-900',
  skill_level: 'from-amber-500 to-amber-700',
  local_chapter: 'from-blue-600 to-blue-800',
  trip_planning: 'from-violet-600 to-violet-800',
  gear: 'from-orange-500 to-orange-700',
  conditions: 'from-sky-500 to-sky-700',
};
