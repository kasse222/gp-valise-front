/**
 * MapPickerField — carte Leaflet avec geocoding Nominatim
 * - CitySelect → centre la carte automatiquement
 * - Adresse → geocode et centre
 * - Clic carte ou géolocalisation → pin exact
 * - Zone ~500m calculée automatiquement
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Locate, RotateCcw, Search } from 'lucide-react'
import { CityInputInline } from '@/components/ui/CitySelect'

interface Coords { lat: number; lng: number }

interface MapPickerFieldProps {
  onCoords:      (exact: Coords, approx: Coords) => void
  onCityChange?: (city: string) => void
  initialCity?:  string
  initialCoords?: Coords | null
}

function randomOffset(): number {
  const sign   = Math.random() > 0.5 ? 1 : -1
  const amount = 0.002 + Math.random() * 0.003
  return sign * amount
}

function approxFrom(c: Coords): Coords {
  return { lat: c.lat + randomOffset(), lng: c.lng + randomOffset() }
}

// Geocoding via Nominatim (OpenStreetMap) — gratuit, pas de clé
async function geocode(query: string): Promise<Coords | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'fr' } },
    )
    const data = await res.json()
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    return null
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L = any

export function MapPickerField({
  onCoords, onCityChange, initialCity = '', initialCoords,
}: MapPickerFieldProps) {
  const mapRef         = useRef<HTMLDivElement>(null)
  const leafletMap     = useRef<L>(null)
  const markerRef      = useRef<L>(null)
  const approxRef      = useRef<L>(null)
  const [coords,          setCoords]          = useState<Coords | null>(initialCoords ?? null)
  const [city,            setCity]            = useState(initialCity)
  const [address,         setAddress]         = useState('')
  const [suggestions,     setSuggestions]     = useState<{ display_name: string; lat: string; lon: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [geocoding,       setGeocoding]       = useState(false)
  const [leafletReady,    setLeafletReady]    = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  // ── Charger Leaflet ──────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { setLeafletReady(true); return }
    const link   = document.createElement('link')
    link.rel     = 'stylesheet'
    link.href    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)
    const script  = document.createElement('script')
    script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => setLeafletReady(true)
    document.head.appendChild(script)
  }, [])

  // ── Init carte ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletMap.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Lf  = (window as any).L
    const map = Lf.map(mapRef.current).setView([14.6937, -17.4441], 12)
    Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      placeMarker({ lat: e.latlng.lat, lng: e.latlng.lng })
    })
    leafletMap.current = map
    if (initialCoords) {
      placeMarker(initialCoords)
      map.setView([initialCoords.lat, initialCoords.lng], 15)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady])

  function makeIcon() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Lf = (window as any).L
    return Lf.divIcon({
      html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#1B3A6B;border:3px solid white;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [28, 28], iconAnchor: [14, 28], className: '',
    })
  }

  const placeMarker = useCallback((c: Coords) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Lf  = (window as any).L
    const map = leafletMap.current
    if (!map || !Lf) return
    if (markerRef.current) markerRef.current.remove()
    if (approxRef.current) approxRef.current.remove()
    markerRef.current = Lf.marker([c.lat, c.lng], { icon: makeIcon() })
      .addTo(map).bindPopup('Point de dépôt exact').openPopup()
    const approx = approxFrom(c)
    approxRef.current = Lf.circle([approx.lat, approx.lng], {
      radius: 500, color: '#1B3A6B', fillColor: '#EBF4FF',
      fillOpacity: 0.35, weight: 2, dashArray: '6 4',
    }).addTo(map).bindPopup("Zone visible par l'expéditeur avant paiement")
    setCoords(c)
    onCoords(c, approx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCoords])

  // ── Geocode ville → centre carte ─────────────────────────────────────
  const geocodeAndCenter = useCallback(async (query: string, zoom = 13) => {
    if (!query.trim() || !leafletMap.current) return
    setGeocoding(true)
    const result = await geocode(query)
    setGeocoding(false)
    if (result && leafletMap.current) {
      leafletMap.current.setView([result.lat, result.lng], zoom)
    }
  }, [])

  // Ville change → geocode + centre (sans placer de marker)
  useEffect(() => {
    if (city) geocodeAndCenter(city, 13)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Adresse → autocomplete Nominatim (debounce 400ms)
  useEffect(() => {
    if (!address.trim() || address.length < 3) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      setGeocoding(true)
      const query = city ? `${address}, ${city}` : address
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } },
        )
        const data = await res.json()
        setSuggestions(data)
        if (data.length > 0) setShowSuggestions(true)
      } catch { setSuggestions([]) }
      setGeocoding(false)
    }, 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, city])

  function handleSelectSuggestion(s: { display_name: string; lat: string; lon: string }) {
    setAddress(s.display_name)
    setSuggestions([])
    setShowSuggestions(false)
    const c = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }
    leafletMap.current?.setView([c.lat, c.lng], 17)
    placeMarker(c)
  }

  function handleCityChange(v: string) {
    setCity(v)
    onCityChange?.(v)
  }

  function handleGeolocate() {
    if (!navigator.geolocation) { setError('Géolocalisation non supportée.'); return }
    setLoading(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        leafletMap.current?.setView([c.lat, c.lng], 16)
        placeMarker(c)
      },
      () => { setLoading(false); setError("Impossible d'obtenir votre position.") },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleReset() {
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
    if (approxRef.current) { approxRef.current.remove(); approxRef.current = null }
    setCoords(null)
    setAddress('')
    setSuggestions([])
    setShowSuggestions(false)
    onCoords({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Ville avec datalist */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">
          Ville {geocoding && <span className="text-gray-400 ml-1">· Recherche…</span>}
        </label>
        <div className="flex items-center border border-gray-300 rounded-[10px] px-3 bg-white min-h-[44px] focus-within:border-[#1B3A6B] focus-within:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all">
          <CityInputInline
            value={city}
            onChange={handleCityChange}
            placeholder="Choisir une ville…"
          />
        </div>
      </div>

      {/* Adresse → autocomplete Nominatim */}
      <div className="flex flex-col gap-1.5 relative">
        <label className="text-xs font-medium text-gray-600">
          Adresse précise
          <span className="text-gray-400 font-normal ml-1">(suggestions automatiques)</span>
        </label>
        <div className="flex items-center gap-2 border border-gray-300 rounded-[10px] px-3 bg-white min-h-[44px] focus-within:border-[#1B3A6B] focus-within:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Commencez à taper une adresse…"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none py-2"
            autoComplete="off"
          />
          {geocoding && <span className="text-xs text-gray-400 shrink-0">…</span>}
        </div>

        {/* Dropdown suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-[1000] bg-white border border-gray-200 rounded-[10px] shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-[#EBF4FF] transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#1B3A6B] shrink-0 mt-0.5" aria-hidden />
                  <span>{s.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleGeolocate} disabled={loading || !leafletReady}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#2B6CB0] disabled:opacity-50 transition-colors min-h-[44px]">
          <Locate className="w-4 h-4" aria-hidden />
          {loading ? 'Localisation…' : 'Ma position'}
        </button>
        {coords && (
          <button type="button" onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
            <RotateCcw className="w-3.5 h-3.5" aria-hidden />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Carte */}
      <div className="relative rounded-[14px] overflow-hidden border border-gray-200">
        {(!leafletReady || geocoding) && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 text-xs text-gray-600 px-3 py-1.5 rounded-full shadow">
            {!leafletReady ? 'Chargement de la carte…' : 'Recherche en cours…'}
          </div>
        )}
        <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
      </div>

      {/* Bouton valider */}
      {coords && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-[10px]">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-800">
              Position confirmée — {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Zone ~500m visible par l'expéditeur avant paiement.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 text-xs text-emerald-700 hover:text-red-600 underline transition-colors"
          >
            Modifier
          </button>
        </div>
      )}

      {!coords && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden />
          Saisissez une adresse, cliquez sur la carte ou utilisez votre position
        </p>
      )}

      {error && <p className="text-xs text-red-600 flex items-center gap-1"><span aria-hidden>⚠</span> {error}</p>}
    </div>
  )
}