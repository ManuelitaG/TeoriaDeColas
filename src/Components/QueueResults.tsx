import type { QueueInput, QueueResult } from '../models/queue.types'

interface QueueResultsProps {
  input: QueueInput
  result: QueueResult | null
  validation: string
}

export function QueueResults({ input, result, validation }: QueueResultsProps) {
  if (validation || !result) {
    return (
      <section className="results-panel">
        <div className="section-heading">
          <span>03</span>
          <div>
            <h2>Resultados</h2>
            <p>Corrige los parametros para calcular el sistema.</p>
          </div>
        </div>
        <div className="empty-state">
          <strong>Sistema sin solucion estable</strong>
          <p>{validation || 'No se pudo calcular el modelo seleccionado.'}</p>
        </div>
      </section>
    )
  }

  const metrics = [
    { label: 'Utilizacion', value: result.rho, suffix: '', mode: 'percent', showDecimal: true },
    { label: 'P0 sin clientes', value: result.p0, suffix: '', mode: 'percent', showDecimal: true },
    { label: 'Lq cola', value: result.Lq, suffix: ' clientes', mode: 'decimal' },
    { label: 'Lq cola Redondeado', value: result.LqRounded, suffix: ' clientes', mode: 'decimal' },
    { label: 'L sistema', value: result.L, suffix: ' clientes', mode: 'decimal' },
    { label: 'L sistema Redondeado', value: result.LRounded, suffix: ' clientes', mode: 'decimal' },
    { label: 'Wq espera', value: result.Wq, suffix: ' tiempo', mode: 'decimal' },
    { label: 'W total', value: result.W, suffix: ' tiempo', mode: 'decimal' },
  ]

  const costMetrics = result.cost
    ? [
        { label: 'Costo servicio por hora', value: result.cost.serviceCost, suffix: '', mode: 'currency' },
        { label: 'Costo espera por hora', value: result.cost.waitingCost, suffix: '', mode: 'currency' },
        { label: 'Costo total estimado', value: result.cost.totalCost, suffix: '', mode: 'currency' },
      ]
    : []

  return (
    <section className="results-panel">
      <div className="section-heading">
        <span>03</span>
        <div>
          <h2>Resultados</h2>
          <p>Metricas calculadas para el modelo {input.model}.</p>
        </div>
      </div>

      <div className="stability-banner">
        <span className="status-dot" />
        <div>
          <strong>Sistema estable</strong>
          <p>La capacidad de servicio supera la tasa de llegada.</p>
        </div>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.mode === 'percent'
                ? `${formatNumber(metric.value)}`
                : `${formatNumber(metric.value)}${metric.suffix}`}
            </strong>
            {metric.showDecimal && (
              <small>Porcentaje: {formatNumber(metric.value * 100)}%</small>
            )}
          </article>
        ))}
      </div>

      {costMetrics.length > 0 && (
        <div className="cost-section">
          <div className="section-heading">
            <span>04</span>
            <div>
              <h2>Costos estimados</h2>
              <p>Costo por servicio, espera y total calculados a partir del modelo.</p>
            </div>
          </div>
          <div className="metric-grid cost-grid">
            {costMetrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.mode === 'currency' ? formatCurrency(metric.value) : `${formatNumber(metric.value)}${metric.suffix}`}</strong>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}
