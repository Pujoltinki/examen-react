import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import "./App.css";
import { Dataset, MetricsJson, MetricDirection } from "./types/metrics";
import { Language, texts } from "./i18n/translations";
import {
  calculateChange,
  calculateSummary,
  formatChange,
  formatNumber,
  formatPercent,
  safeRate,
} from "./utils/metrics";

type Tone = "good" | "bad" | "neutral";

interface FocusItem {
  tone: Tone;
  title: string;
  body: string;
}

function App() {
  const [data, setData] = useState<MetricsJson | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string>("A");
  const [rangeDays, setRangeDays] = useState<number>(7);
  const [language, setLanguage] = useState<Language>("es");
  const [error, setError] = useState<string>("");

  const t = texts[language];
  const locale = language === "es" ? "es-CL" : "en-US";

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/metrics.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar metrics.json");
        }

        return response.json();
      })
      .then((json: MetricsJson) => {
        setData(json);

        const firstDataset = Object.keys(json)[0];

        if (firstDataset) {
          setSelectedDataset(firstDataset);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const dataset: Dataset | null = data ? data[selectedDataset] : null;

  const metricDirections = useMemo(() => {
    if (!dataset) return {} as Record<string, MetricDirection>;

    return dataset.metadata.metrics.reduce((acc, metric) => {
      acc[metric.key] = metric.direction;
      return acc;
    }, {} as Record<string, MetricDirection>);
  }, [dataset]);

  const currentDays = useMemo(() => {
    if (!dataset) return [];
    return dataset.days.slice(-rangeDays);
  }, [dataset, rangeDays]);

  const previousDays = useMemo(() => {
    if (!dataset) return [];
    return dataset.days.slice(-(rangeDays * 2), -rangeDays);
  }, [dataset, rangeDays]);

  const chartDays = useMemo(() => {
    if (!dataset) return [];

    return dataset.days.slice(-30).map((day) => ({
      date: day.date.slice(5),
      leads: day.metrics.leads_created ?? 0,
      qualified: day.metrics.leads_qualified ?? 0,
      won: day.metrics.deals_won ?? 0,
      lost: day.metrics.deals_lost ?? 0,
      responseTime: day.metrics.avg_response_time_min,
      tickets: day.metrics.support_tickets_opened ?? 0,
    }));
  }, [dataset]);

  const currentSummary = useMemo(
    () => calculateSummary(currentDays),
    [currentDays]
  );

  const previousSummary = useMemo(
    () => calculateSummary(previousDays),
    [previousDays]
  );

  const funnelData = useMemo(() => {
    return [
      { name: t.funnel.traffic, value: currentSummary.traffic },
      { name: t.funnel.leads, value: currentSummary.leadsCreated },
      { name: t.funnel.qualified, value: currentSummary.leadsQualified },
      { name: t.funnel.deals, value: currentSummary.dealsCreated },
      { name: t.funnel.won, value: currentSummary.dealsWon },
    ];
  }, [currentSummary, t]);

  const funnelRates = useMemo(() => {
    return {
      trafficToLead: safeRate(
        currentSummary.leadsCreated,
        currentSummary.traffic
      ),
      leadToQualified: safeRate(
        currentSummary.leadsQualified,
        currentSummary.leadsCreated
      ),
      qualifiedToDeal: safeRate(
        currentSummary.dealsCreated,
        currentSummary.leadsQualified
      ),
      dealToWon: safeRate(
        currentSummary.dealsWon,
        currentSummary.dealsCreated
      ),
    };
  }, [currentSummary]);

  const weakestStep = useMemo(() => {
    const steps = [
      { label: t.funnel.trafficToLead, value: funnelRates.trafficToLead },
      { label: t.funnel.leadToQualified, value: funnelRates.leadToQualified },
      {
        label: t.funnel.qualifiedToDeal,
        value: funnelRates.qualifiedToDeal,
      },
      { label: t.funnel.dealToWon, value: funnelRates.dealToWon },
    ].filter(
      (item): item is { label: string; value: number } => item.value !== null
    );

    if (!steps.length) return null;

    return steps.reduce((lowest, current) =>
      current.value < lowest.value ? current : lowest
    );
  }, [funnelRates, t]);

  const focusItems = useMemo(() => {
    const items: FocusItem[] = [];

    const winRateChange = calculateChange(
      currentSummary.winRate,
      previousSummary.winRate
    );

    const responseChange = calculateChange(
      currentSummary.avgResponseTime,
      previousSummary.avgResponseTime
    );

    const staleChange = calculateChange(
      currentSummary.staleDeals,
      previousSummary.staleDeals
    );

    const supportResolutionChange = calculateChange(
      currentSummary.supportAvgResolution,
      previousSummary.supportAvgResolution
    );

    if (responseChange !== null && responseChange > 0) {
      items.push({
        tone: "bad",
        title: t.focus.velocityTitle,
        body: t.focus.velocityBody,
      });
    }

    if (winRateChange !== null && winRateChange < 0) {
      items.push({
        tone: "bad",
        title: t.focus.closingTitle,
        body: t.focus.closingBody,
      });
    }

    if (staleChange !== null && staleChange > 0) {
      items.push({
        tone: "bad",
        title: t.focus.staleTitle,
        body: t.focus.staleBody,
      });
    }

    if (supportResolutionChange !== null && supportResolutionChange > 0) {
      items.push({
        tone: "neutral",
        title: t.focus.supportTitle,
        body: t.focus.supportBody,
      });
    }

    if (weakestStep) {
      items.push({
        tone: "neutral",
        title: t.focus.bottleneckTitle,
        body: t.focus.bottleneckBody(
          weakestStep.label,
          formatPercent(weakestStep.value, locale, t.misc.noData)
        ),
      });
    }

    if (!items.length) {
      items.push({
        tone: "good",
        title: t.focus.stableTitle,
        body: t.focus.stableBody,
      });
    }

    return items.slice(0, 4);
  }, [currentSummary, previousSummary, weakestStep, t, locale]);

  const lastAvailableDate =
    currentDays.length > 0
      ? currentDays[currentDays.length - 1].date
      : dataset?.metadata.end_date ?? "";

  if (error) {
    return (
      <main className="app">
        <section className="error-card">
          <h1>{t.misc.errorTitle}</h1>
          <p>{error}</p>
          <p>{t.misc.errorHelp}</p>
        </section>
      </main>
    );
  }

  if (!data || !dataset) {
    return (
      <main className="app">
        <p>{t.misc.loading}</p>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="dashboard-header">
        <div className="header-copy">
          <p className="eyebrow">{t.header.eyebrow}</p>
          <h1>{t.header.title}</h1>
          <p className="subtitle">{t.header.subtitle}</p>
        </div>

        <div className="controls-card">
          <div className="controls">
            <label>
              {t.language.label}
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
              >
                <option value="es">{t.language.spanish}</option>
                <option value="en">{t.language.english}</option>
              </select>
            </label>

            <label>
              {t.controls.dataset}
              <select
                value={selectedDataset}
                onChange={(event) => setSelectedDataset(event.target.value)}
              >
                {Object.keys(data).map((key) => (
                  <option key={key} value={key}>
                    {t.controls.datasetOption(key)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.controls.period}
              <select
                value={rangeDays}
                onChange={(event) => setRangeDays(Number(event.target.value))}
              >
                <option value={7}>{t.controls.last7}</option>
                <option value={30}>{t.controls.last30}</option>
                <option value={90}>{t.controls.last90}</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <section className="summary-strip">
        <InfoPill
          label={t.pills.activeDataset}
          value={t.controls.datasetOption(selectedDataset)}
        />

        <InfoPill
          label={t.pills.analyzedPeriod}
          value={t.pills.periodValue(rangeDays)}
        />

        <InfoPill
          label={t.pills.totalCoverage}
          value={t.pills.days(dataset.metadata.days)}
        />

        <InfoPill
          label={t.pills.datasetRange}
          value={`${dataset.metadata.start_date} → ${dataset.metadata.end_date}`}
        />

        <InfoPill label={t.pills.lastVisibleDay} value={lastAvailableDate} />
      </section>

      <section className="top-panels">
        <article className="focus-panel">
          <div className="section-heading">
            <p className="eyebrow">{t.focus.eyebrow}</p>
            <h2>{t.focus.title}</h2>
          </div>

          <div className="focus-list">
            {focusItems.map((item, index) => (
              <div key={index} className={`focus-item focus-${item.tone}`}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="snapshot-panel">
          <div className="section-heading">
            <p className="eyebrow">{t.snapshot.eyebrow}</p>
            <h2>{t.snapshot.title}</h2>
          </div>

          <div className="snapshot-grid">
            <MiniStat
              label={t.snapshot.winRate}
              value={formatPercent(
                currentSummary.winRate,
                locale,
                t.misc.noData
              )}
              helper={t.snapshot.winRateHelper}
            />

            <MiniStat
              label={t.snapshot.responseTime}
              value={`${formatNumber(
                currentSummary.avgResponseTime,
                locale,
                t.misc.noData
              )} ${t.misc.minutes}`}
              helper={t.snapshot.responseTimeHelper}
            />

            <MiniStat
              label={t.snapshot.staleDeals}
              value={formatNumber(
                currentSummary.staleDeals,
                locale,
                t.misc.noData
              )}
              helper={t.snapshot.staleDealsHelper}
            />

            <MiniStat
              label={t.snapshot.bottleneck}
              value={weakestStep ? weakestStep.label : t.snapshot.noData}
              helper={
                weakestStep
                  ? t.snapshot.conversion(
                      formatPercent(weakestStep.value, locale, t.misc.noData)
                    )
                  : t.snapshot.unavailable
              }
            />
          </div>
        </article>
      </section>

      <section className="kpi-grid">
        <KpiCard
          title={t.kpis.leadsCreated.title}
          description={t.kpis.leadsCreated.description}
          value={formatNumber(
            currentSummary.leadsCreated,
            locale,
            t.misc.noData
          )}
          change={calculateChange(
            currentSummary.leadsCreated,
            previousSummary.leadsCreated
          )}
          direction={metricDirections["leads_created"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.leadsQualified.title}
          description={t.kpis.leadsQualified.description}
          value={formatNumber(
            currentSummary.leadsQualified,
            locale,
            t.misc.noData
          )}
          change={calculateChange(
            currentSummary.leadsQualified,
            previousSummary.leadsQualified
          )}
          direction={metricDirections["leads_qualified"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.dealsWon.title}
          description={t.kpis.dealsWon.description}
          value={formatNumber(currentSummary.dealsWon, locale, t.misc.noData)}
          change={calculateChange(
            currentSummary.dealsWon,
            previousSummary.dealsWon
          )}
          direction={metricDirections["deals_won"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.winRate.title}
          description={t.kpis.winRate.description}
          value={formatPercent(currentSummary.winRate, locale, t.misc.noData)}
          change={calculateChange(
            currentSummary.winRate,
            previousSummary.winRate
          )}
          direction="higher_is_better"
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.responseTime.title}
          description={t.kpis.responseTime.description}
          value={`${formatNumber(
            currentSummary.avgResponseTime,
            locale,
            t.misc.noData
          )} ${t.misc.minutes}`}
          change={calculateChange(
            currentSummary.avgResponseTime,
            previousSummary.avgResponseTime
          )}
          direction={metricDirections["avg_response_time_min"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.staleDeals.title}
          description={t.kpis.staleDeals.description}
          value={formatNumber(
            currentSummary.staleDeals,
            locale,
            t.misc.noData
          )}
          change={calculateChange(
            currentSummary.staleDeals,
            previousSummary.staleDeals
          )}
          direction={metricDirections["stale_deals"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.supportTickets.title}
          description={t.kpis.supportTickets.description}
          value={formatNumber(
            currentSummary.supportTicketsOpened,
            locale,
            t.misc.noData
          )}
          change={calculateChange(
            currentSummary.supportTicketsOpened,
            previousSummary.supportTicketsOpened
          )}
          direction={metricDirections["support_tickets_opened"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />

        <KpiCard
          title={t.kpis.supportResolution.title}
          description={t.kpis.supportResolution.description}
          value={`${formatNumber(
            currentSummary.supportAvgResolution,
            locale,
            t.misc.noData
          )} ${t.misc.hours}`}
          change={calculateChange(
            currentSummary.supportAvgResolution,
            previousSummary.supportAvgResolution
          )}
          direction={metricDirections["support_avg_resolution_hours"]}
          vsText={t.misc.vsPrevious}
          emptyText={t.misc.noComparison}
          badgeLabels={t.badges}
          locale={locale}
        />
      </section>

      <section className="dashboard-grid">
        <article className="chart-card chart-card-wide">
          <div className="section-heading">
            <p className="eyebrow">{t.charts.trendEyebrow}</p>
            <h2>{t.charts.trendTitle}</h2>
            <p className="section-text">{t.charts.trendText}</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="leads"
                name={t.charts.leads}
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="qualified"
                name={t.charts.qualified}
                stroke="#16a34a"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="won"
                name={t.charts.won}
                stroke="#9333ea"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="lost"
                name={t.charts.lost}
                stroke="#dc2626"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <div className="section-heading">
            <p className="eyebrow">{t.charts.funnelEyebrow}</p>
            <h2>{t.charts.funnelTitle}</h2>
            <p className="section-text">{t.charts.funnelText}</p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                name={t.charts.total}
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="funnel-rates">
            <span>
              {t.funnel.trafficToLead}:{" "}
              {formatPercent(
                funnelRates.trafficToLead,
                locale,
                t.misc.noData
              )}
            </span>
            <span>
              {t.funnel.leadToQualified}:{" "}
              {formatPercent(
                funnelRates.leadToQualified,
                locale,
                t.misc.noData
              )}
            </span>
            <span>
              {t.funnel.qualifiedToDeal}:{" "}
              {formatPercent(
                funnelRates.qualifiedToDeal,
                locale,
                t.misc.noData
              )}
            </span>
            <span>
              {t.funnel.dealToWon}:{" "}
              {formatPercent(funnelRates.dealToWon, locale, t.misc.noData)}
            </span>
          </div>
        </article>

        <article className="chart-card">
          <div className="section-heading">
            <p className="eyebrow">{t.charts.responseEyebrow}</p>
            <h2>{t.charts.responseTitle}</h2>
            <p className="section-text">{t.charts.responseText}</p>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="responseTime"
                name={t.charts.responseName}
                stroke="#f97316"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <div className="section-heading">
            <p className="eyebrow">{t.charts.supportEyebrow}</p>
            <h2>{t.charts.supportTitle}</h2>
            <p className="section-text">{t.charts.supportText}</p>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="tickets"
                name={t.charts.tickets}
                fill="#0f766e"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}

interface InfoPillProps {
  label: string;
  value: string;
}

function InfoPill({ label, value }: InfoPillProps) {
  return (
    <article className="info-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  helper: string;
}

function MiniStat({ label, value, helper }: MiniStatProps) {
  return (
    <article className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

interface KpiCardProps {
  title: string;
  description: string;
  value: string;
  change: number | null;
  direction?: MetricDirection;
  vsText: string;
  emptyText: string;
  badgeLabels: {
    improves: string;
    worsens: string;
    stable: string;
    noData: string;
  };
  locale: string;
}

function KpiCard({
  title,
  description,
  value,
  change,
  direction = "higher_is_better",
  vsText,
  emptyText,
  badgeLabels,
  locale,
}: KpiCardProps) {
  const tone = getChangeTone(change, direction);
  const changeText = formatChange(change, emptyText, locale);
  const badgeText = getBadgeText(change, direction, badgeLabels);

  return (
    <article className={`kpi-card kpi-${tone}`}>
      <div className="kpi-top">
        <div>
          <p className="kpi-title">{title}</p>
          <small>{description}</small>
        </div>

        <span className={`status-badge badge-${tone}`}>{badgeText}</span>
      </div>

      <strong className="kpi-value">{value}</strong>
      <span className="kpi-change">
        {vsText}: {changeText}
      </span>
    </article>
  );
}

function getChangeTone(
  change: number | null,
  direction: MetricDirection
): Tone {
  if (change === null || change === 0) return "neutral";

  const isImprovement =
    direction === "higher_is_better" ? change > 0 : change < 0;

  return isImprovement ? "good" : "bad";
}

function getBadgeText(
  change: number | null,
  direction: MetricDirection,
  labels: {
    improves: string;
    worsens: string;
    stable: string;
    noData: string;
  }
): string {
  if (change === null) return labels.noData;
  if (change === 0) return labels.stable;

  const tone = getChangeTone(change, direction);

  if (tone === "good") return labels.improves;
  if (tone === "bad") return labels.worsens;

  return labels.stable;
}

export default App;