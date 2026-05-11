# Composants UI — GP-Valise Frontend

## Design system src/components/ui/

### Button

```tsx
import { Button } from '@/components/ui'

<Button variant="primary"   loading={isPending}>Se connecter</Button>
<Button variant="secondary"                    >Annuler</Button>
<Button variant="danger"                       >Supprimer</Button>
<Button variant="ghost"                        >Voir plus</Button>
<Button size="sm" />
<Button size="md" />  // default
<Button size="lg" />
```

### Input

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  placeholder="vous@exemple.com"
/>
```

### Card

```tsx
<Card className="p-6">contenu</Card>
```

### Badge

```tsx
<Badge variant="success">Confirmée</Badge>
<Badge variant="warning">En paiement</Badge>
<Badge variant="danger" >En litige</Badge>
<Badge variant="gray"   >Expirée</Badge>

// Booking status automatique
<BookingStatusBadge status={booking.status} />
```

### Spinner

```tsx
<Spinner />
<Spinner className="h-8 w-8" />
```

## AppLayout

```tsx
<AppLayout navItems={navItems}>
  <Routes>...</Routes>
</AppLayout>

// navItems shape:
{ label: string, path: string, icon: ReactNode }
```

## Règles

```txt
- Toujours utiliser les composants ui/ — pas de HTML brut stylé
- Pas de Tailwind dupliqué — créer composant si besoin
- Props typées obligatoires
- className prop forwarded sur tous les composants
```
