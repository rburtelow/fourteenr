import type {
  BadgeDefinition,
  BadgeUnlockCriteria,
  Peak,
  UserData,
  EvaluationResult,
} from "./types.ts";

/**
 * Evaluate if a user has earned a specific badge based on the unlock criteria
 */
export function evaluateBadge(
  badge: BadgeDefinition,
  userData: UserData,
  peakMap: Map<string, Peak>,
  peaksByRange: Map<string, string[]>,
  peaksByDifficulty: Map<string, string[]>
): EvaluationResult {
  const criteria = badge.unlock_criteria;

  switch (criteria.type) {
    case "peak_count":
      return evaluatePeakCount(criteria, userData);

    case "range_complete":
      return evaluateRangeComplete(criteria, userData, peaksByRange);

    case "peak_list":
      return evaluatePeakList(criteria, userData, peakMap);

    case "peak_list_any":
      return evaluatePeakListAny(criteria, userData, peakMap);

    case "difficulty_complete":
      return evaluateDifficultyComplete(criteria, userData, peaksByDifficulty);

    case "difficulty_any":
      return evaluateDifficultyAny(criteria, userData, peaksByDifficulty, peakMap);

    case "specific_peak":
      return evaluateSpecificPeak(criteria, userData, peakMap);

    case "seasonal_summit":
      return evaluateSeasonalSummit(criteria, userData);

    case "weather_count":
      return evaluateWeatherCount(criteria, userData);

    case "total_elevation":
      return evaluateTotalElevation(criteria, userData);

    case "total_miles":
      return evaluateTotalMiles(criteria, userData);

    default:
      console.warn(`Unknown criteria type for badge ${badge.slug}`);
      return { earned: false };
  }
}

function evaluatePeakCount(
  criteria: { type: "peak_count"; count: number },
  userData: UserData
): EvaluationResult {
  const earned = userData.summitedPeakIds.size >= criteria.count;
  if (earned) {
    // Find the most recent summit that pushed them over the threshold
    const sortedLogs = [...userData.summitLogs].sort(
      (a, b) => new Date(a.summit_date).getTime() - new Date(b.summit_date).getTime()
    );
    const uniquePeakIds = new Set<string>();
    let triggerPeakId: string | undefined;
    for (const log of sortedLogs) {
      if (!uniquePeakIds.has(log.peak_id)) {
        uniquePeakIds.add(log.peak_id);
        if (uniquePeakIds.size === criteria.count) {
          triggerPeakId = log.peak_id;
          break;
        }
      }
    }
    return { earned: true, triggerPeakId };
  }
  return { earned: false };
}

function evaluateRangeComplete(
  criteria: { type: "range_complete"; range: string },
  userData: UserData,
  peaksByRange: Map<string, string[]>
): EvaluationResult {
  const rangePeakIds = peaksByRange.get(criteria.range) || [];
  if (rangePeakIds.length === 0) {
    return { earned: false };
  }

  const allCompleted = rangePeakIds.every((id) => userData.summitedPeakIds.has(id));
  if (allCompleted) {
    // Find the last peak completed in this range
    const rangeLogs = userData.summitLogs
      .filter((log) => rangePeakIds.includes(log.peak_id))
      .sort((a, b) => new Date(b.summit_date).getTime() - new Date(a.summit_date).getTime());
    return { earned: true, triggerPeakId: rangeLogs[0]?.peak_id };
  }
  return { earned: false };
}

function evaluatePeakList(
  criteria: { type: "peak_list"; peaks: string[] },
  userData: UserData,
  peakMap: Map<string, Peak>
): EvaluationResult {
  // Convert slugs to IDs
  const requiredPeakIds: string[] = [];
  for (const [id, peak] of peakMap) {
    if (criteria.peaks.includes(peak.slug)) {
      requiredPeakIds.push(id);
    }
  }

  if (requiredPeakIds.length !== criteria.peaks.length) {
    console.warn(`Could not find all peaks for criteria: ${criteria.peaks.join(", ")}`);
    return { earned: false };
  }

  const allCompleted = requiredPeakIds.every((id) => userData.summitedPeakIds.has(id));
  if (allCompleted) {
    const listLogs = userData.summitLogs
      .filter((log) => requiredPeakIds.includes(log.peak_id))
      .sort((a, b) => new Date(b.summit_date).getTime() - new Date(a.summit_date).getTime());
    return { earned: true, triggerPeakId: listLogs[0]?.peak_id };
  }
  return { earned: false };
}

