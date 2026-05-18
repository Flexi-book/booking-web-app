import { useState, useEffect, useCallback } from 'react'
import { History, RefreshCw, LogIn, LogOut, UserPlus, ShieldAlert, Chrome } from 'lucide-react'
import { auditoriaApi } from '../../services/auditoriaService'
import { Button } from '../ui/button'

const ACTION_CONFIG = {
  LOGIN:        { label: 'Inicio de sesión',  icon: LogIn,      color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  LOGIN_FAILED: { label: 'Login fallido',      icon: ShieldAlert, color: 'text-red-600 bg-red-50 border-red-200' },
  REGISTER:     { label: 'Registro',           icon: UserPlus,   color: 'text-blue-600 bg-blue-50 border-blue-200' },
  GOOGLE_LOGIN: { label: 'Login con Google',   icon: Chrome,     color: 'text-violet-600 bg-violet-50 border-violet-200' },
  LOGOUT:       { label: 'Cierre de sesión',   icon: LogOut,     color: 'text-slate-600 bg-slate-100 border-slate-200' },
}

function formatFecha(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('es-CL', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function AuditEntry({ entry }) {
  const cfg = ACTION_CONFIG[entry.action] || {
    label: entry.action,
    icon: History,
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  }
  const Icon = cfg.icon

  return (
    <div className="flex gap-4 group">
      {/* línea del timeline */}
      <div className="flex flex-col items-center">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shrink-0 ${cfg.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="w-px flex-1 bg-slate-200 mt-1 group-last:hidden" />
      </div>

      {/* contenido */}
      <div className="pb-6 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">{cfg.label}</span>
          <span className="text-xs text-slate-400 shrink-0">{formatFecha(entry.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 truncate">{entry.userEmail || '—'}</p>
        {entry.details && (
          <p className="text-xs text-slate-400 mt-1 italic">{entry.details}</p>
        )}
        {entry.ipAddress && (
          <p className="text-xs text-slate-300 mt-0.5">IP: {entry.ipAddress}</p>
        )}
      </div>
    </div>
  )
}

export default function TimelinePanel() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('TODOS')

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await auditoriaApi.obtenerLogs()
      setLogs(Array.isArray(data) ? data : [])
    } catch {
      setError('No se pudo cargar el historial de actividad.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const actionOptions = ['TODOS', ...Object.keys(ACTION_CONFIG)]

  const logsFiltrados = filter === 'TODOS'
    ? logs
    : logs.filter(l => l.action === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de Actividad</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro de acciones de usuarios en el sistema
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={cargar} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {actionOptions.map(opt => {
          const cfg = ACTION_CONFIG[opt]
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === opt
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {cfg ? cfg.label : 'Todos'}
            </button>
          )
        })}
      </div>

      {/* Estado de error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {loading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && logsFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <History className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">No hay registros de actividad aún.</p>
            <p className="text-xs">Las acciones de login y registro aparecerán aquí.</p>
          </div>
        )}

        {!loading && logsFiltrados.length > 0 && (
          <div className="pt-2">
            {logsFiltrados.map((entry) => (
              <AuditEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Contador */}
      {!loading && logsFiltrados.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          {logsFiltrados.length} {logsFiltrados.length === 1 ? 'registro' : 'registros'}
          {filter !== 'TODOS' && ` de tipo "${ACTION_CONFIG[filter]?.label}"`}
        </p>
      )}
    </div>
  )
}
