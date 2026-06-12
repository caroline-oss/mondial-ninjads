# mondial.ninjads.fr — Le Mondial raconté par la data

Pronostics quotidiens de la Coupe du Monde 2026 par un modèle Elo transparent.
Chaque prono est horodaté et figé avant le match (append-only). Le compteur de
réussite est la preuve publique.

## Structure

```
app/            page principale (pronos du jour + verdicts d'hier + historique)
components/     cartes match, cartes verdict, tableau historique
lib/teams.ts    helpers équipes (noms FR, drapeaux flagcdn)
lib/elo.mjs     LE modèle (Elo + probas 1/N/2 + score probable) — commenté
scripts/update.mjs  le cron qui fait tout (fetch → règlement → Elo → pronos → exports)
data/teams.json     source unique : 48 équipes, noms openfootball, Elo seed
data/predictions.json  l'historique append-only (NE JAMAIS éditer à la main)
data/site.json      généré — consommé par la page
data/history.csv    généré — à brancher sur Google Sheets / Looker Studio
```

## Démarrage local

```bash
npm install
node scripts/update.mjs   # génère les pronos du jour + site.json
npm run dev               # http://localhost:3002
```

## Déploiement (VPS Hostinger, modèle ninjads-site)

```bash
npm run build
pm2 start npm --name mondial -- start
```

Nginx : nouveau server block `mondial.ninjads.fr` → proxy_pass http://127.0.0.1:3002
(+ certbot pour le SSL). Ajouter l'enregistrement DNS A du sous-domaine.

Cron (les matchs US/Mexique finissent tard heure de Paris — on met à jour le matin
ET en journée pour le "live") :

```cron
30 6 * * *   cd /var/www/mondial && node scripts/update.mjs >> /var/log/mondial.log 2>&1
0 */2 * * *  cd /var/www/mondial && node scripts/update.mjs >> /var/log/mondial.log 2>&1
```

La page Next.js a `revalidate = 900` : elle relit site.json au plus toutes les 15 min,
aucun redeploy nécessaire.

## ⚠️ Avant la mise en prod

1. **Recaler les Elo seed** dans `data/teams.json` depuis https://www.eloratings.net
   (les valeurs fournies sont des ordres de grandeur). Le modèle s'auto-corrige
   ensuite à chaque match.
2. **Lien livre** : remplacer l'URL Éditions ENI dans `app/page.tsx` par la fiche
   exacte du livre.
3. Vérifier le rendu mobile (la grille match passe en colonne < 560px).

## Points d'attention

- **Source** : openfootball/worldcup.json (domaine public, sans clé). Les scores
  apparaissent avec un délai de quelques heures après les matchs — c'est le repo
  communautaire. Si besoin de plus réactif : API-Football tier gratuit en complément.
- **Matchs de nuit** : un match à 20:00 UTC-6 = 04:00 à Paris le lendemain. Le prono
  reste rattaché à sa date officielle FIFA (date locale du match) — cohérent avec
  le calendrier que les gens connaissent.
- **Phase à élimination directe** : pas de nul possible (le modèle le sait via
  l'absence de `group`). Les équipes placeholder (1A, W73…) sont ignorées tant que
  le tableau n'est pas connu — les pronos des 8es apparaîtront automatiquement.
- **Looker Studio** : importer data/history.csv dans un Google Sheet via
  IMPORTDATA("https://mondial.ninjads.fr/history.csv") — pour l'exposer, ajouter
  une route statique ou un alias Nginx vers data/history.csv.

## Le modèle en une phrase (pour /methode et LinkedIn)

Rating Elo par équipe mis à jour après chaque match (K=40, pondéré par l'écart de
buts), +50 points pour les pays hôtes en phase de groupes, probabilité de nul
décroissante avec l'écart de niveau, score probable dérivé de ~2,7 buts attendus
par match. Simple, explicable, falsifiable — c'est le but.
