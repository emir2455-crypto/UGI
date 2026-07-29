# FleetView

Application de gestion de flotte pour la location de véhicules (Getaround, Turo, Leboncoin, Facebook, Direct) : véhicules, réservations, calendrier, tableau de bord, finances et boîtiers à clés.

## Stack technique

- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL (base en ligne, ex. Neon/Vercel Postgres — accessible depuis n'importe où, PC comme téléphone)
- Tailwind CSS (thème sombre / ambre, responsive mobile-first)
- Authentification par cookie de session (JWT), deux rôles : `ADMIN` et `HELPER`

## Démarrage

```bash
npm install
cp .env.example .env   # renseignez DATABASE_URL (Postgres) et SESSION_SECRET
npm run db:push        # crée les tables dans la base Postgres
npm run db:seed        # crée les deux comptes de connexion
npm run dev             # http://localhost:3000
```

## Déploiement (accès depuis PC et téléphone, partout)

1. Créez une base Postgres gratuite (Vercel Postgres/Neon, ou Neon.tech directement) et récupérez sa `DATABASE_URL`.
2. Importez ce dépôt dans [Vercel](https://vercel.com/new).
3. Dans les variables d'environnement du projet Vercel, ajoutez `DATABASE_URL` et `SESSION_SECRET`.
4. Avant le premier déploiement (ou en local avec la même `DATABASE_URL`), lancez `npm run db:push && npm run db:seed` pour créer les tables et les comptes.
5. Déployez. L'URL fournie par Vercel est utilisable depuis n'importe quel appareil (PC, téléphone, en 4G/5G).

## Comptes créés par le seed

Le script `npm run db:seed` crée deux comptes (mots de passe à changer) :

- **Administrateur** : `admin@fleetview.local` / `ChangeMoi123!` — accès complet (tarifs, finances, statistiques).
- **Renfort famille** : `renfort@fleetview.local` / `Renfort123!` — accès au calendrier et aux réservations, peut marquer une remise/retour comme terminée et changer le code d'un boîtier à clés, mais ne voit ni les tarifs ni les statistiques financières.

Vous pouvez personnaliser ces identifiants avant le seed via les variables d'environnement `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_HELPER_EMAIL`, `SEED_HELPER_PASSWORD`.

## Fonctionnalités

- **Véhicules** : fiche complète, statut, historique pannes/entretiens, alerte à 30 jours avant contrôle technique/révision.
- **Réservations** : création/modification/annulation, calcul automatique durée et montant, statut automatique (à venir / en cours / terminée / annulée), notes libres.
- **Calendrier** : vue semaine/mois par véhicule, couleur par canal, retours du jour/lendemain, détection des doubles réservations.
- **Tableau de bord** : disponibilité de la flotte, chiffre d'affaires du mois (vs mois précédent), CA par canal, taux d'occupation 30 jours, revenu moyen par véhicule, prochains retours.
- **Finances** : dépenses par véhicule, marge nette automatique, export CSV (réservations et dépenses).
- **Boîtiers à clés** : code actuel modifiable, historique des changements, lien avec la réservation en cours, alerte si le code n'a pas été changé depuis la fin de la dernière location.

## Notes

- Le projet est actuellement sur Next.js 14.2.35 (dernière version de la branche 14.x). Des CVE connues sur Next.js ne sont corrigées qu'à partir de la branche 15/16 ; une montée de version majeure est possible plus tard mais implique une migration (React 19, API `cookies()`/`params` asynchrones).
