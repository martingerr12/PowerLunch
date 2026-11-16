export default function PrivacyPage() {
  return (
    <div className="view-wrap" style={{ maxWidth: 720, margin: "0 auto 80px" }}>
      <h2 className="serif" style={{ fontSize: 36, marginBottom: 16 }}>Privacy</h2>
      <div className="notice">
        Concept — laat deze tekst juridisch controleren voordat Power Lunch live gaat.
      </div>
      <div style={{ marginTop: 20, display: "grid", gap: 14, fontSize: 15 }}>
        <p>Via LinkedIn ontvangen we alleen je naam, profielfoto en e-mailadres. Functie, bedrijf, branche en voorkeuren vul je zelf in.</p>
        <p>Andere gebruikers zien je naam, foto, functie, bedrijf, branche, onderwerpen en je antwoorden. Je e-mailadres, dieetwensen en allergie-informatie zien zij nooit.</p>
        <p>Allergie-informatie bewaren we alleen met jouw toestemming en delen we uitsluitend met het restaurant van je lunch.</p>
        <p>Je kunt je account en alle gegevens op elk moment laten verwijderen.</p>
      </div>
    </div>
  );
}
