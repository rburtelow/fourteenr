"use client";

/**
 * BadgeExplainer - A comprehensive component showing all badge definitions
 * with their icons, descriptions, and unlock requirements
 */

import {
  GiMountaintop,
  GiMountainClimbing,
  GiMountains,
  GiSnowflake1,
  GiCrown,
  GiBootPrints,
  GiPeaks,
  GiSun,
  GiMiningHelmet,
  GiRopeCoil,
  GiLevelEndFlag,
} from "react-icons/gi";
import {
  FaHandsHelping,
  FaMountain,
  FaGraduationCap,
  FaTrain,
  FaBell,
  FaChartPie,
} from "react-icons/fa";
import { TbArrowBigUpFilled, TbNumber10Small } from "react-icons/tb";
import { WiSunrise } from "react-icons/wi";

// Category-based color gradients for visual distinction
const categoryColors = {
  milestone: {
    gradient: "from-amber-500 to-yellow-600",
    ring: "ring-amber-400/30",
    label: "bg-amber-100 text-amber-800",
  },
  range: {
    gradient: "from-emerald-500 to-green-600",
    ring: "ring-emerald-400/30",
    label: "bg-emerald-100 text-emerald-800",
  },
  difficulty: {
    gradient: "from-orange-500 to-red-600",
    ring: "ring-orange-400/30",
    label: "bg-orange-100 text-orange-800",
  },
  special: {
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-400/30",
    label: "bg-violet-100 text-violet-800",
  },
  seasonal: {
    gradient: "from-cyan-500 to-blue-600",
    ring: "ring-cyan-400/30",
    label: "bg-cyan-100 text-cyan-800",
  },
  dedication: {
    gradient: "from-rose-500 to-pink-600",
    ring: "ring-rose-400/30",
    label: "bg-rose-100 text-rose-800",
  },
};

// All badge data organized by category
interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rangeLabel?: string;
}

interface BadgeCategory {
  label: string;
  description: string;
  badges: BadgeDefinition[];
}

interface BadgeData {
  milestone: BadgeCategory;
  range: BadgeCategory;
  difficulty: BadgeCategory;
  special: BadgeCategory;
  seasonal: BadgeCategory;
  dedication: BadgeCategory;
}

const BADGE_DATA: BadgeData = {
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
        rangeLabel: "SAW",
      },
      {
        slug: "mosquito-master",
        name: "Mosquito Master",
        description: "Complete all 5 Mosquito Range peaks",
        icon: "range-complete",
        criteria: "All 5 Mosquito peaks",
        rangeLabel: "MOS",
      },
      {
        slug: "front-range-master",
        name: "Front Range Master",
        description: "Complete all 6 Front Range peaks",
        icon: "range-complete",
        criteria: "All 6 Front Range peaks",
        rangeLabel: "FR",
      },
      {
        slug: "sangre-de-cristo-master",
        name: "Sangre de Cristo Master",
        description: "Complete all 10 Sangre de Cristo peaks",
        icon: "range-complete",
        criteria: "All 10 Sangre de Cristo peaks",
        rangeLabel: "SDC",
      },
      {
        slug: "elk-range-master",
        name: "Elk Range Master",
        description: "Complete all 7 Elk Range peaks",
        icon: "range-complete",
        criteria: "All 7 Elk Range peaks",
        rangeLabel: "ELK",
      },
      {
        slug: "san-juan-master",
        name: "San Juan Master",
        description: "Complete all 13 San Juan peaks",
        icon: "range-complete",
        criteria: "All 13 San Juan peaks",
        rangeLabel: "SJ",
      },
      {
        slug: "tenmile-pioneer",
        name: "Tenmile Pioneer",
        description: "Summit Quandary Peak in the Tenmile Range",
        icon: "range-complete",
        criteria: "Summit Quandary Peak",
        rangeLabel: "10M",
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

// Icon rendering using react-icons (same as BadgeIcon component)
function IconRenderer({ iconName, className }: { iconName: string; className?: string }) {
  const combinedClass = `${className || "w-8 h-8"} text-white`;

  switch (iconName) {
    // Milestone badges
    case "mountain-sunrise":
      return <WiSunrise className={combinedClass} />;
    case "high-five":
      return <FaHandsHelping className={combinedClass} />;
    case "double-digits":
      return <TbNumber10Small className={combinedClass} />;
    case "quarter-chart":
      return <FaChartPie className={combinedClass} />;
    case "split-mountain":
      return <GiMountaintop className={combinedClass} />;
    case "crown-58":
      return <GiCrown className={combinedClass} />;

    // Range badges
    case "range-complete":
      return <GiLevelEndFlag className={combinedClass} />;
    case "graduation-cap":
      return <FaGraduationCap className={combinedClass} />;
    case "crestone-peaks":
      return <GiPeaks className={combinedClass} />;

    // Difficulty badges
    case "boot-print":
      return <GiBootPrints className={combinedClass} />;
    case "hands-rock":
      return <GiMountainClimbing className={combinedClass} />;
    case "rope-carabiner":
      return <GiRopeCoil className={combinedClass} />;
    case "climbing-helmet":
      return <GiMiningHelmet className={combinedClass} />;

    // Special badges
    case "crown-elevation":
      return <GiCrown className={combinedClass} />;
    case "mountain-shadow":
      return <GiMountains className={combinedClass} />;
    case "bell-peaks":
      return <FaBell className={combinedClass} />;
    case "train-peaks":
      return <FaTrain className={combinedClass} />;

    // Seasonal & dedication badges
    case "snowflake-peak":
      return <GiSnowflake1 className={combinedClass} />;
    case "sun-rising":
      return <GiSun className={combinedClass} />;
    case "upward-arrow":
      return <TbArrowBigUpFilled className={combinedClass} />;
    case "century-boots":
      return <GiBootPrints className={combinedClass} />;

    default:
      return <FaMountain className={combinedClass} />;
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
              {category.badges.map((badge) => {
                const colors = categoryColors[categoryKey];
                return (
                  <div
                    key={badge.slug}
                    className="group relative bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border-app)] hover:border-[var(--color-border-app-strong)] transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      {/* Badge Icon */}
                      <div className="relative flex-shrink-0">
                        {badge.rangeLabel && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 bg-white rounded text-[9px] font-bold tracking-wide text-emerald-700 shadow-sm border border-emerald-200 whitespace-nowrap">
                            {badge.rangeLabel}
                          </div>
                        )}
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ring-2 ${colors.ring} group-hover:scale-110 transition-transform duration-300`}>
                          <IconRenderer iconName={badge.icon} className="w-7 h-7" />
                        </div>
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
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.label}`}>
                            {badge.criteria}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

  const colors = categoryColors[category];

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
            <div className="relative">
              {badge.rangeLabel && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 px-1 py-0 bg-white rounded text-[7px] font-bold tracking-wide text-emerald-700 shadow-sm border border-emerald-200 whitespace-nowrap leading-tight">
                  {badge.rangeLabel}
                </div>
              )}
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-sm ring-1 ${colors.ring}`}>
                <IconRenderer iconName={badge.icon} className="w-4 h-4" />
              </div>
            </div>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {badge.name}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--color-text-primary)]/98 backdrop-blur-sm text-white text-xs rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
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
