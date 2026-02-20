import type { BadgeDefinition } from "@/lib/database.types";
import {
  GiMountaintop,
  GiMountainClimbing,
  GiMountains,
  GiSnowflake1,
  GiCrown,
  GiBootPrints,
  GiPeaks,
  GiSun,
  GiPieChart,
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

  return (
    <div className="relative group cursor-pointer">
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center ${
          earned
            ? "bg-gradient-to-br from-[var(--color-amber-glow)] to-[var(--color-amber-glow)]/70"
            : "bg-[var(--color-surface-subtle)]"
        } ${earned ? "" : "opacity-40"}`}
      >
        <IconRenderer
          iconName={badge.icon_name}
          earned={earned}
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
  earned,
  className,
}: {
  iconName: string;
  earned: boolean;
  className: string;
}) {
  const color = earned ? "text-white" : "text-[var(--color-text-secondary)]";
  const combinedClass = `${className} ${color}`;

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
