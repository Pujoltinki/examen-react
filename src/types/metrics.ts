export type MetricDirection = "higher_is_better" | "lower_is_better";

export interface MetricMetadata {
  key: string;
  label: string;
  unit: string;
  direction: MetricDirection;
  description: string;
}

export interface DayMetrics {
  [key: string]: number | null;
}

export interface DayRecord {
  date: string;
  metrics: DayMetrics;
}

export interface DatasetMetadata {
  start_date: string;
  end_date: string;
  days: number;
  metrics: MetricMetadata[];
}

export interface Dataset {
  metadata: DatasetMetadata;
  days: DayRecord[];
}

export type MetricsJson = Record<string, Dataset>;

export interface PeriodSummary {
  traffic: number;
  leadsCreated: number;
  leadsQualified: number;
  dealsCreated: number;
  dealsWon: number;
  dealsLost: number;
  winRate: number | null;
  avgResponseTime: number | null;
  avgDealCycle: number | null;
  staleDeals: number | null;
  supportTicketsOpened: number;
  supportAvgResolution: number | null;
}