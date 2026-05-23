import { useMemo, useState } from 'react'
import type { QueueResult } from '../models/queue.types'
import { calculateMM1 } from '../services/queue/mm1'
import { calculateMMS } from '../services/queue/mms'

interface MM1ComparisonInput {
  lambda: number
  mu: number
}

interface MMSComparisonInput extends MM1ComparisonInput {
  s: number
}

interface ComparisonRow {
  label: string
  mm1: number
  mms: number
  mode?: 'percent' | 'decimal'
  lowerIsBetter?: boolean
}

const initialMM1: MM1ComparisonInput = {
  lambda: 8,
  mu: 12,
}

const initialMMS: MMSComparisonInput = {
  lambda: 8,
  mu: 12,
  s: 2,
}

export function QueueComparison() {
  const [mm1Input, setMM1Input] = useState(initialMM1)
  const [mmsInput, setMMSInput] = useState(initialMMS)

  const comparison = useMemo(() => {
    const mm1Validation = validateMM1(mm1Input)
    const mmsValidation = validateMMS(mmsInput)

    if (mm1Validation || mmsValidation) {
      return {
        validation: mm1Validation || mmsValidation,
        mm1: null,
        mms: null,
      }
    }

    const mm1 = calculateMM1({ model: 'MM1', ...mm1Input })
    const mms = calculateMMS({ model: 'MMS', ...mmsInput })

    return {
      validation: '',
      mm1,
      mms,
    }
  }, [mm1Input, mmsInput])

  const winner = comparison.mm1 && comparison.mms ? getWinner(comparison.mm1, comparison.mms) : ''
  const rows = comparison.mm1 && comparison.mms ? buildComparisonRows(comparison.mm1, comparison.mms) : []

  return (
    <section className="comparison-panel" aria-labelledby="comparison-title">
      <div className="section-heading">
        <span>04</span>
        <div>
          <h2 id="comparison-title">Comparacion M/M/1 vs M/M/s</h2>
          <p>Configura cada modelo por separado y revisa cual resulta mas optimo.</p>
        </div>
      </div>

      <div className="comparison-controls">
        <ComparisonModelForm
          title="M/M/1"
          lambda={mm1Input.lambda}
          mu={mm1Input.mu}
          onLambdaChange={(lambda) => setMM1Input((current) => ({ ...current, lambda }))}
          onMuChange={(mu) => setMM1Input((current) => ({ ...current, mu }))}
        />
        <ComparisonModelForm
          title="M/M/s"
          lambda={mmsInput.lambda}
          mu={mmsInput.mu}
          servers={mmsInput.s}
          onLambdaChange={(lambda) => setMMSInput((current) => ({ ...current, lambda }))}
          onMuChange={(mu) => setMMSInput((current) => ({ ...current, mu }))}
          onServersChange={(s) => setMMSInput((current) => ({ ...current, s }))}
        />
      </div>

      {comparison.validation || !comparison.mm1 || !comparison.mms ? (
        <div className="empty-state">
          <strong>Comparacion no disponible</strong>
          <p>{comparison.validation || 'No se pudo calcular la comparacion.'}</p>
        </div>
      ) : (
        <>
          <div className="comparison-winner">
            <span>Modelo mas optimo</span>
            <strong>{winner}</strong>
            <p>Se decide por menor tiempo promedio de espera en cola (Wq).</p>
          </div>

          <div className="comparison-table" role="table" aria-label="Comparacion M/M/1 contra M/M/s">
            <div className="comparison-row header" role="row">
              <span role="columnheader">Metrica</span>
              <span role="columnheader">M/M/1</span>
              <span role="columnheader">M/M/s</span>
              <span role="columnheader">Mejor</span>
            </div>
            {rows.map((row) => (
              <ComparisonMetric key={row.label} row={row} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

interface ComparisonModelFormProps {
  title: string
  lambda: number
  mu: number
  servers?: number
  onLambdaChange: (value: number) => void
  onMuChange: (value: number) => void
  onServersChange?: (value: number) => void
}

function ComparisonModelForm({
  title,
  lambda,
  mu,
  servers,
  onLambdaChange,
  onMuChange,
  onServersChange,
}: ComparisonModelFormProps) {
  return (
    <div className="comparison-model">
      <h3>{title}</h3>
      <div className="field-grid">
        <NumberField label="Lambda" min={0.01} step={0.01} value={lambda} onChange={onLambdaChange} />
        <NumberField label="Mu" min={0.01} step={0.01} value={mu} onChange={onMuChange} />
        {onServersChange && (
          <NumberField
            label="Servidores"
            min={1}
            step={1}
            value={servers ?? 1}
            onChange={(value) => onServersChange(Math.max(1, Math.round(value)))}
          />
        )}
      </div>
    </div>
  )
}

function ComparisonMetric({ row }: { row: ComparisonRow }) {
  const winner = getMetricWinner(row)

  return (
    <div className="comparison-row" role="row">
      <span role="cell">{row.label}</span>
      <strong role="cell">{formatMetric(row.mm1, row.mode)}</strong>
      <strong role="cell">{formatMetric(row.mms, row.mode)}</strong>
      <span className={winner === 'Empate' ? 'comparison-delta' : 'comparison-delta improves'} role="cell">
        {winner}
      </span>
    </div>
  )
}

interface NumberFieldProps {
  label: string
  min: number
  step: number
  value: number
  onChange: (value: number) => void
}

function NumberField({ label, min, step, value, onChange }: NumberFieldProps) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <input
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={Number.isFinite(value) ? value : ''}
      />
    </label>
  )
}

function validateMM1(input: MM1ComparisonInput) {
  if (input.lambda <= 0 || input.mu <= 0) {
    return 'En M/M/1, lambda y mu deben ser mayores que cero.'
  }

  if (input.lambda >= input.mu) {
    return 'M/M/1 no es estable: lambda debe ser menor que mu.'
  }

  return ''
}

function validateMMS(input: MMSComparisonInput) {
  if (input.lambda <= 0 || input.mu <= 0) {
    return 'En M/M/s, lambda y mu deben ser mayores que cero.'
  }

  if (input.s < 1) {
    return 'En M/M/s, el numero de servidores debe ser al menos 1.'
  }

  if (input.lambda >= input.s * input.mu) {
    return `M/M/s no es estable: lambda debe ser menor que ${(input.s * input.mu).toFixed(2)}.`
  }

  return ''
}

function getWinner(mm1: QueueResult, mms: QueueResult) {
  if (mm1.Wq === mms.Wq) return 'Empate'

  return mm1.Wq < mms.Wq ? 'M/M/1' : 'M/M/s'
}

function getMetricWinner(row: ComparisonRow) {
  if (row.mm1 === row.mms) return 'Empate'

  if (row.lowerIsBetter) {
    return row.mm1 < row.mms ? 'M/M/1' : 'M/M/s'
  }

  return row.mm1 > row.mms ? 'M/M/1' : 'M/M/s'
}

function buildComparisonRows(mm1: QueueResult, mms: QueueResult): ComparisonRow[] {
  return [
    { label: 'Utilizacion', mm1: mm1.rho, mms: mms.rho, mode: 'percent', lowerIsBetter: true },
    { label: 'P0 sin clientes', mm1: mm1.p0, mms: mms.p0, mode: 'percent' },
    { label: 'Lq cola', mm1: mm1.Lq, mms: mms.Lq, lowerIsBetter: true },
    { label: 'L sistema', mm1: mm1.L, mms: mms.L, lowerIsBetter: true },
    { label: 'Wq espera', mm1: mm1.Wq, mms: mms.Wq, lowerIsBetter: true },
    { label: 'W total', mm1: mm1.W, mms: mms.W, lowerIsBetter: true },
  ]
}

function formatMetric(value: number, mode: ComparisonRow['mode'] = 'decimal') {
  if (mode === 'percent') {
    return `${formatNumber(value * 100)}%`
  }

  return formatNumber(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(value)
}
