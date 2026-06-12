// Modèle de pronostic — volontairement SIMPLE et TRANSPARENT.
// C'est un choix éditorial : chaque ingrédient est explicable en une phrase
// sur la page /methode. Pas de boîte noire.
//
// 1. Rating Elo par équipe (seed approximatif, mis à jour après chaque match)
// 2. Avantage "pays hôte" : +50 Elo pour MEX/USA/CAN pendant la phase de groupes
// 3. Proba de victoire : formule Elo classique 1 / (1 + 10^(-diff/400))
// 4. Proba de nul (phase de groupes) : 0.29 * exp(-|diff|/650)
// 5. Score probable : buts attendus dérivés des probas (mapping calibré CdM,
//    ~2.7 buts/match), arrondis au score entier le plus vraisemblable.

export const K_FACTOR = 40;        // K élevé : tournoi court, on veut réagir vite
export const HOME_BONUS = 50;      // bonus Elo pays hôte (groupes uniquement)
export const DRAW_BASE = 0.29;     // proba de nul max (équipes de même niveau)
export const DRAW_DECAY = 650;     // plus l'écart Elo grandit, plus le nul s'éloigne

export function winProbability(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

// Retourne { p1, pX, p2 } — probas victoire A / nul / victoire B
export function outcomeProbabilities(eloA, eloB, allowDraw) {
  const pRaw = winProbability(eloA, eloB);
  if (!allowDraw) return { p1: pRaw, pX: 0, p2: 1 - pRaw };
  const pX = DRAW_BASE * Math.exp(-Math.abs(eloA - eloB) / DRAW_DECAY);
  return { p1: pRaw * (1 - pX), pX, p2: (1 - pRaw) * (1 - pX) };
}

// Score probable : on répartit ~2.7 buts attendus selon le rapport de force,
// puis on prend l'arrondi cohérent avec l'issue prédite.
export function likelyScore(p1, pX, p2) {
  const TOTAL_XG = 2.7;
  const share = p1 + 0.5 * pX; // part "offensive" de l'équipe 1
  let g1 = Math.round(TOTAL_XG * share);
  let g2 = Math.round(TOTAL_XG * (1 - share));
  const outcome = pick(p1, pX, p2);
  if (outcome === "1" && g1 <= g2) g1 = g2 + 1;
  if (outcome === "2" && g2 <= g1) g2 = g1 + 1;
  if (outcome === "X") { const m = Math.max(1, Math.min(g1, g2)); g1 = m; g2 = m; }
  return [g1, g2];
}

export function pick(p1, pX, p2) {
  if (p1 >= pX && p1 >= p2) return "1";
  if (p2 >= pX && p2 > p1) return "2";
  return "X";
}

// Mise à jour Elo après résultat. result: 1 / 0.5 / 0 (du point de vue équipe A)
// Marge de victoire : multiplicateur doux log2(|diff buts|+1)
export function updateElo(eloA, eloB, goalsA, goalsB) {
  const expected = winProbability(eloA, eloB);
  const result = goalsA > goalsB ? 1 : goalsA < goalsB ? 0 : 0.5;
  const margin = Math.log2(Math.abs(goalsA - goalsB) + 1) || 1;
  const delta = K_FACTOR * margin * (result - expected);
  return [Math.round(eloA + delta), Math.round(eloB - delta)];
}
