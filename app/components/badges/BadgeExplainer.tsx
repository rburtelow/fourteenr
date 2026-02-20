"use client";

/**
 * BadgeExplainer - A comprehensive component showing all badge definitions
 * with their icons, descriptions, and unlock requirements
 */

// All badge data organized by category
const BADGE_DATA = {
  milestone: {
    label: "Milestones",
    description: "Celebrate your summit count achievements",
    badges: [
      {
        slug: "first-summit",
        name: "First Summit",
        description: "Conquer your first Colorado 14er",
        icon: "mountain-sunrise",
        criteria: "Summit any 14er",
      },
      {
        slug: "high-five",
        name: "High Five",
        description: "Summit 5 Colorado 14ers",
        icon: "high-five",
        criteria: "Summit 5 peaks",
      },
      {
        slug: "double-digits",
        name: "Double Digits",
        description: "Reach 10 summited peaks",
        icon: "double-digits",
        criteria: "Summit 10 peaks",
      },
      {
        slug: "quarter-pounder",
        name: "Quarter Pounder",
        description: "Complete 15 of Colorado's 14ers",
        icon: "quarter-chart",
        criteria: "Summit 15 peaks",
      },
      {
        slug: "halfway-there",
        name: "Halfway There",
        description: "Summit 29 peaks - halfway to completion",
        icon: "split-mountain",
        criteria: "Summit 29 peaks",
      },
      {
        slug: "fourteener-finisher",
        name: "Fourteener Finisher",
        description: "Complete all 58 Colorado 14ers",
        icon: "crown-58",
        criteria: "Summit all 58 peaks",
      },
    ],
  },
  range: {
    label: "Range Mastery",
    description: "Conquer every peak in a mountain range",
    badges: [
      {
        slug: "sawatch-master",
        name: "Sawatch Master",
        description: "Complete all 15 Sawatch Range peaks",
        icon: "range-complete",
        criteria: "All 15 Sawatch peaks",
      },
      {
        slug: "mosquito-master",
        name: "Mosquito Master",
        description: "Complete all 5 Mosquito Range peaks",
        icon: "range-complete",
        criteria: "All 5 Mosquito peaks",
      },
      {
        slug: "front-range-master",
        name: "Front Range Master",
        description: "Complete all 6 Front Range peaks",
        icon: "range-complete",
        criteria: "All 6 Front Range peaks",
      },
      {
        slug: "sangre-de-cristo-master",
        name: "Sangre de Cristo Master",
        description: "Complete all 10 Sangre de Cristo peaks",
        icon: "range-complete",
        criteria: "All 10 Sangre de Cristo peaks",
      },
      {
        slug: "elk-range-master",
        name: "Elk Range Master",
        description: "Complete all 7 Elk Range peaks",
        icon: "range-complete",
        criteria: "All 7 Elk Range peaks",
      },
      {
        slug: "san-juan-master",
        name: "San Juan Master",
        description: "Complete all 13 San Juan peaks",
        icon: "range-complete",
        criteria: "All 13 San Juan peaks",
      },
      {
        slug: "tenmile-pioneer",
        name: "Tenmile Pioneer",
        description: "Summit Quandary Peak in the Tenmile Range",
        icon: "range-complete",
        criteria: "Summit Quandary Peak",
      },
      {
        slug: "collegiate-scholar",
        name: "Collegiate Scholar",
        description: "Complete all 6 Collegiate Peaks",
        icon: "graduation-cap",
        criteria: "Harvard, Columbia, Yale, Princeton, Oxford, Belford",
      },
      {
        slug: "crestone-conqueror",
        name: "Crestone Conqueror",
        description: "Summit all 4 Crestone group peaks",
        icon: "crestone-peaks",
        criteria: "Crestone Peak, Needle, Kit Carson, Challenger",
      },
    ],
  },
  difficulty: {
    label: "Difficulty",
    description: "Push your limits with challenging climbs",
    badges: [
      {
        slug: "trail-blazer",
        name: "Trail Blazer",
        description: "Complete all Class 1 peaks",
        icon: "boot-print",
        criteria: "All Class 1 peaks",
      },
      {
        slug: "scrambler",
        name: "Scrambler",
        description: "Complete all Class 2 peaks",
        icon: "hands-rock",
        criteria: "All Class 2 peaks",
      },
      {
        slug: "technical-climber",
        name: "Technical Climber",
        description: "Summit any Class 3 peak",
        icon: "rope-carabiner",
        criteria: "Any Class 3 peak",
      },
      {
        slug: "expert-mountaineer",
        name: "Expert Mountaineer",
        description: "Summit any Class 4 peak",
        icon: "climbing-helmet",
        criteria: "Any Class 4 peak",
      },
    ],
  },
  special: {
    label: "Special Achievements",
    description: "Iconic peaks and legendary accomplishments",
    badges: [
      {
        slug: "summit-king",
        name: "Summit King",
        description: "Summit Mt. Elbert, Colorado's highest peak",
        icon: "crown-elevation",
        criteria: "Summit Mt. Elbert (14,440 ft)",
      },
      {
        slug: "prominence-pioneer",
        name: "Prominence Pioneer",
        description: "Summit Pikes Peak, the most prominent 14er",
        icon: "mountain-shadow",
        criteria: "Summit Pikes Peak",
      },
      {
        slug: "maroon-survivor",
        name: "Maroon Survivor",
        description: "Survive the Deadly Bells - summit either Maroon Bell",
        icon: "bell-peaks",
        criteria: "Maroon Peak or North Maroon",
      },
      {
        slug: "basin-bagger",
        name: "Basin Bagger",
        description: "Complete the Chicago Basin trio",
        icon: "train-peaks",
        criteria: "Windom, Sunlight, Eolus",
      },
    ],
  },
  seasonal: {
    label: "Seasonal",
    description: "Brave the elements year-round",
    badges: [
      {
        slug: "winter-warrior",
        name: "Winter Warrior",
        description: "Summit a 14er during winter (Dec-Feb)",
        icon: "snowflake-peak",
        criteria: "Summit in December, January, or February",
      },
    ],
  },
  dedication: {
    label: "Dedication",
    description: "Show your commitment to the mountains",
    badges: [
      {
        slug: "sunrise-summiter",
        name: "Sunrise Summiter",
        description: "Log 5 summits with clear weather conditions",
        icon: "sun-rising",
        criteria: "5 clear weather summits",
      },
      {
        slug: "elevation-beast",
        name: "Elevation Beast",
        description: "Gain over 100,000 feet of total elevation",
        icon: "upward-arrow",
        criteria: "100,000+ ft cumulative gain",
      },
      {
        slug: "century-hiker",
        name: "Century Hiker",
        description: "Hike over 100 total miles on 14ers",
        icon: "century-boots",
        criteria: "100+ total miles",
      },
    ],
  },
};

