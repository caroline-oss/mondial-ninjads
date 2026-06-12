import { frName, flagUrl } from "../lib/teams";

/* eslint-disable @next/next/no-img-element */

export type Prediction = {
  id: string;
  date: string;
  time: string;
  round: string;
  group: string | null;
  ground: string;
  team1: string;
  team2: string;
  probs: { p1: number; pX: number; p2: number };
  pick: "1" | "X" | "2";
  score: [number, number];
  confidence: number;
  createdAt: string;
  result?: {
    score: [number, number];
    outcome: "1" | "X" | "2";
    correct: boolean;
    exactScore: boolean;
  };
};

const pickLabel = (p: Prediction) =>
  p.pick === "X" ? "Match nul" : `Victoire ${frName(p.pick === "1" ? p.team1 : p.team2)}`;

function Flag({ team }: { team: string }) {
  const url = flagUrl(team);
  return url ? <img src={url} alt={`Drapeau ${frName(team)}`} loading="lazy" /> : null;
}

function FaceOff({ p, score }: { p: Prediction; score: [number, number] }) {
  return (
    <div className="face-off">
      <div className={`team ${p.pick === "1" ? "picked" : ""}`}>
        <Flag team={p.team1} />
        <span className="name">{frName(p.team1)}</span>
      </div>
      <div className="predicted-score">{score[0]}–{score[1]}</div>
      <div className={`team right ${p.pick === "2" ? "picked" : ""}`}>
        <span className="name">{frName(p.team2)}</span>
        <Flag team={p.team2} />
      </div>
    </div>
  );
}

/* ---------- Carte "prono du jour" ---------- */
export function MatchCard({ p }: { p: Prediction }) {
  return (
    <article className="match-card">
      <div className="match-meta">
        <span>{p.group ?? p.round} · {p.ground}</span>
        <span>{p.time} (Paris)</span>
      </div>
      <FaceOff p={p} score={p.score} />
      <div className="confidence">
        <div className="bar">
          <div className="fill" style={{ width: `${p.confidence}%` }} />
        </div>
        <div className="label">
          <span>Prono : {pickLabel(p)}</span>
          <span>{p.confidence}% de confiance</span>
        </div>
      </div>
    </article>
  );
}

/* ---------- Carte "verdict d'hier" ---------- */
export function VerdictCard({ p }: { p: Prediction }) {
  return (
    <article className="match-card">
      <div className="match-meta">
        <span>{p.group ?? p.round} · {p.ground}</span>
        <span>{p.date}</span>
      </div>
      <FaceOff p={p} score={p.result ? p.result.score : p.score} />
      <div className="verdict-line">
        {p.result ? (
          <>
            <span className={`badge ${p.result.correct ? "ok" : "ko"}`}>
              {p.result.correct ? "✓ Prono validé" : "✗ Raté"}
            </span>
            {p.result.exactScore && <span className="badge exact">Score exact !</span>}
            <span className="dim">
              Le modèle disait : {pickLabel(p)} ({p.confidence}%) — score prédit {p.score[0]}–{p.score[1]}
            </span>
          </>
        ) : (
          <span className="dim">Résultat en attente de mise à jour…</span>
        )}
      </div>
    </article>
  );
}

/* ---------- Tableau historique (la preuve) ---------- */
export function HistoryTable({ rows }: { rows: Prediction[] }) {
  return (
    <div className="table-scroll">
      <table className="history">
        <thead>
          <tr>
            <th>Date</th>
            <th>Match</th>
            <th>Prono</th>
            <th>Score prédit</th>
            <th>Conf.</th>
            <th>Résultat</th>
            <th>Verdict</th>
            <th>Prono émis le</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td className="mono">{p.date}</td>
              <td>{frName(p.team1)} – {frName(p.team2)}</td>
              <td>{pickLabel(p)}</td>
              <td className="mono">{p.score[0]}–{p.score[1]}</td>
              <td className="mono">{p.confidence}%</td>
              <td className="mono">{p.result ? `${p.result.score[0]}–${p.result.score[1]}` : "—"}</td>
              <td>
                {p.result ? (
                  <span className={`badge ${p.result.correct ? "ok" : "ko"}`}>
                    {p.result.correct ? "✓" : "✗"}
                    {p.result.exactScore ? " exact" : ""}
                  </span>
                ) : (
                  <span className="dim">en attente</span>
                )}
              </td>
              <td className="mono dim">{new Date(p.createdAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
