"use client";

import { useState, useEffect, useTransition } from "react";
import Modal from "@/app/components/Modal";
import { createTripReport } from "./trip-report-actions";
import type { Route, TripReportSections } from "@/lib/database.types";

interface TripReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  peakId: string;
  peakName: string;
  routes: Route[];
  onReportCreated?: () => void;
}

type Step = "core" | "ratings" | "sections";

const STEP_LABELS: Record<Step, string> = {
  core: "Trip Details",
  ratings: "Ratings & Conditions",
  sections: "Report Sections",
};

const STEPS: Step[] = ["core", "ratings", "sections"];

const TRAILHEAD_ACCESS = [
  { value: "clear_2wd", label: "Clear (2WD)" },
  { value: "rough_2wd", label: "Rough (2WD)" },
  { value: "4wd_required", label: "4WD Required" },
  { value: "snow_blocked", label: "Snow Blocked" },
];

const SECTION_DEFS = [
  { key: "trailhead_conditions", label: "Trailhead Conditions", icon: "P" },
  { key: "weather", label: "Weather", icon: "W" },
  { key: "snow_conditions", label: "Snow Conditions", icon: "S" },
  { key: "route_conditions", label: "Route Conditions", icon: "R" },
  { key: "water_crossings", label: "Water Crossings", icon: "~" },
  { key: "navigation_notes", label: "Navigation Notes", icon: "N" },
  { key: "time_breakdown", label: "Time Breakdown", icon: "T" },
  { key: "gear", label: "Gear", icon: "G" },
  { key: "camping", label: "Camping", icon: "C" },
  { key: "training_prep", label: "Training & Prep", icon: "F" },
  { key: "wildlife", label: "Wildlife", icon: "A" },
  { key: "lessons_learned", label: "Lessons Learned", icon: "L" },
  { key: "mistakes_made", label: "Mistakes Made", icon: "M" },
] as const;

type SectionKey = (typeof SECTION_DEFS)[number]["key"];

