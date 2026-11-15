# Guide de contribution

Ce projet suit le **GitHub Flow** : `main` reste stable et tout changement passe par une branche dédiée, puis une Pull Request relue avant fusion.

## Workflow

1. Cloner le projet : `git clone https://github.com/LUZAmaxxp/DermaSense.git`
2. Se mettre à jour : `git switch main && git pull origin main`
3. Créer une branche : `git switch -c feature-<nom>` ou `fix-<nom>`
4. Développer, puis `git add <fichiers>` et `git commit -m "Message clair"`
5. Vérifier en local : `npm run typecheck` et `npm run build`
6. Publier : `git push origin <branche>`
7. Ouvrir une **Pull Request** vers `main`
8. Passer la **revue de code** et la CI, puis fusionner

## Nommage des branches

| Préfixe | Usage | Exemple |
|---|---|---|
| `feature-` | nouvelle fonctionnalité | `feature-alertes-sms` |
| `fix-` | correction de bug | `fix-capteurs-zone` |
| `docs-` | documentation | `docs-readme` |

## Messages de commit

Courts et explicites, par exemple `fix(3d): normalize GLB scale`. Évitez les messages vagues (`update`, `fix`).

## Règles de revue

- Au moins une approbation avant fusion
- La CI (typecheck, build, smoke test) doit être verte
- Ne jamais commiter de secrets : `.env*` est ignoré, utiliser `.env.example` comme modèle
- Garder les branches courtes pour limiter les conflits et se resynchroniser avec `main` régulièrement
