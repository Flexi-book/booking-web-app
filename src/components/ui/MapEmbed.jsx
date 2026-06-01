import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, Loader2, LocateFixed } from 'lucide-react'

/* ──────────────────────────────────────────────────────────────────────
   CSS del marcador azul animado — inyectado una vez
   ────────────────────────────────────────────────────────────────────── */
const MARKER_CSS = `
  .fb-marker-wrap {
    position: relative;
    width: 32px;
    height: 32px;
  }
  .fb-marker-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(37,99,235,0.25);
    animation: fb-pulse 2s ease-out infinite;
  }
  .fb-marker-dot {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    width: 14px; height: 14px;
    background: #2563eb;
    border: 2.5px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(37,99,235,0.5);
  }
  @keyframes fb-pulse {
    0%   { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0; }
  }
`

let cssInjected = false
function injectCSS() {
  if (cssInjected) return
  const s = document.createElement('style')
  s.textContent = MARKER_CSS
  document.head.appendChild(s)
  cssInjected = true
}

/* ──────────────────────────────────────────────────────────────────────
   Mapa interactivo con Leaflet vanilla (sin react-leaflet)
   ────────────────────────────────────────────────────────────────────── */
function LeafletMap({ position, onPositionChange, readOnly }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markerRef    = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Carga Leaflet dinámicamente (evita SSR issues)
    import('leaflet').then(({ default: L }) => {
      import('leaflet/dist/leaflet.css')
      injectCSS()

      // Inicializar mapa una sola vez
      if (!mapRef.current) {
        const center = position ?? { lat: -33.45, lng: -70.65 }
        mapRef.current = L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom: position ? 15 : 5,
          zoomControl: true,
          scrollWheelZoom: false,
        })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(mapRef.current)

        // Click para mover el marcador (solo en modo edición)
        if (!readOnly && onPositionChange) {
          mapRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng
            onPositionChange({ lat, lng })
          })
        }
      }

      // Marcador azul animado
      const iconHtml = `<div class="fb-marker-wrap"><div class="fb-marker-pulse"></div><div class="fb-marker-dot"></div></div>`
      const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [32,32], iconAnchor: [16,16] })

      if (position) {
        if (markerRef.current) {
          markerRef.current.setLatLng([position.lat, position.lng])
        } else {
          markerRef.current = L.marker([position.lat, position.lng], { icon }).addTo(mapRef.current)
        }
        mapRef.current.setView([position.lat, position.lng], 15, { animate: true })
      } else if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, []) // Solo montar/desmontar

  // Actualizar marcador cuando cambia position (sin reiniciar mapa)
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(({ default: L }) => {
      injectCSS()
      const iconHtml = `<div class="fb-marker-wrap"><div class="fb-marker-pulse"></div><div class="fb-marker-dot"></div></div>`
      const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [32,32], iconAnchor: [16,16] })

      if (position) {
        if (markerRef.current) {
          markerRef.current.setLatLng([position.lat, position.lng])
        } else {
          markerRef.current = L.marker([position.lat, position.lng], { icon }).addTo(mapRef.current)
        }
        mapRef.current.setView([position.lat, position.lng], 15, { animate: true })
      } else if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    })
  }, [position])

  return (
    <div ref={containerRef} className="w-full h-full" />
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Componente principal exportado
   ────────────────────────────────────────────────────────────────────── */
export default function MapEmbed({ direccion, position, onPositionChange, readOnly = false }) {
  const [buscando, setBuscando]       = useState(false)
  const [geolocalizando, setGeo]      = useState(false)
  const [error, setError]             = useState('')
  const [coords, setCoords]           = useState(position ?? null)

  useEffect(() => {
    if (position) setCoords(position)
  }, [position])

  async function geocodificar() {
    if (!direccion?.trim()) { setError('Escribe primero una dirección.'); return }
    setBuscando(true); setError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (!data.length) { setError('Dirección no encontrada. Intenta ser más específico.'); return }
      const newCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      setCoords(newCoords)
      onPositionChange?.(newCoords)
    } catch {
      setError('Error al buscar. Revisa tu conexión.')
    } finally {
      setBuscando(false)
    }
  }

  const handleMapClick = (pos) => {
    setCoords(pos)
    onPositionChange?.(pos)
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeo(true); setError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        const pos = { lat: c.latitude, lng: c.longitude }
        setCoords(pos)
        onPositionChange?.(pos)
        setGeo(false)
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Permiso de ubicación denegado. Actívalo en tu navegador.'
            : 'No se pudo obtener tu ubicación. Intenta de nuevo.'
        )
        setGeo(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          {coords && (
            <span className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50
                             border border-blue-100 px-2.5 py-1 rounded-lg font-medium">
              <MapPin className="w-3 h-3" />
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          )}
          <button type="button" onClick={geocodificar} disabled={buscando || !direccion?.trim()}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600
                       hover:bg-blue-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition">
            {buscando
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Buscando...</>
              : <><Search className="w-3 h-3" /> Localizar</>}
          </button>

          <button type="button" onClick={usarMiUbicacion} disabled={geolocalizando}
            title="Usar mi ubicación actual"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50
                       border border-blue-200 hover:bg-blue-100 disabled:opacity-40
                       px-3 py-1.5 rounded-lg transition">
            {geolocalizando
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Obteniendo...</>
              : <><LocateFixed className="w-3 h-3" /> Mi ubicación</>}
          </button>
          {!readOnly && (
            <p className="text-xs text-gray-400 w-full">
              O haz clic directamente en el mapa para fijar la ubicación.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="h-52 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <LeafletMap
          position={coords}
          onPositionChange={!readOnly ? handleMapClick : undefined}
          readOnly={readOnly}
        />
      </div>

      {coords && (
        <a href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Ver en OpenStreetMap
        </a>
      )}
    </div>
  )
}
