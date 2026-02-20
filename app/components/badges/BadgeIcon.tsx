import type { BadgeDefinition, BadgeCategory } from "@/lib/database.types";
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

// Range labels for range mastery badges
const rangeLabelMap: Record<string, string> = {
  "sawatch-master": "SAW",
  "mosquito-master": "MOS",
  "front-range-master": "FR",
  "sangre-de-cristo-master": "SDC",
  "elk-range-master": "ELK",
  "san-juan-master": "SJ",
  "tenmile-pioneer": "10M",
};

// Category-based color gradients for visual distinction
const categoryColors: Record<BadgeCategory, { gradient: string; ring: string }> = {
  milestone: {
    gradient: "from-amber-500 to-yellow-600",
    ring: "ring-amber-400/30",
  },
  range: {
    gradient: "from-emerald-500 to-green-600",
    ring: "ring-emerald-400/30",
  },
  difficulty: {
    gradient: "from-orange-500 to-red-600",
    ring: "ring-orange-400/30",
  },
  special: {
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-400/30",
  },
  seasonal: {
    gradient: "from-cyan-500 to-blue-600",
    ring: "ring-cyan-400/30",
  },
  dedication: {
    gradient: "from-rose-500 to-pink-600",
    ring: "ring-rose-400/30",
  },
};

interface BadgeIconProps {
  badge: BadgeDefinition;
  earned: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  earnedDate?: string;
}

export default function BadgeIcon({
  badge,
  earned,
  size = "md",
  showTooltip = true,
  earnedDate,
}: BadgeIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const colors = categoryColors[badge.category] || categoryColors.milestone;
  const rangeLabel = rangeLabelMap[badge.slug];

  // Size-specific label styling
  const labelSizeClasses = {
    sm: "text-[6px] px-0.5 -top-1",
    md: "text-[7px] px-1 -top-1.5",
    lg: "text-[9px] px-1.5 py-0.5 -top-2",
  };

  return (
    <div className="relative group cursor-pointer">
      {rangeLabel && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-10 bg-white rounded font-bold tracking-wide shadow-sm border whitespace-nowrap leading-tight ${labelSizeClasses[size]} ${
          earned
            ? "text-emerald-700 border-emerald-200"
            : "text-gray-400 border-gray-200 opacity-60"
        }`}>
          {rangeLabel}
        </div>
      )}
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br ${colors.gradient} ${
          earned
            ? `shadow-lg ring-2 ${colors.ring} group-hover:scale-110 group-hover:shadow-xl`
            : "opacity-30 grayscale-[50%]"
        }`}
      >
        <IconRenderer
          iconName={badge.icon_name}
          className={iconSizeClasses[size]}
        />
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--color-text-primary)]/98 backdrop-blur-sm text-white text-xs rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
          <p className="font-semibold">{badge.name}</p>
          <p className="text-white/70 text-[10px] mt-0.5">{badge.description}</p>
          {earnedDate && (
            <p className="text-white/60 text-[10px] mt-1 border-t border-white/20 pt-1">
              Earned {earnedDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function IconRenderer({
  iconName,
  className,
}: {
  iconName: string;
  className: string;
}) {
  const combinedClass = `${className} text-white`;

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
