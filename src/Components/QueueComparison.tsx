import { useMemo, useState } from 'react'
import type { QueueResult } from '../models/queue.types'
import { calculateMM1 } from '../services/queue/mm1'
import { calculateMMS } from '../services/queue/mms'

interface ComparisonInput {
  lambda: number
  mu: number
  maxServers: number
}

interface ComparisonOption {
  label: string
  servers: number
  result: QueueResult | null
  validation: string
}

const initialComparison: ComparisonInput = {
  lambda: 8,
  mu: 12,
  maxServers: 4,
}

export function QueueComparison() {
  const [input, setInput] = useState(initialComparison)

  const comparison = useMemo(() => {
    const validation = validateInput(input)

    if (validation) {
      return {
        validation,
        options: [],
        winner: null,
      }
    }

    const options = buildOptions(input)
    const viableOptions = options.filter((option): option is ComparisonOption & { result: QueueResult } =>
      Boolean(option.result),
    )
    const winner = viableOptions.reduce<ComparisonOption | null>((best, option) => {
      if (!best?.result) return option

      return option.result.Wq < best.result.Wq ? option : best
    }, null)

    return {
      validation: '',
      options,
      winner,
    }
  }, [input])

  return (
    <section className="comparison-panel" aria-labelledby="comparison-title">
      <div className="section-heading">
        <span>04</span>
        <div>
          <h2 id="comparison-title">Comparacion M/M/1 vs M/M/s</h2>
          <p>Compara M/M/1 contra todas las opciones M/M/s hasta el tope de servidores.</p>
        </div>
      </div>

      <div className="comparison-controls single-control">
        <div className="comparison-model">
          <h3>Parametros de comparacion</h3>
          <div className="field-grid">
            <NumberField
              label="Lambda"
              min={0.01}
              step={0.01}
              value={input.lambda}
              onChange={(lambda) => setInput((current) => ({ ...current, lambda }))}
            />
            <NumberField
              label="Mu"
              min={0.01}
              step={0.01}
              value={input.mu}
              onChange={(mu) => setInput((current) => ({ ...current, mu }))}
            />
            <NumberField
              label="Tope de servidores"
              min={1}
              step={1}
              value={input.maxServers}
              onChange={(maxServers) =>
                setInput((current) => ({ ...current, maxServers: Math.max(1, Math.round(maxServers)) }))
              }
            />
          </div>
        </div>
      </div>

      {comparison.validation ? (
        <div className="empty-state">
          <strong>Comparacion no disponible</strong>
          <p>{comparison.validation}</p>
        </div>
      ) : (
        <>
          <div className="comparison-winner">
            <span>Modelo mas optimo</span>
            <strong>{comparison.winner?.label ?? 'Sin opciones viables'}</strong>
            <p>
              {comparison.winner?.result
                ? `Criterio: menor Wq (${formatNumber(comparison.winner.result.Wq)}).`
                : 'Ninguna opcion es estable con los parametros ingresados.'}
            </p>
          </div>

          <div className="comparison-table" role="table" aria-label="Comparacion por cantidad de servidores">
            <div className="comparison-row comparison-row-wide header" role="row">
              <span role="columnheader">Modelo</span>
              <span role="columnheader">Estado</span>
              <span role="columnheader">Utilizacion</span>
              <span role="columnheader">Lq</span>
              <span role="columnheader">Lq Redondeado</span>
              <span role="columnheader">Wq</span>
              <span role="columnheader">W</span>
            </div>
            {comparison.options.map((option) => (
              <ComparisonOptionRow
                key={option.label}
                option={option}
                winnerLabel={comparison.winner?.label}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function ComparisonOptionRow({
  option,
  winnerLabel,
}: {
  option: ComparisonOption
  winnerLabel?: string
}) {
  const isWinner = option.label === winnerLabel

  return (
    <div className={isWinner ? 'comparison-row comparison-row-wide winner-row' : 'comparison-row comparison-row-wide'} role="row">
      <span role="cell">{option.label}</span>
      <strong className={option.result ? 'status-text stable' : 'status-text'} role="cell">
        {option.result ? 'Viable' : 'No viable'}
      </strong>
      <strong role="cell">{option.result ? formatMetric(option.result.rho, 'percent') : '-'}</strong>
      <strong role="cell">{option.result ? formatNumber(option.result.Lq) : '-'}</strong>
      <strong role="cell">{option.result ? formatNumber(option.result.LqRounded) : '-'}</strong>
      <strong role="cell">{option.result ? formatNumber(option.result.Wq) : '-'}</strong>
      <strong role="cell">{option.result ? formatNumber(option.result.W) : '-'}</strong>
      {!option.result && <small>{option.validation}</small>}
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

function validateInput(input: ComparisonInput) {
  if (input.lambda <= 0 || input.mu <= 0) {
    return 'Lambda y mu deben ser mayores que cero.'
  }

  if (input.maxServers < 1) {
    return 'El tope de servidores debe ser al menos 1.'
  }

  return ''
}

function buildOptions(input: ComparisonInput): ComparisonOption[] {
  return Array.from({ length: input.maxServers }, (_, index) => {
    const servers = index + 1
    const label = servers === 1 ? 'M/M/1' : `M/M/${servers}`
    const validation = getStabilityValidation(input, servers)

    if (validation) {
      return {
        label,
        servers,
        result: null,
        validation,
      }
    }

    return {
      label,
      servers,
      result: servers === 1
        ? calculateMM1({ model: 'MM1', lambda: input.lambda, mu: input.mu })
        : calculateMMS({ model: 'MMS', lambda: input.lambda, mu: input.mu, s: servers }),
      validation: '',
    }
  })
}

function getStabilityValidation(input: ComparisonInput, servers: number) {
  const capacity = servers * input.mu

  if (input.lambda >= capacity) {
    return `No estable: lambda debe ser menor que ${formatNumber(capacity)}.`
  }

  return ''
}

function formatMetric(value: number, mode: 'percent' | 'decimal' = 'decimal') {
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