type CategoryKey = keyof typeof BADGE_DATA;

// Icon rendering components
function IconRenderer({ iconName, className }: { iconName: string; className?: string }) {
  const baseClass = `${className || "w-8 h-8"} text-white`;

  switch (iconName) {
    case "mountain-sunrise":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M6.5 5.5l1.4 1.4M4 11h2M17.5 5.5l-1.4 1.4M20 11h-2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8L5 21h14L12 8z" />
        </svg>
      );
    case "high-five":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 11V5a2 2 0 114 0v6M7 11V8a2 2 0 114 0v3M5 11V9a2 2 0 114 0v2M3 11v1a2 2 0 104 0v-1" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 11l-2 10H9L7 11" />
        </svg>
      );
    case "double-digits":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold">10</text>
        </svg>
      );
    case "quarter-chart":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="8" />
          <path strokeLinecap="round" d="M12 4v8l5.66 5.66" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "split-mountain":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L5 21h14L12 3z" />
          <path strokeLinecap="round" d="M12 3v18" strokeDasharray="2 2" />
        </svg>
      );
    case "crown-58":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16l-3-8 5 4 5-8 5 8 5-4-3 8H5z" />
          <text x="12" y="22" textAnchor="middle" fontSize="6" fontWeight="bold">58</text>
        </svg>
      );
    case "range-complete":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 21l4-8 4 5 4-10 4 13" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8l3-5 3 5" />
        </svg>
      );
    case "graduation-cap":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9l10 6 10-6-10-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 9v6c0 2.21 4.48 4 10 4s10-1.79 10-4V9" />
          <path strokeLinecap="round" d="M22 9v8" />
        </svg>
      );
    case "crestone-peaks":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l5-10 3 4 3-8 3 6 4-4v12H3z" />
        </svg>
      );
    case "boot-print":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 5v4a2 2 0 002 2h6a2 2 0 002-2V5M9 2h6v3H9V2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 13h10v6a3 3 0 01-3 3h-4a3 3 0 01-3-3v-6z" />
          <path strokeLinecap="round" d="M9 16h6M9 19h6" />
        </svg>
      );
    case "hands-rock":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6v10l-3-3M15 6v10l3-3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l-5 6h10l-5-6z" />
        </svg>
      );
    case "rope-carabiner":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="7" y="4" width="10" height="16" rx="3" />
          <path strokeLinecap="round" d="M17 8h-4M17 12h-4M17 16h-4" />
          <circle cx="10" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "climbing-helmet":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 14c0-5 4-9 8-9s8 4 8 9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 14v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          <path strokeLinecap="round" d="M12 5v4" />
        </svg>
      );
    case "crown-elevation":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16l-3-8 5 4 5-8 5 8 5-4-3 8H5z" />
          <path d="M12 19l-3 2h6l-3-2z" strokeLinecap="round" />
        </svg>
      );
    case "mountain-shadow":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L5 21h14L12 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L19 21" opacity="0.3" fill="currentColor" />
        </svg>
      );
    case "bell-peaks":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3l-5 18h10L8 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 5l-5 16h10L16 5z" />
        </svg>
      );
    case "train-peaks":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 15h12M8 15V9l4-5 4 5v6" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
        </svg>
      );
    case "snowflake-peak":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l4 4M12 2l-4 4M12 22l4-4M12 22l-4-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l4 4M2 12l4-4M22 12l-4 4M22 12l-4-4" />
        </svg>
      );
    case "sun-rising":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          <path strokeLinecap="round" d="M4 21h16" />
        </svg>
      );
    case "upward-arrow":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          <path strokeLinecap="round" d="M8 19h8" />
        </svg>
      );
    case "century-boots":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <text x="12" y="10" textAnchor="middle" fontSize="8" fontWeight="bold">100</text>
          <path d="M7 14v6a1 1 0 001 1h2v-4l2 2 2-2v4h2a1 1 0 001-1v-6H7z" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 22h20L12 2z" />
        </svg>
      );
  }
}

