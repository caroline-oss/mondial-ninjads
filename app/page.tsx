import fs from "node:fs";
import path from "node:path";
import { MatchCard, VerdictCard, HistoryTable, type Prediction } from "../components/cards";

// La page se régénère au plus toutes les 15 min — le cron met à jour data/site.json
export const revalidate = 900;

type SiteData = {
  updatedAt: string;
  counter: { total: number; correct: number; exact: number };
  today: Prediction[];
  yesterday: Prediction[];
  history: Prediction[];
};

function loadData(): SiteData {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "site.json"), "utf8"));
  } catch {
    return { updatedAt: "", counter: { total: 0, correct: 0, exact: 0 }, today: [], yesterday: [], history: [] };
  }
}

export default function Page() {
  const { updatedAt, counter, today, yesterday, history } = loadData();
  const pct = counter.total ? Math.round((counter.correct / counter.total) * 100) : 0;
  const todayFr = new Date().toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="wrap">
      <header className="site-header">
        <div className="brand">ninjads<span>.</span> / mondial 2026</div>
        <div className="header-date">{todayFr}</div>
      </header>

      <section className="hero">
        <h1>Le Mondial, raconté <em>par la data</em></h1>
        <p>
          Chaque jour, un modèle 100% transparent pronostique les matchs — et chaque
          prono est horodaté et figé avant le coup d&apos;envoi. Pas de réécriture de
          l&apos;histoire : le compteur dit la vérité.
        </p>
      </section>

      <div className="scoreboard" role="status" aria-label="Compteur de réussite du modèle">
        <div className="led">
          {counter.correct}/{counter.total}
          <small>pronos validés</small>
        </div>
        <div className="led">
          {pct}%
          <small>de réussite</small>
        </div>
        <div className="led">
          {counter.exact}
          <small>scores exacts</small>
        </div>
        {updatedAt && (
          <div className="sub">
            maj {new Date(updatedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" })}
          </div>
        )}
      </div>

      <section className="section" id="aujourdhui">
        <h2>Les pronos du jour</h2>
        <p className="section-sub">Générés par le modèle ce matin, avant les matchs. Heures de Paris.</p>
        {today.length ? (
          <div className="cards">{today.map((p) => <MatchCard key={p.id} p={p} />)}</div>
        ) : (
          <p className="empty">Pas de match aujourd&apos;hui — le modèle se repose (lui aussi).</p>
        )}
      </section>

      <section className="section" id="hier">
        <h2>Hier : le modèle avait-il raison ?</h2>
        <p className="section-sub">Prono d&apos;avant-match contre score réel.</p>
        {yesterday.length ? (
          <div className="cards">{yesterday.map((p) => <VerdictCard key={p.id} p={p} />)}</div>
        ) : (
          <p className="empty">Pas de match hier.</p>
        )}
      </section>

      <section className="section" id="historique">
        <h2>L&apos;historique complet</h2>
        <p className="section-sub">
          Tous les pronos émis depuis le début du tournoi, avec leur horodatage. Rien n&apos;est
          modifié après coup — c&apos;est la règle du jeu.
        </p>
        {history.length ? <HistoryTable rows={history} /> : <p className="empty">Le tournoi commence — premiers pronos imminents.</p>}
        <p className="method-note">
          Modèle : ratings Elo mis à jour après chaque match + avantage pays hôte + probabilité
          de nul en phase de groupes. Méthode complète bientôt sur /methode.
        </p>
      </section>

      <aside className="book-note">
        Comment transformer des données brutes en histoire qu&apos;on a envie de suivre ?
        C&apos;est exactement le sujet de mon livre sur la data analytics et le storytelling par
        les dashboards, <a href="https://www.editions-eni.fr" rel="noopener">disponible aux Éditions ENI</a>.
        Ce site en est la démo grandeur nature.
      </aside>
    </div>
  );
}
