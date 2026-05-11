# 🧠 .adamas-front — GP-Valise Frontend System

## Objectif

`.adamas-front` est le système de gouvernance technique du frontend **GP-Valise**.

Il guide :

- Claude Code dans la génération de code frontend
- Les décisions d'architecture UI
- Les contrats API consommés
- Les règles de sécurité côté client
- Les standards React/TypeScript du projet

> Miroir de `.adamas/` — adapté au contexte React/Vite.

---

## Stack

| Tool             | Version |
| ---------------- | ------- |
| React            | 19.2.5  |
| React DOM        | 19.2.5  |
| Vite             | 8.0.10  |
| TypeScript       | 6.0.2   |
| Tailwind CSS     | 4.3.0   |
| React Router DOM | 7.15.0  |
| TanStack Query   | 5.100.9 |
| Zustand          | 5.0.13  |
| Axios            | 1.16.0  |
| Lucide React     | 1.14.0  |
| react-hot-toast  | 2.6.0   |

## Structure

```txt
.adamas-front/
├── ai/
│   ├── core/          → prompt système, contraintes IA
│   ├── domain/        → acteurs, statuts, flows UI
│   ├── engineering/   → architecture, standards, composants
│   ├── governance/    → decision-log, review checklist
│   └── security/      → auth, routes protégées
└── domain/
    ├── auth.md
    ├── booking-ui.md
    ├── dispute-ui.md
    └── api-contracts.md
```

---

## Principe clé

> Le frontend ne contient aucune logique métier.
> Il consomme l'API, affiche les données, déclenche des actions utilisateur.
> Toute règle métier vit dans le backend.

---

## Règles non négociables

- Ne jamais recalculer un statut métier côté front
- Ne jamais décider si une action est autorisée uniquement côté front
- Toujours afficher les statuts retournés par l'API
- Toujours gérer loading / error / empty states
- Toujours centraliser les appels API dans `src/api/`
- Toujours utiliser TanStack Query pour les données serveur
- Zustand est réservé à l'état client minimal : auth, user, UI légère

```

```
