/**
 * MapPickerField — sélection pickup location via carte Leaflet CDN
 * Pas d'import leaflet — chargé via CDN dynamiquement
 */

import { useEffect, useRef, useState } from 'react'
import { MapPin, Locate, RotateCcw } from 'lucide-react'

interface Coords {
  lat: number
  lng: number
}

interface MapPickerFieldProps {
  onCoords:      (exact: Coords, approx: Coords) => void
  initialCoords?: Coords | null
}

// Offset aléatoire ~200-500m
function randomOffset(): number {
  const sign   = Math.random() > 0.5 ? 1 : -1
  const amount = 0.002 + Math.random() * 0.003
  return sign * amount
}

function approxFrom(exact: Coords): Coords {
  return {
    lat: exact.lat + randomOffset(),
    lng: exact.lng + randomOffset(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletType = any

export function MapPickerField({ onCoords, initialCoords }: MapPickerFieldProps) {
  const mapRef         = useRef<HTMLDivElement>(null)
  const leafletMap     = useRef<LeafletType>(null)
  const markerRef      = useRef<LeafletType>(null)
  const approxRef      = useRef<LeafletType>(null)
  const [coords,       setCoords]       = useState<Coords | null>(initialCoords ?? null)
  const [loading,      setLoading]      = useState(false)
  const [leafletReady, setLeafletReady] = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  // ── Charger Leaflet via CDN ─────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { setLeafletReady(true); return }

    const link    = document.createElement('link')
    link.rel      = 'stylesheet'
    link.href     = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)

    const script  = document.createElement('script')
    script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => setLeafletReady(true)
    document.head.appendChild(script)
  }, [])

  // ── Init carte ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletMap.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L   = (window as any).L
    const map = L.map(mapRef.current).setView([14.6937, -17.4441], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom:     19,
    }).addTo(map)

    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      placeMarker({ lat: e.latlng.lat, lng: e.latlng.lng }, L, map)
    })

    leafletMap.current = map

    if (initialCoords) {
      placeMarker(initialCoords, L, map)
      map.setView([initialCoords.lat, initialCoords.lng], 15)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady])

  function makeIcon(L: LeafletType) {
    return L.divIcon({
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:#1B3A6B;border:3px solid white;
        transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 28],
      className:  '',
    })
  }

  function placeMarker(c: Coords, L: LeafletType, map: LeafletType) {
    if (markerRef.current) markerRef.current.remove()
    if (approxRef.current) approxRef.current.remove()

    markerRef.current = L.marker([c.lat, c.lng], { icon: makeIcon(L) })
      .addTo(map)
      .bindPopup('Point de dépôt exact')
      .openPopup()

    const approx = approxFrom(c)
    approxRef.current = L.circle([approx.lat, approx.lng], {
      radius:      500,
      color:       '#1B3A6B',
      fillColor:   '#EBF4FF',
      fillOpacity: 0.35,
      weight:      2,
      dashArray:   '6 4',
    }).addTo(map).bindPopup("Zone approximative visible par l'expéditeur")

    setCoords(c)
    onCoords(c, approx)
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        const c   = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L   = (window as any).L
        const map = leafletMap.current
        map.setView([c.lat, c.lng], 16)
        placeMarker(c, L, map)
      },
      () => {
        setLoading(false)
        setError("Impossible d'obtenir votre position. Vérifiez les autorisations.")
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleReset() {
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
    if (approxRef.current) { approxRef.current.remove(); approxRef.current = null }
    setCoords(null)
    onCoords({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={loading || !leafletReady}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#2B6CB0] disabled:opacity-50 transition-colors min-h-[44px]"
        >
          <Locate className="w-4 h-4" aria-hidden />
          {loading ? 'Localisation…' : 'Ma position'}
        </button>

        {coords && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Carte */}
      <div className="relative rounded-[14px] overflow-hidden border border-gray-200">
        {!leafletReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-sm text-gray-500">Chargement de la carte…</p>
          </div>
        )}
        <div ref={mapRef} style={{ height: '280px', width: '100%' }} />
      </div>

      {/* Status */}
      {!coords ? (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden />
          Cliquez sur la carte ou utilisez votre position
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" aria-hidden />
            Point placé — {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
          <p className="text-xs text-gray-400">
            Zone bleue (~500m) = ce que voit l'expéditeur avant paiement.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  )
}