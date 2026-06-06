/**
 * CitySelect — champ ville avec suggestions mondiales
 * Datalist HTML natif : léger, mobile-first, fonctionne hors-ligne
 * Pas de dépendance externe
 */

import { useId } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Villes mondiales ──────────────────────────────────────────────────────
// Corridors prioritaires : Afrique de l'Ouest, Maghreb, Europe, Amérique du Nord
// + capitales mondiales pour couverture internationale

export const WORLD_CITIES = [
  // ── Afrique de l'Ouest ──────────────────────────────────────────────
  'Abidjan', 'Accra', 'Bamako', 'Banjul', 'Bissau', 'Conakry',
  'Cotonou', 'Dakar', 'Freetown', 'Lomé', 'Monrovia', 'Niamey',
  'Nouakchott', 'Ouagadougou', 'Porto-Novo',

  // ── Maghreb ─────────────────────────────────────────────────────────
  'Agadir', 'Alger', 'Casablanca', 'Constantine', 'Fès', 'Marrakech',
  'Meknès', 'Oran', 'Oujda', 'Rabat', 'Tanger', 'Tlemcen', 'Tunis',
  'Sfax', 'Sousse', 'Tripoli',

  // ── Afrique centrale ────────────────────────────────────────────────
  'Brazzaville', 'Douala', 'Kinshasa', 'Libreville', 'Luanda',
  'Malabo', 'N\'Djamena', 'Yaoundé',

  // ── Afrique de l'Est ────────────────────────────────────────────────
  'Addis-Abeba', 'Dar es Salaam', 'Djibouti', 'Kampala', 'Khartoum',
  'Kigali', 'Mogadiscio', 'Mombasa', 'Nairobi',

  // ── Afrique australe ────────────────────────────────────────────────
  'Antananarivo', 'Cape Town', 'Durban', 'Harare', 'Johannesburg',
  'Lusaka', 'Maputo', 'Windhoek',

  // ── France ──────────────────────────────────────────────────────────
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes',
  'Strasbourg', 'Montpellier', 'Nice', 'Rennes', 'Grenoble', 'Lille',
  'Rouen', 'Toulon', 'Saint-Étienne', 'Le Havre', 'Reims', 'Dijon',
  'Angers', 'Nîmes',

  // ── Belgique ────────────────────────────────────────────────────────
  'Bruxelles', 'Anvers', 'Gand', 'Liège', 'Bruges',

  // ── Suisse ──────────────────────────────────────────────────────────
  'Genève', 'Zurich', 'Berne', 'Bâle', 'Lausanne',

  // ── Espagne ─────────────────────────────────────────────────────────
  'Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao', 'Malaga',
  'Las Palmas',

  // ── Italie ──────────────────────────────────────────────────────────
  'Rome', 'Milan', 'Naples', 'Turin', 'Palerme', 'Gênes', 'Bologne',

  // ── Portugal ────────────────────────────────────────────────────────
  'Lisbonne', 'Porto', 'Braga',

  // ── Pays-Bas ────────────────────────────────────────────────────────
  'Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht',

  // ── Allemagne ───────────────────────────────────────────────────────
  'Berlin', 'Munich', 'Hambourg', 'Francfort', 'Cologne', 'Stuttgart',

  // ── Royaume-Uni ─────────────────────────────────────────────────────
  'Londres', 'Birmingham', 'Manchester', 'Glasgow', 'Édimbourg',
  'Liverpool', 'Leeds', 'Bristol',

  // ── Scandinavie ─────────────────────────────────────────────────────
  'Stockholm', 'Oslo', 'Copenhague', 'Helsinki',

  // ── Europe de l'Est ─────────────────────────────────────────────────
  'Varsovie', 'Prague', 'Budapest', 'Bucarest', 'Vienne', 'Athènes',
  'Sofia', 'Zagreb', 'Belgrade', 'Kiev',

  // ── Amérique du Nord ────────────────────────────────────────────────
  'Montréal', 'Toronto', 'Vancouver', 'Ottawa', 'Calgary', 'Québec',
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Atlanta',
  'Boston', 'Washington', 'San Francisco', 'Seattle', 'Dallas',
  'Mexico', 'Guadalajara', 'Monterrey',

  // ── Caraïbes & DOM-TOM ──────────────────────────────────────────────
  'Fort-de-France', 'Pointe-à-Pitre', 'Saint-Denis (La Réunion)',
  'Cayenne', 'Port-au-Prince', 'Kingston', 'Port of Spain',
  'Santo Domingo',

  // ── Amérique du Sud ─────────────────────────────────────────────────
  'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Santiago', 'Lima',
  'Bogotá', 'Caracas', 'Quito',

  // ── Moyen-Orient ────────────────────────────────────────────────────
  'Dubaï', 'Abou Dhabi', 'Riyad', 'Djeddah', 'Koweït', 'Doha',
  'Manama', 'Mascate', 'Beyrouth', 'Amman', 'Bagdad', 'Téhéran',
  'Istanbul', 'Ankara', 'Izmir',

  // ── Asie du Sud ─────────────────────────────────────────────────────
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Karachi',
  'Lahore', 'Dhaka', 'Colombo', 'Katmandou',

  // ── Asie du Sud-Est ─────────────────────────────────────────────────
  'Bangkok', 'Kuala Lumpur', 'Singapour', 'Jakarta', 'Manille',
  'Hô Chi Minh-Ville', 'Hanoi', 'Phnom Penh', 'Rangoun',

  // ── Chine & Extrême-Orient ──────────────────────────────────────────
  'Pékin', 'Shanghai', 'Canton', 'Shenzhen', 'Hong Kong', 'Taipei',
  'Séoul', 'Busan', 'Tokyo', 'Osaka', 'Nagoya',

  // ── Océanie ─────────────────────────────────────────────────────────
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Auckland',
] as const

// ─── Component ────────────────────────────────────────────────────────────

interface CitySelectProps {
  value:       string
  onChange:    (value: string) => void
  placeholder?: string
  label?:      string
  error?:      string
  className?:  string
  required?:   boolean
  id?:         string
}

export function CitySelect({
  value,
  onChange,
  placeholder = 'Ville',
  label,
  error,
  className,
  required,
  id,
}: CitySelectProps) {
  const uid      = useId()
  const inputId  = id ?? uid
  const listId   = `${inputId}-list`
  const errorId  = `${inputId}-error`
  const hasError = Boolean(error)

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 select-none">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 shrink-0 pointer-events-none"
          aria-hidden
        >
          <MapPin className="h-4 w-4" />
        </span>

        <input
          id={inputId}
          type="text"
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            'w-full min-h-[48px] pl-10 pr-4 py-3',
            'rounded-[10px] border bg-white text-sm text-gray-900',
            'placeholder:text-gray-400 transition-all duration-200',
            'focus:outline-none',
            hasError
              ? 'border-red-400 bg-red-50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.25)]'
              : 'border-gray-300 focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)]',
          )}
        />

        <datalist id={listId}>
          {WORLD_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

// ─── Inline variant (pour la search bar sans label) ───────────────────────

interface CityInputInlineProps {
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
  className?:   string
}

export function CityInputInline({
  value,
  onChange,
  placeholder = 'Ville',
  className,
}: CityInputInlineProps) {
  const uid    = useId()
  const listId = `${uid}-list`

  return (
    <div className={cn('flex items-center gap-2 flex-1 min-w-0', className)}>
      <MapPin className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
      <input
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full min-h-[44px]"
      />
      <datalist id={listId}>
        {WORLD_CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </div>
  )
}