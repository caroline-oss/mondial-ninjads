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
          <p>On utilise un modèle <strong>Elo simple</strong> pour estimer la probabilité de victoire de chaque équipe.</p>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li>Chaque équipe a un rating Elo (puissance estimée)</li>
            <li>On compare les ratings pour calculer la probabilité de victoire</li>
            <li>Après chaque match, les ratings se mettent à jour</li>
            <li>Les scores probables sont basés sur ~2.7 xG/match</li>
          </ul>
        </article>

        <article style={{ marginBottom: "60px" }}>
          <h2>Paramètres clés</h2>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li><strong>K factor</strong>: 40 (sensibilité des mises à jour)</li>
            <li><strong>Home bonus</strong>: +50 Elo pour l'équipe à domicile (sauf USA/MEX/CAN en phase de groupes)</li>
            <li><strong>Probabilité de match nul</strong>: 0.29 baseline, ajustée par la différence Elo</li>
          </ul>
        </article>

        <article style={{ marginBottom: "60px" }}>
          <h2>Intégrité</h2>
          <ul style={{ marginLeft: "20px", marginBottom: "20px" }}>
            <li>✅ Pronos horodatés avant coup d'envoi</li>
            <li>✅ Aucune modification rétroactive</li>
            <li>✅ Historique complet disponible</li>
            <li>✅ Régénération auto chaque jour</li>
          </ul>
        </article>

        <article style={{ marginBottom: "60px" }}>
          <h2>Sources</h2>
          <ul style={{ marginLeft: "20px" }}>
            <li>Résultats des matchs: <a href="https://github.com/openfootball/worldcup.json" target="_blank" rel="noopener noreferrer">OpenFootball</a></li>
            <li>Drapeaux: <a href="https://flagcdn.com" target="_blank" rel="noopener noreferrer">FlagCDN</a></li>
          </ul>
        </article>

        <a href="/" style={{ color: "var(--orange)", fontWeight: "600", fontSize: "1.1rem" }}>
          ← Retour aux pronos
        </a>
      </section>
    </div>
  );
}