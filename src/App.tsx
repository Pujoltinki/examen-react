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
import { MetricsJson, Dataset } from "./types/metrics";
import {
  calculateChange,
  calculateSummary,
  formatChange,
  formatNumber,
  formatPercent,
  safeRate,
} from "./utils/metrics";

function App() {
  const [data, setData] = useState<MetricsJson | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string>("A");
  const [rangeDays, setRangeDays] = useState<number>(7);
  const [error, setError] = useState<string>("");

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

  const currentSummary = useMemo(() => calculateSummary(currentDays), [currentDays]);
  const previousSummary = useMemo(() => calculateSummary(previousDays), [previousDays]);

  const funnelData = useMemo(() => {
    return [
      {
        name: "Tráfico",
        value: currentSummary.traffic,
      },
      {
        name: "Leads",
        value: currentSummary.leadsCreated,
      },
      {
        name: "Calificados",
        value: currentSummary.leadsQualified,
      },
      {
        name: "Deals",
        value: currentSummary.dealsCreated,
      },
      {
        name: "Ganados",
        value: currentSummary.dealsWon,
      },
    ];
  }, [currentSummary]);

  const funnelRates = useMemo(() => {
    return {
      trafficToLead: safeRate(currentSummary.leadsCreated, currentSummary.traffic),
      leadToQualified: safeRate(currentSummary.leadsQualified, currentSummary.leadsCreated),
      qualifiedToDeal: safeRate(currentSummary.dealsCreated, currentSummary.leadsQualified),
      dealToWon: safeRate(currentSummary.dealsWon, currentSummary.dealsCreated),
    };
  }, [currentSummary]);

  const focusMessages = useMemo(() => {
    const messages: string[] = [];

    const winRateChange = calculateChange(currentSummary.winRate, previousSummary.winRate);
    const responseChange = calculateChange(
      currentSummary.avgResponseTime,
      previousSummary.avgResponseTime
    );
    const staleChange = calculateChange(currentSummary.staleDeals, previousSummary.staleDeals);
    const supportChange = calculateChange(
      currentSummary.supportAvgResolution,
      previousSummary.supportAvgResolution
    );

    if (responseChange !== null && responseChange > 0) {
      messages.push(
        "Revisar velocidad de contacto: el tiempo promedio de respuesta subió frente al período anterior."
      );
    }

    if (winRateChange !== null && winRateChange < 0) {
      messages.push(
        "Revisar calidad de cierre: la tasa de victoria bajó, por lo que conviene revisar deals perdidos y argumentos comerciales."
      );
    }

    if (staleChange !== null && staleChange > 0) {
      messages.push(
        "Priorizar oportunidades antiguas: aumentaron los stale deals y pueden estar bloqueando pipeline."
      );
    }

    if (supportChange !== null && supportChange > 0) {
      messages.push(
        "Revisar soporte: el tiempo promedio de resolución aumentó y puede afectar experiencia de clientes."
      );
    }

    const rates = [
      { label: "visitas a leads", value: funnelRates.trafficToLead },
      { label: "leads a calificados", value: funnelRates.leadToQualified },
      { label: "calificados a deals", value: funnelRates.qualifiedToDeal },
      { label: "deals a ganados", value: funnelRates.dealToWon },
    ].filter((item) => item.value !== null) as { label: string; value: number }[];

    if (rates.length > 0) {
      const weakestRate = rates.reduce((lowest, current) =>
        current.value < lowest.value ? current : lowest
      );

      messages.push(
        `Cuello de botella principal del embudo: conversión de ${weakestRate.label} (${formatPercent(
          weakestRate.value
        )}).`
      );
    }

    if (messages.length === 0) {
      messages.push(
        "No se detectan alertas fuertes en el período. Mantener seguimiento de ventas, respuesta comercial y soporte."
      );
    }

    return messages.slice(0, 4);
  }, [currentSummary, previousSummary, funnelRates]);

  if (error) {
    return (
      <main className="app">
        <section className="error-card">
          <h1>Error al cargar datos</h1>
          <p>{error}</p>
          <p>
            Revisa que el archivo <strong>metrics.json</strong> esté dentro de la carpeta{" "}
            <strong>public</strong>.
          </p>
        </section>
      </main>
    );
  }

  if (!data || !dataset) {
    return (
      <main className="app">
        <p>Cargando reporte ejecutivo...</p>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Reporte ejecutivo B2B SaaS</p>
          <h1>Foco comercial y atención al cliente</h1>
          <p className="subtitle">
            Vista rápida para decidir dónde poner foco hoy: ventas, pipeline, tiempos de respuesta y
            soporte.
          </p>
        </div>

        <div className="controls">
          <label>
            Dataset
            <select
              value={selectedDataset}
              onChange={(event) => setSelectedDataset(event.target.value)}
            >
              {Object.keys(data).map((key) => (
                <option key={key} value={key}>
                  Dataset {key}
                </option>
              ))}
            </select>
          </label>

          <label>
            Período
            <select
              value={rangeDays}
              onChange={(event) => setRangeDays(Number(event.target.value))}
            >
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>
          </label>
        </div>
      </header>

      <section className="focus-panel">
        <div>
          <p className="eyebrow">Prioridades de hoy</p>
          <h2>Qué debería mirar primero el jefe de ventas</h2>
        </div>

        <ul>
          {focusMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Leads creados"
          value={formatNumber(currentSummary.leadsCreated)}
          change={formatChange(
            calculateChange(currentSummary.leadsCreated, previousSummary.leadsCreated)
          )}
        />

        <KpiCard
          title="Leads calificados"
          value={formatNumber(currentSummary.leadsQualified)}
          change={formatChange(
            calculateChange(currentSummary.leadsQualified, previousSummary.leadsQualified)
          )}
        />

        <KpiCard
          title="Deals ganados"
          value={formatNumber(currentSummary.dealsWon)}
          change={formatChange(calculateChange(currentSummary.dealsWon, previousSummary.dealsWon))}
        />

        <KpiCard
          title="Win rate"
          value={formatPercent(currentSummary.winRate)}
          change={formatChange(calculateChange(currentSummary.winRate, previousSummary.winRate))}
        />

        <KpiCard
          title="Tiempo respuesta"
          value={`${formatNumber(currentSummary.avgResponseTime)} min`}
          change={formatChange(
            calculateChange(currentSummary.avgResponseTime, previousSummary.avgResponseTime)
          )}
        />

        <KpiCard
          title="Stale deals"
          value={formatNumber(currentSummary.staleDeals)}
          change={formatChange(calculateChange(currentSummary.staleDeals, previousSummary.staleDeals))}
        />

        <KpiCard
          title="Tickets soporte"
          value={formatNumber(currentSummary.supportTicketsOpened)}
          change={formatChange(
            calculateChange(
              currentSummary.supportTicketsOpened,
              previousSummary.supportTicketsOpened
            )
          )}
        />

        <KpiCard
          title="Resolución soporte"
          value={`${formatNumber(currentSummary.supportAvgResolution)} h`}
          change={formatChange(
            calculateChange(
              currentSummary.supportAvgResolution,
              previousSummary.supportAvgResolution
            )
          )}
        />
      </section>

      <section className="dashboard-grid">
        <article className="chart-card">
          <div className="card-header">
            <h2>Tendencia comercial últimos 30 días</h2>
            <p>Leads, calificados, deals ganados y perdidos.</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#2563eb" />
              <Line type="monotone" dataKey="qualified" name="Calificados" stroke="#16a34a" />
              <Line type="monotone" dataKey="won" name="Ganados" stroke="#9333ea" />
              <Line type="monotone" dataKey="lost" name="Perdidos" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <div className="card-header">
            <h2>Embudo del período</h2>
            <p>Resumen de conversión desde tráfico hasta deals ganados.</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Total" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>

          <div className="funnel-rates">
            <span>Visitas → Leads: {formatPercent(funnelRates.trafficToLead)}</span>
            <span>Leads → Calificados: {formatPercent(funnelRates.leadToQualified)}</span>
            <span>Calificados → Deals: {formatPercent(funnelRates.qualifiedToDeal)}</span>
            <span>Deals → Ganados: {formatPercent(funnelRates.dealToWon)}</span>
          </div>
        </article>

        <article className="chart-card">
          <div className="card-header">
            <h2>Respuesta comercial</h2>
            <p>Tiempo promedio hasta primer contacto.</p>
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
                name="Tiempo respuesta"
                stroke="#f97316"
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <div className="card-header">
            <h2>Soporte</h2>
            <p>Tickets abiertos por día.</p>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tickets" name="Tickets" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </main>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
}

function KpiCard({ title, value, change }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>vs período anterior: {change}</span>
    </article>
  );
}

export default App;