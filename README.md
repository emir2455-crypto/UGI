# FleetView

Application de gestion de flotte pour la location de véhicules (Getaround, Turo, Leboncoin, Facebook, Direct) : véhicules, réservations, calendrier, tableau de bord, finances et boîtiers à clés.

## Stack technique

- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite (fichier local, aucune perte de données au redémarrage)
- Tailwind CSS (thème sombre / ambre, responsive mobile-first)
- Authentification par cookie de session (JWT), deux rôles : `ADMIN` et `HELPER`

## Démarrage

```bash
npm install
cp .env.example .env   # puis changez SESSION_SECRET
npm run db:push        # crée la base SQLite locale
npm run db:seed        # crée les deux comptes de connexion
npm run dev             # http://localhost:3000
```

Pour un usage réel (production sur votre propre serveur/NAS) :

```bash
npm run build
npm run start
```

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

- La base de données est un simple fichier SQLite (`prisma/dev.db`, ignoré par Git). Sauvegardez ce fichier régulièrement si vous l'utilisez en production.
- Le projet est actuellement sur Next.js 14.2.35 (dernière version de la branche 14.x). Des CVE connues sur Next.js ne sont corrigées qu'à partir de la branche 15/16 ; une montée de version majeure est possible plus tard mais implique une migration (React 19, API `cookies()`/`params` asynchrones).
