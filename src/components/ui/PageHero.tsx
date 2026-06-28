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
    <div
      className="relative rounded-[20px] px-6 py-6 mb-6 text-white flex items-center justify-between gap-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f2544 0%, #1B3A6B 60%, #2351a0 100%)',
        boxShadow: '0 4px 24px rgba(27,58,107,0.25)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
      {/* Glow orb */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: '#60a5fa' }}
        aria-hidden
      />
 
      <div className="relative min-w-0">
        <h1 className="text-xl font-bold truncate text-white">{title}</h1>
        {subtitle && (
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {right && (
        <div className="relative shrink-0">{right}</div>
      )}
    </div>
  )
}