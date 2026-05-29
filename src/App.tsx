import { useMemo, useState } from 'react'
import './App.css'
import { QueueForm } from './Components/QueueForm'
import { QueueComparison } from './Components/QueueComparison'
import { QueueResults } from './Components/QueueResults'
import { QueueSummary } from './Components/QueueSummary'
import type { QueueInput } from './models/queue.types'
import { calculateQueue } from './services/queue/queue.service'

type AppModule = 'single' | 'comparison'

const initialInput: QueueInput = {
  model: 'MM1',
  lambda: 8,
  mu: 12,
  s: 2,
  sigma2: 0.01,
  serviceCostPerHour: 0,
  waitingCostPerHour: 0,
}

function App() {
  const [input, setInput] = useState<QueueInput>(initialInput)
  const [activeModule, setActiveModule] = useState<AppModule>('single')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const validation = useMemo(() => {
    const servers = input.model === 'MMS' || input.model === 'MD1' ? input.s ?? 1 : 1
    const capacity = servers * input.mu

    if (input.lambda <= 0 || input.mu <= 0) {
      return 'Las tasas de llegada y servicio deben ser mayores que cero.'
    }

    if ((input.model === 'MMS' || input.model === 'MD1') && (!input.s || input.s < 1)) {
      return 'El numero de servidores debe ser al menos 1.'
    }

    if (input.model === 'MG1' && (input.sigma2 ?? 0) < 0) {
      return 'La varianza del servicio no puede ser negativa.'
    }

    if (input.serviceCostPerHour < 0 || input.waitingCostPerHour < 0) {
      return 'Los costos deben ser valores mayores o iguales a cero.'
    }

    if (input.lambda >= capacity) {
      return `El sistema no es estable: datos no validos.`
    }

    return ''
  }, [input])

  const result = useMemo(() => {
    if (validation) return null

    try {
      return calculateQueue(input)
    } catch {
      return null
    }
  }, [input, validation])

  return (
    <div className={sidebarCollapsed ? 'app-frame sidebar-collapsed' : 'app-frame'}>
      <aside className="app-sidebar" aria-label="Modulos">
        <div className="sidebar-top">
          <button
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((current) => !current)}
            type="button"
          >
            {sidebarCollapsed ? '>' : '<'}
          </button>
          <div className="brand-block">
            <p className="eyebrow">Teoria de colas</p>  
            <span>TC</span>
          </div>
        </div>

        <nav className="module-nav" aria-label="Seleccion de modulo">
          <button
            className={activeModule === 'single' ? 'module-link active' : 'module-link'}
            onClick={() => setActiveModule('single')}
            title="Modelo unico"
            type="button"
          >
            <span>01</span>
            <strong>Modelo unico</strong>
            <small>M/M/1, M/M/s, M/G/1 o M/D/1</small>
          </button>
          <button
            className={activeModule === 'comparison' ? 'module-link active' : 'module-link'}
            onClick={() => setActiveModule('comparison')}
            title="Comparar MM1 y MMS"
            type="button"
          >
            <span>02</span>
            <strong>Comparar MM1 y MMS</strong>
            <small>Dos configuraciones frente a frente</small>
          </button>
        </nav>
      </aside>

      <main className="app-shell">
        <section
          className={activeModule === 'single' ? 'intro-panel' : 'intro-panel full'}
          aria-labelledby="app-title"
        >
          <div className="intro-copy">
            <p className="eyebrow">
              {activeModule === 'single' ? 'Modulo de modelo unico' : 'Modulo de comparacion'}
            </p>
            <h1 id="app-title">
              {activeModule === 'single' ? 'Analizador de sistemas de espera' : 'Comparador de modelos de cola'}
            </h1>
            <p>
              {activeModule === 'single'
                ? 'Calcula ocupacion, tiempos de espera y longitud esperada para modelos M/M/1, M/M/s, M/G/1 y M/D/1.'
                : 'Ingresa parametros independientes para M/M/1 y M/M/s para ver cual modelo resulta mas optimo.'}
            </p>
          </div>
          {activeModule === 'single' && (
            <QueueSummary input={input} result={result} validation={validation} />
          )}
        </section>

        {activeModule === 'single' ? (
          <section className="workspace" aria-label="Simulador de colas">
            <QueueForm input={input} onChange={setInput} />
            <QueueResults input={input} result={result} validation={validation} />
          </section>
        ) : (
          <QueueComparison />
        )}
      </main>
    </div>
  )
}

export default App
