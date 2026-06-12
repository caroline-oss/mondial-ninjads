export default function MethodePage() {
    return (
      <div className="wrap">
        <h1>Le modèle</h1>
        <section style={{marginBottom: '40px'}}>
          <h2>Comment ça marche ?</h2>
          <p>On utilise un modèle Elo simple pour estimer la probabilité de victoire de chaque équipe.</p>
          <ul style={{marginLeft: '20px'}}>
            <li>Chaque équipe a un rating Elo</li>
            <li>On compare les ratings pour calculer win probability</li>
            <li>Après chaque match, on met à jour les ratings</li>
          </ul>
        </section>
        <a href="/" style={{color: 'var(--orange)', fontWeight: '600'}}>← Retour aux pronos</a>
      </div>
    );
  }