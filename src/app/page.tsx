import Link from "next/link";

export default function Home() {
  return (
    <div className="view-wrap">
      <div className="hero">
        <div>
          <div className="eyebrow">● Nu live in Amsterdam</div>
          <h1>
            Eén goed gesprek is meer waard dan <em>honderd</em> connecties.
          </h1>
          <p className="lead">
            Geef aan waarover je wilt sparren en wanneer je kunt lunchen. Wij koppelen je aan de
            juiste ondernemer of professional in jouw stad — en reserveren de tafel.
          </p>
          <div className="hero-ctas">
            <Link className="pill green big" href="/login">
              Plan mijn eerste power lunch →
            </Link>
          </div>
          <div className="stats">
            <div><b>60 min</b><span>per lunch, niet langer</span></div>
            <div><b>1-op-1</b><span>geen netwerkborrels</span></div>
            <div><b>0</b><span>heen-en-weer mailen</span></div>
          </div>
        </div>
        <div className="ticket">
          <div className="tag">Power Lunch bevestigd</div>
          <h3 className="serif">Donderdag, 12:30</h3>
          <div className="duo">
            <div className="av" style={{ background: "var(--green)" }}>SB</div>
            <span className="plus">&amp;</span>
            <div className="av" style={{ background: "var(--tomato)" }}>JV</div>
            <div style={{ fontSize: 14, marginLeft: 6 }}>
              <b>Sanne &amp; Jeroen</b>
              <br />
              <span style={{ color: "var(--muted)" }}>Fundraising · SaaS-groei</span>
            </div>
          </div>
          <div className="dash" />
          <div className="trow"><span>Restaurant</span><span>Bolenius</span></div>
          <div className="trow"><span>Stad</span><span>Amsterdam · Zuidas</span></div>
          <div className="trow"><span>Tafel</span><span>2 personen</span></div>
          <div className="trow"><span>Gespreksstarter</span><span>&quot;Seed of bootstrappen?&quot;</span></div>
        </div>
      </div>

      <section className="how" id="how">
        <h2 className="serif">Zo werkt het. Vier stappen, één lunch.</h2>
        <div className="steps">
          <div className="step"><div className="n">01</div><h4>Kies je onderwerpen</h4><p>Waar wil je over praten? Fundraising, hiring, AI, exit — maximaal vijf.</p></div>
          <div className="step"><div className="n">02</div><h4>Deel je beschikbaarheid</h4><p>Vink de lunchmomenten in de komende drie weken aan. Wij doen de agenda-puzzel.</p></div>
          <div className="step"><div className="n">03</div><h4>Stel een lunch voor</h4><p>Reageer op een antwoord dat je aanspreekt. Gaat de ander akkoord, dan staat de afspraak.</p></div>
          <div className="step"><div className="n">04</div><h4>Wij regelen de tafel</h4><p>Een restaurant dat past bij jullie gesprek, tijdslot en dieetwensen.</p></div>
        </div>
      </section>
      <footer>
        <span>© Power Lunch</span>
        <span>
          <Link href="/privacy">Privacy</Link>
        </span>
      </footer>
    </div>
  );
}