function evaluatePeakListAny(
  criteria: { type: "peak_list_any"; peaks: string[] },
  userData: UserData,
  peakMap: Map<string, Peak>
): EvaluationResult {
  // Convert slugs to IDs and check if any are completed
  for (const [id, peak] of peakMap) {
    if (criteria.peaks.includes(peak.slug) && userData.summitedPeakIds.has(id)) {
      return { earned: true, triggerPeakId: id };
    }
  }
  return { earned: false };
}

function evaluateDifficultyComplete(
  criteria: { type: "difficulty_complete"; difficulty: string },
  userData: UserData,
  peaksByDifficulty: Map<string, string[]>
): EvaluationResult {
  const difficultyPeakIds = peaksByDifficulty.get(criteria.difficulty) || [];
  if (difficultyPeakIds.length === 0) {
    return { earned: false };
  }

  const allCompleted = difficultyPeakIds.every((id) => userData.summitedPeakIds.has(id));
  if (allCompleted) {
    const diffLogs = userData.summitLogs
      .filter((log) => difficultyPeakIds.includes(log.peak_id))
      .sort((a, b) => new Date(b.summit_date).getTime() - new Date(a.summit_date).getTime());
    return { earned: true, triggerPeakId: diffLogs[0]?.peak_id };
  }
  return { earned: false };
}

function evaluateDifficultyAny(
  criteria: { type: "difficulty_any"; difficulty: string },
  userData: UserData,
  peaksByDifficulty: Map<string, string[]>,
  peakMap: Map<string, Peak>
): EvaluationResult {
  const difficultyPeakIds = peaksByDifficulty.get(criteria.difficulty) || [];

  for (const peakId of difficultyPeakIds) {
    if (userData.summitedPeakIds.has(peakId)) {
      return { earned: true, triggerPeakId: peakId };
    }
  }
  return { earned: false };
}

function evaluateSpecificPeak(
  criteria: { type: "specific_peak"; peak_slug: string },
  userData: UserData,
  peakMap: Map<string, Peak>
): EvaluationResult {
  for (const [id, peak] of peakMap) {
    if (peak.slug === criteria.peak_slug && userData.summitedPeakIds.has(id)) {
      return { earned: true, triggerPeakId: id };
    }
  }
  return { earned: false };
}

function evaluateSeasonalSummit(
  criteria: { type: "seasonal_summit"; months: number[] },
  userData: UserData
): EvaluationResult {
  for (const log of userData.summitLogs) {
    const month = new Date(log.summit_date).getMonth() + 1; // 1-12
    if (criteria.months.includes(month)) {
      return { earned: true, triggerPeakId: log.peak_id };
    }
  }
  return { earned: false };
}

function evaluateWeatherCount(
  criteria: { type: "weather_count"; weather: string; count: number },
  userData: UserData
): EvaluationResult {
  const matchingLogs = userData.summitLogs.filter(
    (log) => log.weather?.toLowerCase() === criteria.weather.toLowerCase()
  );

  if (matchingLogs.length >= criteria.count) {
    // Sort by date and find the one that put them over the threshold
    const sortedLogs = [...matchingLogs].sort(
      (a, b) => new Date(a.summit_date).getTime() - new Date(b.summit_date).getTime()
    );
    return { earned: true, triggerPeakId: sortedLogs[criteria.count - 1]?.peak_id };
  }
  return { earned: false };
}

function evaluateTotalElevation(
  criteria: { type: "total_elevation"; feet: number },
  userData: UserData
): EvaluationResult {
  const earned = userData.totalElevation >= criteria.feet;
  if (earned) {
    // Find most recent summit as trigger
    const sortedLogs = [...userData.summitLogs].sort(
      (a, b) => new Date(b.summit_date).getTime() - new Date(a.summit_date).getTime()
    );
    return { earned: true, triggerPeakId: sortedLogs[0]?.peak_id };
  }
  return { earned: false };
}

function evaluateTotalMiles(
  criteria: { type: "total_miles"; miles: number },
  userData: UserData
): EvaluationResult {
  const earned = userData.totalMiles >= criteria.miles;
  if (earned) {
    const sortedLogs = [...userData.summitLogs].sort(
      (a, b) => new Date(b.summit_date).getTime() - new Date(a.summit_date).getTime()
    );
    return { earned: true, triggerPeakId: sortedLogs[0]?.peak_id };
  }
  return { earned: false };
}
