# Power Lunch

Zakelijk netwerken, één lunch tegelijk. Professionals geven aan waarover ze willen sparren en wanneer ze kunnen lunchen; Power Lunch koppelt ze en kiest een passend restaurant.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres, Auth met LinkedIn) · Vercel

## Wat er nu in zit (fase 1)

- Inloggen met LinkedIn (naam, foto en e-mail uit LinkedIn; de rest vult de gebruiker zelf in)
- Aanmelden in 7 stappen: profiel & branche → doelbranches (met suggesties en eigen toevoegingen) → onderwerpen → doel → beschikbaarheid (3 weken) → dieetwensen → profielvragen
- Matches met score op onderwerpen, branche, doelen en overlappende lunchmomenten
- Lunch voorstellen op een gezamenlijk moment, eventueel als reactie op een profielantwoord
- Ontvanger gaat akkoord of wijst af; bij akkoord kiest de server het restaurant op basis van beide profielen (onderwerpen + dieetwensen)
- Overzicht "Mijn lunches": voorstellen, gepland, verstuurd
- Privacy: allergie-informatie alleen met toestemming, nooit zichtbaar voor andere gebruikers (zie `public_profiles`-view)

Nog niet: automatisch reserveren, e-mails/agenda-uitnodigingen, betalen, beheerscherm. Zie *Volgende stappen*.

## Eenmalige setup

### 1. Supabase
1. Maak een project op [supabase.com](https://supabase.com) (regio: Frankfurt of Amsterdam/EU).
2. **SQL Editor** → plak en run `supabase/migrations/0001_init.sql`, daarna `supabase/seed.sql`.
3. **Project Settings → API**: kopieer `Project URL`, `anon` key en `service_role` key.

### 2. LinkedIn
1. Ga naar [linkedin.com/developers/apps](https://www.linkedin.com/developers/apps) → *Create app* (koppel een LinkedIn-bedrijfspagina).
2. Tab **Products** → vraag *Sign In with LinkedIn using OpenID Connect* aan.
3. Tab **Auth** → voeg als redirect-URL toe: `https://<jouw-project>.supabase.co/auth/v1/callback`.
4. Kopieer *Client ID* en *Client Secret*.
5. In Supabase: **Authentication → Providers → LinkedIn (OIDC)** → aanzetten en ID + secret plakken.
6. In Supabase: **Authentication → URL Configuration** → *Site URL* = je Vercel-domein; voeg `https://<domein>/auth/callback` en `http://localhost:3000/auth/callback` toe aan *Redirect URLs*.

### 3. Vercel
1. [vercel.com](https://vercel.com) → *Add New Project* → importeer deze repository.
2. Zet de drie variabelen uit `.env.example` onder **Environment Variables**.
3. Deploy.

### Lokaal draaien
```bash
cp .env.example .env.local   # vul de waarden in
npm install
npm run dev                  # http://localhost:3000
```

## Instellingen

Alles staat in `src/lib/config.ts`: actieve steden (`ACTIVE_CITIES`, nu alleen Amsterdam), branches, onderwerpen, dieetopties, lunchtijden en het aantal weken vooruit.

## Datamodel

| Tabel | Inhoud |
|---|---|
| `profiles` | profiel per gebruiker (alleen zelf leesbaar) |
| `public_profiles` (view) | wat anderen zien — zonder dieet/allergie |
| `availability` | lunchmomenten per gebruiker |
| `restaurants` | restaurants per stad, met onderwerpen, dieet-tags en reserveringssysteem |
| `lunches` | voorstellen en afspraken met status `voorgesteld → geaccepteerd → gereserveerd` |
| `skips` | overgeslagen profielen |

## Volgende stappen

1. **Beheerscherm** voor geaccepteerde lunches → handmatig reserveren en op `gereserveerd` zetten
2. **E-mail + agenda-uitnodiging** (Resend + .ics) bij voorstel, akkoord en reservering
3. **Automatisch reserveren** via Zenchef/Formitable-API voor partnerrestaurants (`booking_system`, `booking_ref`)
4. **Betalen** per lunch via Mollie
5. Meer steden aanzetten
