import type { QueueInput, QueueResult } from '../models/queue.types'

interface QueueSummaryProps {
  input: QueueInput
  result: QueueResult | null
  validation: string
}

export function QueueSummary({ input, result, validation }: QueueSummaryProps) {
  const servers = input.model === 'MMS' || input.model === 'MD1' ? input.s ?? 1 : 1
  const capacity = servers * input.mu
  const load = capacity > 0 ? Math.min((input.lambda / capacity) * 100, 100) : 0

  return (
    <aside className="summary-panel" aria-label="Resumen del sistema">
      <div className="summary-stat">
        <span>Modelo activo</span>
        <strong>{input.model}</strong>
      </div>
      <div className="capacity-meter">
        <div>
          <span>Carga estimada</span>
          <strong>{load.toFixed(1)}%</strong>
        </div>
        <progress max="100" value={load} />
      </div>
      <p className={validation ? 'summary-note warning' : 'summary-note'}>
        {validation || `Probabilidad de sistema vacio: ${((result?.p0 ?? 0) * 100).toFixed(2)}%`}
      </p>
    </aside>
  )
}