interface BadgeExplainerProps {
  showCategories?: CategoryKey[];
  compact?: boolean;
}

export default function BadgeExplainer({
  showCategories,
  compact = false,
}: BadgeExplainerProps) {
  const categoriesToShow = showCategories || (Object.keys(BADGE_DATA) as CategoryKey[]);

  return (
    <div className="space-y-10">
      {categoriesToShow.map((categoryKey) => {
        const category = BADGE_DATA[categoryKey];
        if (!category) return null;

        return (
          <section key={categoryKey}>
            {/* Category Header */}
            <div className="mb-6">
              <h3 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
                {category.label}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {category.description}
              </p>
            </div>

            {/* Badges Grid */}
            <div className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {category.badges.map((badge) => (
                <div
                  key={badge.slug}
                  className="group relative bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border-app)] hover:border-[var(--color-border-app-strong)] transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    {/* Badge Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-amber-glow)] to-[var(--color-amber-glow)]/70 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <IconRenderer iconName={badge.icon} className="w-7 h-7" />
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--color-text-primary)] leading-tight">
                        {badge.name}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-muted-green)]">
                          {badge.criteria}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * BadgeExplainerCompact - A smaller inline list version
 */
export function BadgeExplainerCompact({ category }: { category: CategoryKey }) {
  const categoryData = BADGE_DATA[category];
  if (!categoryData) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
        {categoryData.label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {categoryData.badges.map((badge) => (
          <div
            key={badge.slug}
            className="group relative inline-flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-app)] hover:border-[var(--color-border-app-strong)] transition-colors cursor-default"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-amber-glow)] to-[var(--color-amber-glow)]/70 flex items-center justify-center">
              <IconRenderer iconName={badge.icon} className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {badge.name}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--color-text-primary)] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
              <p className="font-medium">{badge.description}</p>
              <p className="text-white/70 mt-0.5">{badge.criteria}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AllBadgesCount - Shows total badge stats
 */
export function AllBadgesCount() {
  const totalBadges = Object.values(BADGE_DATA).reduce(
    (sum, cat) => sum + cat.badges.length,
    0
  );
  const categoryCount = Object.keys(BADGE_DATA).length;

  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <span className="font-semibold text-[var(--color-text-primary)]">{totalBadges}</span>
        <span className="text-[var(--color-text-secondary)] ml-1">badges to earn</span>
      </div>
      <div className="w-px h-4 bg-[var(--color-border-app)]" />
      <div>
        <span className="font-semibold text-[var(--color-text-primary)]">{categoryCount}</span>
        <span className="text-[var(--color-text-secondary)] ml-1">categories</span>
      </div>
    </div>
  );
}
