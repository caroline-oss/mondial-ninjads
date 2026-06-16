export const HOME_BONUS = 50;
export function pick(p1, pX, p2) {
  if (p1 > pX && p1 > p2) return "1";
  if (p2 > p1 && p2 > pX) return "2";
  return "X";
}
export function winProbability(eloA, eloB, homeBonus = 0) {
  const diff = eloA + homeBonus - eloB;
  return 1 / (1 + Math.pow(10, -diff / 400));
}

export function likelyScore(eloA, eloB, homeBonus = 0) {
  const wp = winProbability(eloA, eloB, homeBonus);
  const diff = Math.abs(eloA - eloB);
  
  // Score probables basés sur la différence Elo
  const scores = [
    // Victoire A
    { s: "1-0", p: wp * 0.20 },
    { s: "2-0", p: wp * 0.18 },
    { s: "2-1", p: wp * 0.15 },
    { s: "3-0", p: wp * 0.08 },
    { s: "3-1", p: wp * 0.06 },
    { s: "3-2", p: wp * 0.03 },
    { s: "4-0", p: wp * 0.02 },
    // Nul
    { s: "1-1", p: 0.12 },
    { s: "0-0", p: 0.08 },
    // Victoire B
    { s: "0-1", p: (1-wp) * 0.20 },
    { s: "0-2", p: (1-wp) * 0.18 },
    { s: "1-2", p: (1-wp) * 0.15 },
    { s: "0-3", p: (1-wp) * 0.08 },
    { s: "1-3", p: (1-wp) * 0.06 },
  ];
  
  // Retourne le score le plus probable
  return scores.reduce((a, b) => a.p > b.p ? a : b).s;
}

export function outcomeProbabilities(eloA, eloB, homeBonus = 0) {
  const wp = winProbability(eloA, eloB, homeBonus);
  const drawProb = 0.25 * Math.exp(-Math.abs(eloA - eloB) / 200);
  const loseProb = 1 - wp - drawProb;
  return {
    p1: Math.max(0.01, wp),
    pX: Math.max(0.01, drawProb),
    p2: Math.max(0.01, loseProb),
  };
}

export function updateElo(eloA, eloB, scoreA, scoreB, K = 40, homeBonus = 0) {
  const wp = winProbability(eloA, eloB, homeBonus);
  const outcome = scoreA > scoreB ? 1 : scoreA < scoreB ? 0.5 : 0;
  const newEloA = eloA + K * (outcome - wp);
  const newEloB = eloB + K * ((1 - outcome) - (1 - wp));
  return [Math.round(newEloA), Math.round(newEloB)];
}