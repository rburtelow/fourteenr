import type { BadgeDefinition, UserBadgeWithDefinition } from "@/lib/database.types";
import BadgeIcon from "./BadgeIcon";

interface BadgeGridProps {
  allBadges: BadgeDefinition[];
  earnedBadges: UserBadgeWithDefinition[];
  size?: "sm" | "md" | "lg";
  columns?: number;
  showAll?: boolean;
  maxDisplay?: number;
}

export default function BadgeGrid({
  allBadges,
  earnedBadges,
  size = "md",
  columns = 5,
  showAll = false,
  maxDisplay,
}: BadgeGridProps) {
  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badge_id));
  const earnedBadgeMap = new Map(earnedBadges.map((ub) => [ub.badge_id, ub]));

  // Determine which badges to display
  let badgesToDisplay: BadgeDefinition[];
  if (showAll) {
    badgesToDisplay = allBadges;
  } else {
    // Show earned badges first, sorted by earned date
    const earnedBadgeDefs = allBadges.filter((b) => earnedBadgeIds.has(b.id));
    const unearnedBadgeDefs = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

    // Sort earned by earned_at date
    earnedBadgeDefs.sort((a, b) => {
      const aDate = earnedBadgeMap.get(a.id)?.earned_at || "";
      const bDate = earnedBadgeMap.get(b.id)?.earned_at || "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    badgesToDisplay = [...earnedBadgeDefs, ...unearnedBadgeDefs];
  }

  // Apply max display limit if specified
  if (maxDisplay && badgesToDisplay.length > maxDisplay) {
    badgesToDisplay = badgesToDisplay.slice(0, maxDisplay);
  }

  const gridColsClass = {
    3: "grid-cols-3",
    4: "grid-cols-3 sm:grid-cols-4",
    5: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5",
    6: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6",
  }[columns] || "grid-cols-3 sm:grid-cols-4 md:grid-cols-5";

  return (
    <div className={`grid ${gridColsClass} gap-2`}>
      {badgesToDisplay.map((badge) => {
        const earnedBadge = earnedBadgeMap.get(badge.id);
        const earned = !!earnedBadge;
        const earnedDate = earnedBadge
          ? new Date(earnedBadge.earned_at).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : undefined;

        return (
          <BadgeIcon
            key={badge.id}
            badge={badge}
            earned={earned}
            size={size}
            earnedDate={earnedDate}
          />
        );
      })}
    </div>
  );
}

interface BadgeGridCompactProps {
  earnedBadges: UserBadgeWithDefinition[];
  maxDisplay?: number;
}

export function BadgeGridCompact({ earnedBadges, maxDisplay = 5 }: BadgeGridCompactProps) {
  const displayBadges = earnedBadges.slice(0, maxDisplay);
  const remaining = earnedBadges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1.5">
      {displayBadges.map((ub) => (
        <BadgeIcon
          key={ub.id}
          badge={ub.badge_definitions}
          earned={true}
          size="sm"
          earnedDate={new Date(ub.earned_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        />
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-subtle)] flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]">
          +{remaining}
        </div>
      )}
    </div>
  );
}

interface BadgeCategoryGridProps {
  allBadges: BadgeDefinition[];
  earnedBadges: UserBadgeWithDefinition[];
}

export function BadgeCategoryGrid({ allBadges, earnedBadges }: BadgeCategoryGridProps) {
  const categories: { key: BadgeDefinition["category"]; label: string }[] = [
    { key: "milestone", label: "Milestones" },
    { key: "range", label: "Range Mastery" },
    { key: "difficulty", label: "Difficulty" },
    { key: "special", label: "Special" },
    { key: "seasonal", label: "Seasonal" },
    { key: "dedication", label: "Dedication" },
  ];

  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badge_id));
  const earnedBadgeMap = new Map(earnedBadges.map((ub) => [ub.badge_id, ub]));

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryBadges = allBadges.filter((b) => b.category === category.key);
        if (categoryBadges.length === 0) return null;

        const earnedCount = categoryBadges.filter((b) => earnedBadgeIds.has(b.id)).length;

        return (
          <div key={category.key}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {category.label}
              </h4>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {earnedCount}/{categoryBadges.length}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {categoryBadges.map((badge) => {
                const earnedBadge = earnedBadgeMap.get(badge.id);
                const earned = !!earnedBadge;
                const earnedDate = earnedBadge
                  ? new Date(earnedBadge.earned_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : undefined;

                return (
                  <BadgeIcon
                    key={badge.id}
                    badge={badge}
                    earned={earned}
                    size="md"
                    earnedDate={earnedDate}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
