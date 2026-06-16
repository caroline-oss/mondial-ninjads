export default function MethodePage() {
  return (
    <div className="wrap">
      <header className="site-header">
        <div className="brand">ninjads<span>.</span> / mondial 2026</div>
      </header>

      <section className="section" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "40px" }}>Le modèle</h1>

        <article style={{ marginBottom: "60px" }}>
          <h2>Comment ça marche ?</h2>
          <p>On utilise <strong>ratings Elo + distribution probabiliste</strong> pour générer des pronos variés.</p>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li>Chaque équipe a un rating Elo (puissance estimée)</li>
            <li>On calcule la probabilité de victoire via la formule Elo standard</li>
            <li>On génère plusieurs scénarios de score possibles (1-0, 2-1, 3-2, etc.)</li>
            <li>Le prono = le scénario le plus probable</li>
          </ul>
        </article>

        <article style={{ marginBottom: "60px" }}>
          <h2>Paramètres</h2>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li><strong>K factor</strong>: 40 (poids des updates)</li>
            <li><strong>Home bonus</strong>: +50 Elo (sauf MEX/USA/CAN en phase groupes)</li>
            <li><strong>Probabilité de nul</strong>: 25% baseline, réduite si grosse différence Elo</li>
            <li><strong>Distribution de scores</strong>: 11 scénarios pondérés par les probabilités</li>
          </ul>
        </article>

        <article style={{ marginBottom: "60px" }}>
          <h2>Limites</h2>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li>❌ Pas de données sur absents/blessés</li>
            <li>❌ Pas de forme récente (Elo = historique long terme)</li>
            <li>❌ Pas de facteurs contextuels (météo, fatigue, homesickness)</li>
            <li>✅ Mais : transparent, réplicable, honnête sur les limites</li>
          </ul>
        </article>

        <article style={{ marginBottom: "60px" }}>
          <h2>Intégrité</h2>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li>✅ Pronos horodatés avant coup d'envoi</li>
            <li>✅ Aucune modification rétroactive</li>
            <li>✅ Historique complet et auditable</li>
          </ul>
        </article>

        <a href="/" style={{ color: "var(--orange)", fontWeight: "600", fontSize: "1.1rem" }}>
          ← Retour aux pronos
        </a>
      </section>
    </div>
  );
}