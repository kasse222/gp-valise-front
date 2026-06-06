import { useId } from 'react'
import { COUNTRIES } from '@/lib/countries'

interface CountrySelectProps {
  value:        string
  onChange:     (code: string) => void
  label?:       string
  required?:    boolean
  placeholder?: string
}

export function CountrySelect({ value, onChange, label, required, placeholder = 'Choisir un pays…' }: CountrySelectProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 select-none">
          {label}{required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full min-h-[48px] px-4 py-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all duration-200"
      >
        <option value="">{placeholder}</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}