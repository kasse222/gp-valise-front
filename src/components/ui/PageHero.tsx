/**
 * PageHero — bandeau bleu réutilisable
 * Utilisé sur toutes les pages pour la cohérence visuelle avec TripDetailPublicPage
 */
export function PageHero({
  title,
  subtitle,
  right,
}: {
  title:     React.ReactNode
  subtitle?: React.ReactNode
  right?:    React.ReactNode
}) {
  return (
    <div className="bg-[#1B3A6B] rounded-[20px] px-6 py-6 mb-6 text-white flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold truncate">{title}</h1>
        {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}