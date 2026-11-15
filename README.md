# DermaSense

Plateforme de surveillance des **escarres** : des capteurs de pression (ESP32) transmettent leurs mesures en MQTT, l'application les affiche en temps réel sur un modèle 3D du corps et déclenche des alertes graduées (prévention, vigilance, repositionnement, urgence).

## Fonctionnalités

- Tableau de bord, suivi de monitoring et carte de pression par zone
- Modèle 3D du corps avec surcouche thermique/pression en temps réel (SSE)
- Alertes, tendances et recommandations de repositionnement
- Gestion des patients, authentification (NextAuth)
- Simulateur de capteurs pour les démonstrations

## Stack technique

Next.js 16 (App Router), React 19, TypeScript, MongoDB (Mongoose), MQTT, Upstash Redis, Three.js, NextAuth v5.

## Démarrage

```bash
git clone https://github.com/LUZAmaxxp/DermaSense.git
cd DermaSense
npm ci
cp .env.example .env.local   # puis renseigner les variables
npm run dev
```

Application : http://localhost:3000

## Scripts utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run typecheck` | Vérification TypeScript |
| `npm run build` | Build de production |
| `npm run test:e2e` | Smoke tests HTTP |
| `npm run seed` | Créer un utilisateur de test |
| `npm run mock` | Simuler un capteur (`mock:urgence`, `mock:escalate`) |
| `npm run worker` | Pont MQTT |

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md) : GitHub Flow, branches, Pull Requests et revue de code.
