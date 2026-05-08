export type Language = "es" | "en";

export const texts = {
  es: {
    language: {
      label: "Idioma",
      spanish: "Español",
      english: "Inglés",
    },
    header: {
      eyebrow: "Reporte ejecutivo B2B SaaS",
      title: "Ventas, flujo comercial y atención al cliente",
      subtitle:
        "Un resumen pensado para que el jefe de ventas entienda en pocos minutos qué está pasando y dónde conviene poner foco hoy.",
    },
    controls: {
      dataset: "Conjunto de datos",
      datasetOption: (key: string) => `Conjunto ${key}`,
      period: "Período",
      last7: "Últimos 7 días",
      last30: "Últimos 30 días",
      last90: "Últimos 90 días",
    },
    pills: {
      activeDataset: "Conjunto activo",
      analyzedPeriod: "Período analizado",
      totalCoverage: "Cobertura total",
      datasetRange: "Rango del conjunto",
      lastVisibleDay: "Último día visible",
      days: (value: number) => `${value} días`,
      periodValue: (value: number) => `Últimos ${value} días`,
    },
    focus: {
      eyebrow: "Prioridades de hoy",
      title: "Qué debería revisar primero",
      velocityTitle: "Velocidad comercial",
      velocityBody:
        "El tiempo promedio de respuesta empeoró. Conviene revisar tiempos de contacto a prospectos nuevos.",
      closingTitle: "Calidad de cierre",
      closingBody:
        "La tasa de cierre bajó frente al período anterior. Revisa oportunidades perdidas, objeciones y seguimiento comercial.",
      staleTitle: "Flujo comercial envejecido",
      staleBody:
        "Las oportunidades estancadas aumentaron. Hay ventas abiertas hace mucho tiempo que pueden estar trabando el flujo comercial.",
      supportTitle: "Experiencia de cliente",
      supportBody:
        "El tiempo de resolución de soporte subió. Esto podría afectar satisfacción y renovaciones.",
      bottleneckTitle: "Cuello de botella del embudo",
      bottleneckBody: (step: string, value: string) =>
        `${step} es hoy la etapa más débil del embudo (${value}).`,
      stableTitle: "Panorama estable",
      stableBody:
        "No se observan alertas fuertes en el período. Mantén seguimiento sobre ventas, tiempos de respuesta y soporte.",
    },
    snapshot: {
      eyebrow: "Lectura rápida",
      title: "Resumen del período",
      winRate: "Tasa de cierre",
      winRateHelper: "Oportunidades ganadas sobre oportunidades cerradas",
      responseTime: "Tiempo de respuesta",
      responseTimeHelper: "Primer contacto comercial",
      staleDeals: "Oportunidades estancadas",
      staleDealsHelper: "Oportunidades abiertas por más de 60 días",
      bottleneck: "Cuello del embudo",
      noData: "Sin datos",
      unavailable: "No disponible",
      conversion: (value: string) => `Conversión ${value}`,
    },
    kpis: {
      leadsCreated: {
        title: "Prospectos creados",
        description: "Captación bruta",
      },
      leadsQualified: {
        title: "Prospectos calificados",
        description: "Calidad del flujo comercial",
      },
      dealsWon: {
        title: "Oportunidades ganadas",
        description: "Cierres efectivos",
      },
      winRate: {
        title: "Tasa de cierre",
        description: "Ganadas / cerradas",
      },
      responseTime: {
        title: "Tiempo de respuesta",
        description: "Velocidad de contacto",
      },
      staleDeals: {
        title: "Oportunidades estancadas",
        description: "Flujo comercial envejecido",
      },
      supportTickets: {
        title: "Tickets de soporte",
        description: "Carga de atención",
      },
      supportResolution: {
        title: "Resolución de soporte",
        description: "Tiempo de atención",
      },
    },
    badges: {
      improves: "Mejora",
      worsens: "Empeora",
      stable: "Estable",
      noData: "Sin dato",
    },
    charts: {
      trendEyebrow: "Tendencia comercial",
      trendTitle: "Últimos 30 días",
      trendText:
        "Evolución de prospectos, prospectos calificados, oportunidades ganadas y perdidas.",
      leads: "Prospectos",
      qualified: "Calificados",
      won: "Ganadas",
      lost: "Perdidas",
      funnelEyebrow: "Embudo",
      funnelTitle: "Embudo del período",
      funnelText: "Conversión desde tráfico hasta oportunidades ganadas.",
      total: "Total",
      responseEyebrow: "Velocidad comercial",
      responseTitle: "Tiempo de respuesta",
      responseText:
        "Promedio de minutos desde la llegada del prospecto hasta el primer contacto.",
      responseName: "Tiempo de respuesta",
      supportEyebrow: "Atención al cliente",
      supportTitle: "Tickets de soporte",
      supportText: "Cantidad de tickets abiertos por día.",
      tickets: "Tickets",
    },
    funnel: {
      traffic: "Tráfico",
      leads: "Prospectos",
      qualified: "Calificados",
      deals: "Oportunidades",
      won: "Ganadas",
      trafficToLead: "Visitas → Prospectos",
      leadToQualified: "Prospectos → Calificados",
      qualifiedToDeal: "Calificados → Oportunidades",
      dealToWon: "Oportunidades → Ganadas",
    },
    misc: {
      loading: "Cargando reporte ejecutivo...",
      errorTitle: "Error al cargar datos",
      errorHelp:
        "Revisa que el archivo metrics.json esté dentro de la carpeta public.",
      vsPrevious: "vs período anterior",
      noComparison: "Sin comparación",
      noData: "Sin datos",
      minutes: "min",
      hours: "h",
    },
  },

  en: {
    language: {
      label: "Language",
      spanish: "Spanish",
      english: "English",
    },
    header: {
      eyebrow: "B2B SaaS Executive Report",
      title: "Sales, pipeline and customer support",
      subtitle:
        "A quick summary designed to help the Sales Manager understand what is happening and where to focus today.",
    },
    controls: {
      dataset: "Dataset",
      datasetOption: (key: string) => `Dataset ${key}`,
      period: "Period",
      last7: "Last 7 days",
      last30: "Last 30 days",
      last90: "Last 90 days",
    },
    pills: {
      activeDataset: "Active dataset",
      analyzedPeriod: "Analyzed period",
      totalCoverage: "Total coverage",
      datasetRange: "Dataset range",
      lastVisibleDay: "Last visible day",
      days: (value: number) => `${value} days`,
      periodValue: (value: number) => `Last ${value} days`,
    },
    focus: {
      eyebrow: "Today's priorities",
      title: "What to review first",
      velocityTitle: "Sales speed",
      velocityBody:
        "Average response time worsened. Review first-contact times for new leads.",
      closingTitle: "Closing quality",
      closingBody:
        "Win rate decreased compared with the previous period. Review lost deals, objections and follow-up quality.",
      staleTitle: "Aging pipeline",
      staleBody:
        "Stale deals increased. Long-open opportunities may be blocking the sales pipeline.",
      supportTitle: "Customer experience",
      supportBody:
        "Average support resolution time increased. This could affect satisfaction and renewals.",
      bottleneckTitle: "Funnel bottleneck",
      bottleneckBody: (step: string, value: string) =>
        `${step} is currently the weakest funnel stage (${value}).`,
      stableTitle: "Stable outlook",
      stableBody:
        "No major alerts were detected in the selected period. Keep monitoring sales, response time and support.",
    },
    snapshot: {
      eyebrow: "Quick read",
      title: "Period summary",
      winRate: "Win rate",
      winRateHelper: "Won deals over closed deals",
      responseTime: "Response time",
      responseTimeHelper: "First sales contact",
      staleDeals: "Stale deals",
      staleDealsHelper: "Open deals older than 60 days",
      bottleneck: "Funnel bottleneck",
      noData: "No data",
      unavailable: "Unavailable",
      conversion: (value: string) => `Conversion ${value}`,
    },
    kpis: {
      leadsCreated: {
        title: "Leads created",
        description: "Gross acquisition",
      },
      leadsQualified: {
        title: "Qualified leads",
        description: "Pipeline quality",
      },
      dealsWon: {
        title: "Deals won",
        description: "Successful closes",
      },
      winRate: {
        title: "Win rate",
        description: "Won / closed",
      },
      responseTime: {
        title: "Response time",
        description: "Contact speed",
      },
      staleDeals: {
        title: "Stale deals",
        description: "Aging pipeline",
      },
      supportTickets: {
        title: "Support tickets",
        description: "Support workload",
      },
      supportResolution: {
        title: "Support resolution",
        description: "Resolution time",
      },
    },
    badges: {
      improves: "Improves",
      worsens: "Worsens",
      stable: "Stable",
      noData: "No data",
    },
    charts: {
      trendEyebrow: "Sales trend",
      trendTitle: "Last 30 days",
      trendText:
        "Evolution of leads, qualified leads, deals won and deals lost.",
      leads: "Leads",
      qualified: "Qualified",
      won: "Won",
      lost: "Lost",
      funnelEyebrow: "Funnel",
      funnelTitle: "Period funnel",
      funnelText: "Conversion from traffic to deals won.",
      total: "Total",
      responseEyebrow: "Sales speed",
      responseTitle: "Response time",
      responseText:
        "Average minutes from lead arrival to first sales contact.",
      responseName: "Response time",
      supportEyebrow: "Customer support",
      supportTitle: "Support tickets",
      supportText: "Number of support tickets opened per day.",
      tickets: "Tickets",
    },
    funnel: {
      traffic: "Traffic",
      leads: "Leads",
      qualified: "Qualified",
      deals: "Deals",
      won: "Won",
      trafficToLead: "Traffic → Leads",
      leadToQualified: "Leads → Qualified",
      qualifiedToDeal: "Qualified → Deals",
      dealToWon: "Deals → Won",
    },
    misc: {
      loading: "Loading executive report...",
      errorTitle: "Error loading data",
      errorHelp:
        "Check that the metrics.json file is inside the public folder.",
      vsPrevious: "vs previous period",
      noComparison: "No comparison",
      noData: "No data",
      minutes: "min",
      hours: "h",
    },
  },
};