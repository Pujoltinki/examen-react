import { DayRecord, PeriodSummary } from "../types/metrics";

export function sumMetric(days: DayRecord[], key: string): number {
  return days.reduce((total, day) => {
    const value = day.metrics[key];
    return typeof value === "number" ? total + value : total;
  }, 0);
}

export function averageMetric(days: DayRecord[], key: string): number | null {
  const validValues = days
    .map((day) => day.metrics[key])
    .filter((value): value is number => typeof value === "number");

  if (validValues.length === 0) return null;

  const total = validValues.reduce((sum, value) => sum + value, 0);
  return total / validValues.length;
}

export function latestMetric(days: DayRecord[], key: string): number | null {
  const reversed = [...days].reverse();

  for (const day of reversed) {
    const value = day.metrics[key];

    if (typeof value === "number") {
      return value;
    }
  }

  return null;
}

export function safeRate(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

export function calculateSummary(days: DayRecord[]): PeriodSummary {
  const traffic = sumMetric(days, "traffic");
  const leadsCreated = sumMetric(days, "leads_created");
  const leadsQualified = sumMetric(days, "leads_qualified");
  const dealsCreated = sumMetric(days, "deals_created");
  const dealsWon = sumMetric(days, "deals_won");
  const dealsLost = sumMetric(days, "deals_lost");

  const closedDeals = dealsWon + dealsLost;

  return {
    traffic,
    leadsCreated,
    leadsQualified,
    dealsCreated,
    dealsWon,
    dealsLost,
    winRate: safeRate(dealsWon, closedDeals),
    avgResponseTime: averageMetric(days, "avg_response_time_min"),
    avgDealCycle: averageMetric(days, "avg_deal_cycle_days"),
    staleDeals: latestMetric(days, "stale_deals"),
    supportTicketsOpened: sumMetric(days, "support_tickets_opened"),
    supportAvgResolution: averageMetric(days, "support_avg_resolution_hours"),
  };
}

export function formatNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "Sin datos";

  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "Sin datos";

  return new Intl.NumberFormat("es-CL", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function calculateChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;

  return (current - previous) / Math.abs(previous);
}

export function formatChange(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "Sin comparación";

  const sign = value > 0 ? "+" : "";

  return `${sign}${(value * 100).toFixed(1)}%`;
}