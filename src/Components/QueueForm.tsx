import type { QueueInput, QueueModel } from '../models/queue.types'

interface QueueFormProps {
  input: QueueInput
  onChange: (input: QueueInput) => void
}

const models: Array<{
  id: QueueModel
  label: string
  description: string
}> = [
  { id: 'MM1', label: 'M/M/1', description: 'Un servidor con llegadas y servicios exponenciales.' },
  { id: 'MMS', label: 'M/M/s', description: 'Varios servidores identicos en paralelo.' },
  { id: 'MG1', label: 'M/G/1', description: 'Un servidor con servicio de varianza general.' },
  { id: 'MD1', label: 'M/D/1', description: 'Un servidor con servicio deterministico.' },
]

export function QueueForm({ input, onChange }: QueueFormProps) {
  const updateField = (field: keyof QueueInput, value: number | QueueModel) => {
    onChange({
      ...input,
      [field]: value,
    })
  }

  return (
    <form className="config-panel" onSubmit={(event) => event.preventDefault()}>
      <div className="section-heading">
        <span>01</span>
        <div>
          <h2>Modelo</h2>
          <p>Selecciona la estructura del sistema que quieres evaluar.</p>
        </div>
      </div>

      <div className="model-grid" role="radiogroup" aria-label="Modelo de cola">
        {models.map((model) => (
          <button
            className={input.model === model.id ? 'model-option active' : 'model-option'}
            key={model.id}
            onClick={() => updateField('model', model.id)}
            type="button"
            role="radio"
            aria-checked={input.model === model.id}
          >
            <strong>{model.label}</strong>
            <span>{model.description}</span>
          </button>
        ))}
      </div>

      <div className="section-heading">
        <span>02</span>
        <div>
          <h2>Parametros</h2>
          <p>Usa la misma unidad de tiempo para lambda y mu.</p>
        </div>
      </div>

      <div className="field-grid">
        <NumberField
          label="Tasa de llegada lambda"
          min={0.01}
          step={0.01}
          value={input.lambda}
          onChange={(value) => updateField('lambda', value)}
        />
        <NumberField
          label="Tasa de servicio mu"
          min={0.01}
          step={0.01}
          value={input.mu}
          onChange={(value) => updateField('mu', value)}
        />
        {(input.model === 'MMS' || input.model === 'MD1') && (
          <NumberField
            label="Servidores"
            min={1}
            step={1}
            value={input.s ?? 1}
            onChange={(value) => updateField('s', Math.max(1, Math.round(value)))}
          />
        )}
        {input.model === 'MG1' && (
          <NumberField
            label="Varianza del servicio"
            min={0}
            step={0.001}
            value={input.sigma2 ?? 0}
            onChange={(value) => updateField('sigma2', value)}
          />
        )}
      </div>
    </form>
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
