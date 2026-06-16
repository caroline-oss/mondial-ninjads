#!/usr/bin/env node
// ============================================================
// scripts/update.mjs — LE cœur du système. À lancer en cron :
//   30 5 * * *  cd /var/www/mondial && node scripts/update.mjs
// (et optionnellement toutes les 2h les soirs de match pour le "live")
//
// Ce qu'il fait, dans l'ordre :
//  1. Fetch le calendrier + résultats openfootball (source publique)
//  2. Règle les pronos en attente dont le match est terminé (✅/❌)
//     → les pronos déjà émis ne sont JAMAIS modifiés (append-only)
//  3. Met à jour les ratings Elo avec les nouveaux résultats
//  4. Génère les pronos des matchs du jour (s'ils n'existent pas déjà)
//  5. Écrit data/site.json (consommé par la page) + data/history.csv
//     (à brancher sur Google Sheets / Looker Studio)
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { outcomeProbabilities, likelyScore, pick, updateElo, HOME_BONUS } from "../lib/elo.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const SOURCE = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const TZ = "Europe/Paris";

// --- Équipes (noms openfootball → fr / flag / elo seed) — copie JS du lib/teams.ts
const TEAMS = JSON.parse(fs.readFileSync(path.join(DATA, "teams.json"), "utf8"));

const readJson = (f, fallback) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")); }
  catch { return fallback; }
};
const writeJson = (f, obj) =>
  fs.writeFileSync(path.join(DATA, f), JSON.stringify(obj, null, 2));

const todayParis = () =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const addDays = (iso, n) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// "13:00 UTC-6" + date → heure de Paris "HH:MM"
function parisTime(date, time) {
  const m = /(\d{1,2}):(\d{2})\s*UTC([+-]\d+)/.exec(time || "");
  if (!m) return "—";
  const utc = new Date(Date.UTC(...date.split("-").map(Number).map((v, i) => (i === 1 ? v - 1 : v)), Number(m[1]) - Number(m[3]), Number(m[2])));
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(utc);
}

const matchId = (m) => `${m.date}_${m.team1}_${m.team2}`.replace(/\s+/g, "-");
const teamName = (t) => (typeof t === "string" ? t : t?.name ?? "");
const isReal = (name) => name in TEAMS;
const isGroupStage = (m) => Boolean(m.group);

// ------------------------------------------------------------------
async function main() {
  console.log(`[update] ${new Date().toISOString()}`);

  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`openfootball HTTP ${res.status}`);
  const { matches } = await res.json();

  const elo = readJson("elo.json", Object.fromEntries(Object.entries(TEAMS).map(([k, v]) => [k, v.elo])));
  const predictions = readJson("predictions.json", []); // append-only
  const settled = new Set(predictions.filter((p) => p.result).map((p) => p.id));
  const predicted = new Set(predictions.map((p) => p.id));

  // --- 2 & 3. Règlement des pronos + mise à jour Elo (matchs terminés, ordre chrono)
  const processedElo = new Set(readJson("elo_processed.json", []));
  for (const m of matches) {
    const [t1, t2] = [teamName(m.team1), teamName(m.team2)];
    const ft = m.score?.ft;
    if (!ft || !isReal(t1) || !isReal(t2)) continue;

    const id = matchId(m);
    // Mise à jour Elo (une seule fois par match)
    if (!processedElo.has(id)) {
      const [a, b] = updateElo(elo[t1], elo[t2], ft[0], ft[1]);
      elo[t1] = a; elo[t2] = b;
      processedElo.add(id);
    }
    // Règlement du prono
    if (predicted.has(id) && !settled.has(id)) {
      const p = predictions.find((x) => x.id === id);
      const actual = ft[0] > ft[1] ? "1" : ft[0] < ft[1] ? "2" : "X";
      p.result = { score: ft, outcome: actual, correct: p.pick === actual, exactScore: p.score[0] === ft[0] && p.score[1] === ft[1], settledAt: new Date().toISOString() };
      console.log(`  verdict ${t1} ${ft[0]}-${ft[1]} ${t2} → prono ${p.pick} ${p.result.correct ? "✅" : "❌"}`);
    }
  }

  // --- 4. Pronos du jour (jamais regénérés : un prono émis est figé)
  const today = todayParis();
  for (const m of matches) {
    if (m.date !== today) continue;
    const [t1, t2] = [teamName(m.team1), teamName(m.team2)];
    if (!isReal(t1) || !isReal(t2)) continue; // placeholders pas encore résolus
    const id = matchId(m);
    if (predicted.has(id)) continue;

    const bonus1 = TEAMS[t1].host && isGroupStage(m) ? HOME_BONUS : 0;
    const bonus2 = TEAMS[t2].host && isGroupStage(m) ? HOME_BONUS : 0;
    const { p1, pX, p2 } = outcomeProbabilities(elo[t1] + bonus1, elo[t2] + bonus2, isGroupStage(m));
    const choice = pick(p1, pX, p2);
    const confidence = Math.round(Math.max(p1, pX, p2) * 100);

    predictions.push({
      id, date: m.date, time: parisTime(m.date, m.time), round: m.round, group: m.group ?? null,
      ground: m.ground, team1: t1, team2: t2,
      eloAtPrediction: { [t1]: elo[t1] + bonus1, [t2]: elo[t2] + bonus2 },
      probs: { p1: +p1.toFixed(3), pX: +pX.toFixed(3), p2: +p2.toFixed(3) },
      pick: choice, score: likelyScore(elo[t1] + bonus1, elo[t2] + bonus2, 0), confidence,
      createdAt: new Date().toISOString(), // ← horodatage = la preuve
    });
    console.log(`  prono ${t1} vs ${t2} → ${choice} (${confidence}%)`);
  }

  // --- 5. Sorties
  writeJson("elo.json", elo);
  writeJson("elo_processed.json", [...processedElo]);
  writeJson("predictions.json", predictions);

  const done = predictions.filter((p) => p.result);
  const counter = {
    total: done.length,
    correct: done.filter((p) => p.result.correct).length,
    exact: done.filter((p) => p.result.exactScore).length,
  };
  const yesterday = addDays(today, -1);
  writeJson("site.json", {
    updatedAt: new Date().toISOString(),
    counter,
    today: predictions.filter((p) => p.date === today),
    yesterday: predictions.filter((p) => p.date === yesterday),
    history: [...predictions].sort((a, b) => b.date.localeCompare(a.date) || (a.time || "").localeCompare(b.time || "")),
  });

  // CSV → Google Sheets (IMPORTDATA) → Looker Studio
  const rows = [["date","heure","phase","equipe1","equipe2","prono","score_predit","confiance_pct","score_reel","verdict","score_exact","horodatage_prono"]];
  for (const p of predictions)
    rows.push([p.date, p.time, p.round, p.team1, p.team2, p.pick, p.score.join("-"), p.confidence,
      p.result ? p.result.score.join("-") : "", p.result ? (p.result.correct ? "OK" : "KO") : "en attente",
      p.result?.exactScore ? "OUI" : "", p.createdAt]);
  fs.writeFileSync(path.join(DATA, "history.csv"), rows.map((r) => r.join(";")).join("\n"));

  console.log(`[update] OK — compteur : ${counter.correct}/${counter.total} (${counter.exact} scores exacts)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
