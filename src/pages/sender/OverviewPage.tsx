import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui'

export default function OverviewPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.first_name} 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Voici un aperçu de vos envois.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Réservations actives" value="—" color="indigo" />
        <StatCard label="En cours de livraison" value="—" color="green" />
        <StatCard label="Litiges ouverts"       value="—" color="red" />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'indigo' | 'green' | 'red'
}) {
  const colors = {
    indigo: 'text-indigo-600',
    green:  'text-green-600',
    red:    'text-red-600',
  }

  return (
    <Card>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </Card>
  )
}