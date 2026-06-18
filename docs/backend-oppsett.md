# Backend-oppsett — rapport på e-post

Denne mappen inneholder en serverløs funksjon som beregner pleiekostnadsrapporten,
lager en PDF og sender den til brukeren via e-post.

```
api/generate-report.js   ← Vercel-funksjon (POST-endepunkt)
lib/model.js             ← beregningsmodell (delt logikk med kalkulatoren)
lib/pdf.js               ← bygger PDF-en (pdfkit)
package.json             ← avhengigheter (pdfkit, resend)
vercel.json              ← funksjonsinnstillinger
.env.example             ← mal for miljøvariabler
```

## Slik kobler du det opp (ca. 15 min)

### 1. Resend (e-post)
1. Opprett konto på **https://resend.com** (gratis nivå holder i starten).
2. **Verifiser et avsenderdomene** (Domains → Add Domain), f.eks. `aktuarium.no`.
   Legg inn DNS-postene Resend oppgir. *(Vil du teste raskt før domenet er klart,
   kan du bruke avsender `Aktuarium <onboarding@resend.dev>` — fungerer kun til deg selv.)*
3. Lag en **API-nøkkel** (API Keys → Create) og kopier den (`re_...`).

### 2. Vercel (kjør funksjonen)
1. Opprett konto på **https://vercel.com** og koble til GitHub.
2. **Import Project** → velg `Sporg-no/aktuarium` → behold standardinnstillingene
   (Vercel oppdager `api/`-mappen og `package.json` automatisk, ingen build trengs).
3. Under **Environment Variables**, legg inn:
   | Navn | Verdi |
   |------|-------|
   | `RESEND_API_KEY` | nøkkelen fra Resend |
   | `MAIL_FROM` | `Aktuarium <rapport@aktuarium.no>` (ditt verifiserte domene) |
   | `ALLOW_ORIGIN` | *(valgfritt)* `https://sporg-no.github.io` for å låse CORS |
4. **Deploy**. Du får et domene, f.eks. `https://aktuarium.vercel.app`.

### 3. Koble kalkulatoren til endepunktet
Du har to valg:

**A) Enklest — host hele siden på Vercel.**
Da ligger både siden og `/api/...` på samme domene. La `API_BASE` stå tom i
`kalkulator.html`. (Du kan da slå av GitHub Pages.)

**B) Behold siden på GitHub Pages.**
Åpne `kalkulator.html`, finn `var API_BASE = "";` øverst i `<script>`, og sett den
til Vercel-domenet ditt:
```js
var API_BASE = "https://aktuarium.vercel.app";
```
Commit og push. (CORS er allerede håndtert i funksjonen.)

### 4. Test
Gå til kalkulatoren, fyll ut, og bruk «Send meg rapporten» nederst i resultatet.
Du skal få en e-post med PDF-vedlegg innen sekunder. Sjekk også søppelpost første gang.

## Senere: krev betaling først (Stripe)
Flyten er klargjort for dette. Når du vil ta betalt:
1. Legg til Stripe Checkout (en `api/create-checkout.js` som sender spørreskjema-
   svarene som `metadata`).
2. Lag en webhook `api/stripe-webhook.js` som ved `checkout.session.completed`
   kaller samme `computeReport` + `buildPdf` + Resend som i dag.
3. Bytt «Send meg rapporten»-knappen til å gå via betaling i stedet for å kalle
   `/api/generate-report` direkte.

Si fra, så setter jeg opp Stripe-delen.

## Lokal kjøring (valgfritt)
```bash
npm install
npm i -g vercel
vercel dev        # kjører api/ lokalt på http://localhost:3000
```
Husk en lokal `.env` (kopi av `.env.example`) med ekte nøkler.