export default function TripReportModal({
  isOpen,
  onClose,
  peakId,
  peakName,
  routes,
  onReportCreated,
}: TripReportModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("core");

  // Core fields
  const [routeId, setRouteId] = useState("");
  const [hikeDate, setHikeDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [summary, setSummary] = useState("");
  const [narrative, setNarrative] = useState("");
  const [overallRecommendation, setOverallRecommendation] = useState(true);

  // Ratings
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [conditionSeverity, setConditionSeverity] = useState(3);
  const [objectiveRisk, setObjectiveRisk] = useState(3);
  const [trailheadAccess, setTrailheadAccess] = useState("");
  const [snowPresent, setSnowPresent] = useState(false);
  // Sections
  const [enabledSections, setEnabledSections] = useState<Set<SectionKey>>(new Set());
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});
  // Section-specific structured data
  const [sectionData, setSectionData] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setStep("core");
      setRouteId("");
      setHikeDate("");
      setStartTime("");
      setEndTime("");
      setSummary("");
      setNarrative("");
      setOverallRecommendation(true);
      setDifficultyRating(3);
      setConditionSeverity(3);
      setObjectiveRisk(3);
      setTrailheadAccess("");
      setSnowPresent(false);
      setEnabledSections(new Set());
      setSectionNotes({});
      setSectionData({});
    }
  }, [isOpen]);

  const toggleSection = (key: SectionKey) => {
    setEnabledSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const updateSectionNote = (key: string, value: string) => {
    setSectionNotes((prev) => ({ ...prev, [key]: value }));
  };

  const updateSectionField = (sectionKey: string, field: string, value: unknown) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [field]: value },
    }));
  };

  const buildSectionsJson = (): TripReportSections => {
    const sections: TripReportSections = {};
    for (const def of SECTION_DEFS) {
      if (enabledSections.has(def.key)) {
        const data = { ...(sectionData[def.key] || {}) };
        if (def.key === "wildlife" && typeof data.animals_seen === "string") {
          data.animals_seen = data.animals_seen.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        (sections as Record<string, unknown>)[def.key] = {
          enabled: true,
          data,
          notes: sectionNotes[def.key] || "",
        };
      }
    }
    return sections;
  };

  const totalTimeMinutes = (() => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : null;
  })();

  const canProceedFromCore = Boolean(hikeDate) && summary.trim().length > 0;
  const currentStepIndex = STEPS.indexOf(step);

  const handleSubmit = () => {
    setError(null);
    const formData = new FormData();
    formData.set("peakId", peakId);
    if (routeId) formData.set("routeId", routeId);
    formData.set("hikeDate", hikeDate);
    if (startTime) formData.set("startTime", startTime);
    if (endTime) formData.set("endTime", endTime);
    if (totalTimeMinutes) formData.set("totalTimeMinutes", String(totalTimeMinutes));
    formData.set("difficultyRating", String(difficultyRating));
    formData.set("conditionSeverityScore", String(conditionSeverity));
    formData.set("objectiveRiskScore", String(objectiveRisk));
    if (trailheadAccess) formData.set("trailheadAccessRating", trailheadAccess);
    formData.set("snowPresent", String(snowPresent));
    formData.set("overallRecommendation", String(overallRecommendation));
    formData.set("summary", summary);
    if (narrative) formData.set("narrative", narrative);

    const sectionsJson = buildSectionsJson();
    if (Object.keys(sectionsJson).length > 0) {
      formData.set("sectionsJson", JSON.stringify(sectionsJson));
    }

    startTransition(async () => {
      const result = await createTripReport(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onReportCreated?.();
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write Trip Report" size="xl">
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s === "core" || (s === "ratings" && canProceedFromCore) || (s === "sections" && canProceedFromCore)) {
                  setStep(s);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                step === s
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : i <= currentStepIndex
                  ? "bg-[var(--color-surface-subtle)] text-[var(--color-brand-primary)] cursor-pointer"
                  : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? "bg-white/20"
                  : i < currentStepIndex
                  ? "bg-[var(--color-brand-primary)]/10"
                  : "bg-[var(--color-border-app)]"
              }`}>
                {i < currentStepIndex ? (
                  <CheckIcon className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
            </button>
          ))}
        </div>

        {/* Peak badge */}
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm">
          <MountainIcon className="w-4 h-4 text-[var(--color-brand-primary)]" />
          <span className="font-medium text-[var(--color-text-primary)]">{peakName}</span>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step: Core Details */}
        {step === "core" && (
          <div className="space-y-5 animate-fade-in">
            {/* Route selector */}
            {routes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Route
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                >
                  <option value="">Select a route (optional)</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.difficulty ? `(${r.difficulty})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date and Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Hike Date *
                </label>
                <input
                  type="date"
                  value={hikeDate}
                  onChange={(e) => setHikeDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                />
              </div>
            </div>

            {totalTimeMinutes && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <ClockIcon className="w-3.5 h-3.5" />
                Total: {Math.floor(totalTimeMinutes / 60)}h {totalTimeMinutes % 60}m
              </div>
            )}

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Brief summary of your trip (e.g., 'Beautiful bluebird day, trail in great shape...')"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{summary.length}/500</p>
            </div>

            {/* Narrative */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Full Narrative
              </label>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                placeholder="Tell the full story of your hike..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none"
              />
            </div>

            {/* Recommendation toggle */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)]">
              <button
                type="button"
                onClick={() => setOverallRecommendation(!overallRecommendation)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  overallRecommendation ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-border-app-strong)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    overallRecommendation ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {overallRecommendation ? "Recommended" : "Not recommended"}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Would you recommend this hike to others right now?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Ratings & Conditions */}
        {step === "ratings" && (
          <div className="space-y-6 animate-fade-in">
            {/* Rating sliders */}
            <div className="grid sm:grid-cols-3 gap-6">
              <RatingPicker
                label="Difficulty"
                description="How hard was the hike?"
                value={difficultyRating}
                onChange={setDifficultyRating}
                lowLabel="Easy"
                highLabel="Extreme"
              />
              <RatingPicker
                label="Condition Severity"
                description="Trail & weather conditions"
                value={conditionSeverity}
                onChange={setConditionSeverity}
                lowLabel="Mild"
                highLabel="Severe"
              />
              <RatingPicker
                label="Objective Risk"
                description="Rockfall, exposure, etc."
                value={objectiveRisk}
                onChange={setObjectiveRisk}
                lowLabel="Low"
                highLabel="Extreme"
              />
            </div>

            {/* Trailhead Access */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Trailhead Access
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAILHEAD_ACCESS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTrailheadAccess(trailheadAccess === opt.value ? "" : opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      trailheadAccess === opt.value
                        ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                        : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border-app)] hover:border-[var(--color-brand-primary)]/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Snow toggle */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)]">
                <button
                  type="button"
                  onClick={() => setSnowPresent(!snowPresent)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    snowPresent ? "bg-sky-500" : "bg-[var(--color-border-app-strong)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      snowPresent ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Snow Present</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Was there snow on the route?
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Step: Sections */}
        {step === "sections" && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Toggle sections to add detailed notes. Only enabled sections are saved.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {SECTION_DEFS.map((def) => {
                const active = enabledSections.has(def.key);
                return (
                  <div key={def.key}>
                    <button
                      type="button"
                      onClick={() => toggleSection(def.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border text-left ${
                        active
                          ? "bg-[var(--color-brand-primary)]/5 border-[var(--color-brand-primary)]/30 text-[var(--color-brand-primary)]"
                          : "bg-white border-[var(--color-border-app)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)]/20"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        active
                          ? "bg-[var(--color-brand-primary)] text-white"
                          : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
                      }`}>
                        {def.icon}
                      </span>
                      <span className="flex-1">{def.label}</span>
                      {active && <CheckIcon className="w-4 h-4" />}
                    </button>

                    {active && (
                      <div className="mt-2 ml-2 space-y-3 animate-fade-in">
                        <SectionFields
                          sectionKey={def.key}
                          snowPresent={snowPresent}
                          data={sectionData[def.key] || {}}
                          onFieldChange={(field, value) => updateSectionField(def.key, field, value)}
                        />
                        <textarea
                          value={sectionNotes[def.key] || ""}
                          onChange={(e) => updateSectionNote(def.key, e.target.value)}
                          rows={2}
                          placeholder={`Notes about ${def.label.toLowerCase()}...`}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-app)]">
          <div>
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStep(STEPS[currentStepIndex - 1])}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
            >
              Cancel
            </button>
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={step === "core" && !canProceedFromCore}
                onClick={() => setStep(STEPS[currentStepIndex + 1])}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending || !canProceedFromCore}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Submitting..." : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function RatingPicker({
  label,
  description,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)]">
      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-0.5">{label}</p>
      <p className="text-xs text-[var(--color-text-secondary)] mb-3">{description}</p>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              n === value
                ? "bg-[var(--color-brand-primary)] text-white shadow-md"
                : n <= value
                ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"
                : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border-app)]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-[var(--color-text-secondary)]">{lowLabel}</span>
        <span className="text-[10px] text-[var(--color-text-secondary)]">{highLabel}</span>
      </div>
    </div>
  );
}

function SectionFields({
  sectionKey,
  snowPresent,
  data,
  onFieldChange,
}: {
  sectionKey: SectionKey;
  snowPresent: boolean;
  data: Record<string, unknown>;
  onFieldChange: (field: string, value: unknown) => void;
}) {
  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]";

  switch (sectionKey) {
    case "trailhead_conditions":
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Parking availability"
            value={(data.parking_availability as string) || ""}
            onChange={(e) => onFieldChange("parking_availability", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Road condition"
            value={(data.road_condition as string) || ""}
            onChange={(e) => onFieldChange("road_condition", e.target.value)}
            className={inputClass}
          />
        </div>
      );
    case "weather":
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Summit temp (°F)"
            value={(data.summit_temp_f as string) || ""}
            onChange={(e) => onFieldChange("summit_temp_f", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Wind (mph)"
            value={(data.wind_mph as string) || ""}
            onChange={(e) => onFieldChange("wind_mph", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
        </div>
      );
    case "water_crossings":
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Number of crossings"
            value={(data.crossing_count as string) || ""}
            onChange={(e) => onFieldChange("crossing_count", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
          <input
            placeholder="Difficulty (easy/moderate/hard)"
            value={(data.difficulty as string) || ""}
            onChange={(e) => onFieldChange("difficulty", e.target.value)}
            className={inputClass}
          />
        </div>
      );
    case "camping":
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Campsite location"
            value={(data.campsite_location as string) || ""}
            onChange={(e) => onFieldChange("campsite_location", e.target.value)}
            className={inputClass}
          />
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[var(--color-border-app)] text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.permit_required}
              onChange={(e) => onFieldChange("permit_required", e.target.checked)}
              className="rounded"
            />
            Permit required
          </label>
        </div>
      );
    case "snow_conditions":
      if (!snowPresent) return null;
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Snow depth (inches)"
            value={(data.snow_depth_inches as string) || ""}
            onChange={(e) => onFieldChange("snow_depth_inches", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
          <input
            placeholder="Traction used (e.g., microspikes)"
            value={(data.traction_used as string) || ""}
            onChange={(e) => onFieldChange("traction_used", e.target.value)}
            className={inputClass}
          />
        </div>
      );
    case "time_breakdown":
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Approach (min)"
            value={(data.approach_minutes as string) || ""}
            onChange={(e) => onFieldChange("approach_minutes", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Ascent (min)"
            value={(data.ascent_minutes as string) || ""}
            onChange={(e) => onFieldChange("ascent_minutes", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Summit time (min)"
            value={(data.summit_minutes as string) || ""}
            onChange={(e) => onFieldChange("summit_minutes", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Descent (min)"
            value={(data.descent_minutes as string) || ""}
            onChange={(e) => onFieldChange("descent_minutes", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
        </div>
      );
    case "wildlife":
      return (
        <input
          placeholder="Animals seen (comma-separated)"
          value={(data.animals_seen as string) || ""}
          onChange={(e) => onFieldChange("animals_seen", e.target.value)}
          className={inputClass}
        />
      );
    default:
      return null;
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l5-10 4 5 3-6 4 11H4z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  );
}
