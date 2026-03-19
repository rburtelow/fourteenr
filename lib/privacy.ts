export type SectionVisibility = "everyone" | "followers" | "nobody";

export interface PrivacySettings {
  show_stats: SectionVisibility;
  show_summit_history: SectionVisibility;
  show_badges: SectionVisibility;
  show_groups: SectionVisibility;
  show_wishlist: SectionVisibility;
  show_trip_reports: SectionVisibility;
  show_events: SectionVisibility;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  show_stats: "followers",
  show_summit_history: "followers",
  show_badges: "followers",
  show_groups: "followers",
  show_wishlist: "followers",
  show_trip_reports: "followers",
  show_events: "followers",
};

export function canViewSection(
  sectionKey: keyof PrivacySettings,
  settings: Partial<PrivacySettings>,
  isOwner: boolean,
  isAcceptedFollower: boolean
): boolean {
  if (isOwner) return true;

  const visibility = settings[sectionKey] ?? DEFAULT_PRIVACY[sectionKey];

  if (visibility === "everyone") return true;
  if (visibility === "followers") return isAcceptedFollower;
  return false; // "nobody"
}
