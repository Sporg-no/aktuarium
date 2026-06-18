# Aktuarium — Landingsside-blueprint (norsk marked)

> Komplett, konverteringsoptimalisert landingsside klar til å overleveres til utvikler eller AI-byggeverktøy.
> All tekst er på norsk og tilpasset norske forhold (offentlig eldreomsorg, kommunale egenandeler, NOK, Finanstilsynet/Datatilsynet, SSB-data).

---

## 0. STRATEGISK TILPASNING TIL DET NORSKE MARKEDET (les dette først)

Den opprinnelige forretningsideen er bygget for det amerikanske markedet, der privat «long-term care insurance» er normen. **I Norge er virkeligheten en annen, og det endrer hele budskapet:**

| USA-premiss | Norsk virkelighet | Konsekvens for budskap |
|---|---|---|
| Privat pleieforsikring er hovedproduktet | Eldreomsorg er i hovedsak offentlig (kommunal) | Vinkelen er ikke «kjøp riktig forsikring», men «forstå gapet mellom hva det offentlige dekker og hva familien faktisk må betale» |
| Meglere tjener provisjon på poliser | Selgere av behandlings-/helseforsikring og spareprodukter tjener provisjon | Skjevheten finnes fortsatt — men den ligger hos forsikrings- og bankselgere |
| Folk frykter å stå uten dekning | Folk **tror feilaktig at «staten ordner alt»** | Den emosjonelle kroken er overraskelse: egenandeler, ventelister og formuestap |
| Premieøkninger skjult i kontrakter | Egenandel på sykehjem kan ta inntil **85 % av inntekten** + private plasser koster 40 000–90 000 kr/mnd | Konkrete norske tall skaper sjokket som driver handling |

**Norsk kjerneinnsikt (hele kampanjen hviler på denne):**
> De fleste nordmenn tror eldreomsorg er «gratis». Realiteten er inntektsbaserte egenandeler, lange ventelister, varierende kvalitet og en privat pleiemarked som kan spise opp arven på få år. Ingen gir familien et nøytralt regnestykke — fordi alle som svarer, selger noe.

**Hvorfor nå (norsk kontekst):**
- **Eldrebølgen**: SSB anslår at antallet personer over 80 år omtrent dobles fram mot 2040.
- **Bemanningskrise**: Helsepersonellkommisjonens rapport «Tid for handling» (NOU 2023:4) varsler at familier må forvente å bidra mer selv.
- **«Bo trygt hjemme»-reformen** flytter mer ansvar til hjemmet og pårørende.
- Voksende privat pleiemarked (f.eks. private sykehjem og bofellesskap) uten nøytral prissammenligning.

**Produktnavn:** Aktuarium — «aktuar» (forsikringsmatematiker) + objektivitet. Navnet fungerer like godt på norsk.

---

## 1. SIDESTRUKTUR & WIREFRAME

Mobil-først, én sammenhengende scroll. Seksjonsrekkefølge optimalisert for kald trafikk fra Facebook/Google/redaksjonelt innhold.

```
┌─────────────────────────────────────────┐
│  TOPPMENY (sticky)                        │
│  Logo            Slik funker det · Priser │
│                  · FAQ   [Start gratis →] │
├─────────────────────────────────────────┤
│  HERO (delt 60/40)                        │
│  Venstre: Tittel + undertittel + CTA      │
│           + tillitslinje                  │
│  Høyre:   Skjermbilde av sammenligning    │
├─────────────────────────────────────────┤
│  TILLITSSTRIPE (logoer + tall + sitat)    │
├─────────────────────────────────────────┤
│  PROBLEM / SMERTE                         │
├─────────────────────────────────────────┤
│  LØSNING (med produkt-preview)            │
├─────────────────────────────────────────┤
│  SLIK FUNKER DET (3 steg)                 │
├─────────────────────────────────────────┤
│  FUNKSJONER / FORDELER (6 blokker)        │
├─────────────────────────────────────────┤
│  SOSIALT BEVIS (testimonials + case)      │
├─────────────────────────────────────────┤
│  PRISER (3 nivåer)                        │
├─────────────────────────────────────────┤
│  FOR RÅDGIVERE (white-label-bånd)         │
├─────────────────────────────────────────┤
│  FAQ                                       │
├─────────────────────────────────────────┤
│  AVSLUTTENDE CTA (med garanti)            │
├─────────────────────────────────────────┤
│  FOOTER                                    │
└─────────────────────────────────────────┘
```

---

## 2. ABOVE THE FOLD — HERO

**Layout:** Delt skjerm 60/40 på desktop (tekst venstre, visuell høyre). På mobil stables de: tittel → CTA → bilde. Lys, rolig bakgrunn (varm offwhite #FAF7F2). Rikelig luft. Ingen video over folden (lastetid).

**Hovedtittel (H1):**
> ## Tror du staten dekker alt når mor eller far trenger pleie?
> ### Tallene sier noe annet.

**Alternativ tittel for A/B-test (B-variant):**
> ## Hva koster det egentlig å bli gammel i Norge — og hvem betaler?

**Undertittel:**
> Aktuarium er den uavhengige kalkulatoren som regner ut hva eldreomsorg faktisk vil koste familien din — offentlig plass, hjemmetjenester eller privat pleie. Vi selger ingen forsikring og tar ingen provisjon. Bare tallene.

**Hero-bilde (beskrivelse til designer):**
Et rent skjermbilde/mockup av Aktuariums sammenligningsmatrise på en bærbar PC eller nettbrett. Tre kolonner side om side: **«Egenfinansiering»**, **«Offentlig + egenandel»**, **«Privat pleie»**, med en tydelig 20-års kostnadskurve og en sluttsum i kroner («Igjen til familien etter 20 år»). Bruk realistiske, men anonymiserte norske tall (f.eks. «Anne, 58 år, Bærum, 4,2 mill. i formue»). Varme, tillitsvekkende farger — ikke teknisk/kald. Skal kunne forstås på 3 sekunder.

**Primær CTA-knapp:**
> **[ Regn ut min families situasjon — gratis ]**
- Stor, høy kontrast (dyp grønnblå #0E5C5B på offwhite). Avrundede hjørner. Full bredde på mobil.
- Mikrokopi under knappen: *«Tar 4 minutter. Ingen kortinfo. Ingen selger ringer.»*

**Sekundær CTA (tekstlenke ved siden av):**
> Se et eksempel på rapporten →

**Tillitselement i hero (rett under CTA):**
> ⭐️⭐️⭐️⭐️⭐️ «Endelig et regnestykke uten en selger på andre siden.»
> *Brukt av over 1 200 norske familier · Data fra SSB, Helsedirektoratet og kommunale satser*

---

## 3. TILLITSSTRIPE

Tynn horisontal stripe rett under hero. Lys grå bakgrunn.

**Logoer/merker (type aktører som bygger troverdighet i Norge):**
- «Data fra SSB» · «Helsenorge» · «Helsedirektoratet» · «Kommunale egenandelssatser»
- Personvernmerke: «GDPR · Data lagres i Norge/EU · Datatilsynet-kompatibel»
- (Når reelle: logoer fra uavhengige rådgiverfirmaer og evt. pensjonistforbund/interesseorg.)

**Nøkkeltall (tre store tall med liten forklaring):**
| 80 080 kr | 85 % | 0 kr |
|---|---|---|
| ca. kostnad/år for omfattende hjemmehjelp privat | inntil så mye av inntekten kan gå til egenandel på sykehjem | i provisjon — vi tjener aldri på hva du velger |

**Kort sitat:**
> «Jeg trodde vi var trygge. Aktuarium viste at vi manglet 1,1 millioner i planen vår.» — Bruker, 61 år

---

## 4. PROBLEM / SMERTE-SEKSJON

**Seksjonstittel:**
> ## Alle som gir deg svar, har noe å selge
> Forsikringsselgeren tjener provisjon. Banken vil ha sparepengene dine. Det private sykehjemmet vil ha plassen fylt. Og det offentlige forteller deg sjelden hva du faktisk må betale selv.

**Smertepunkter (4 punkter med ikon):**

- **🏥 «Staten ordner alt» — helt til regningen kommer.**
  Sykehjemsplass koster egenandel basert på inntekt: opptil 75–85 % av inntekten din over et visst nivå. Pensjon, leieinntekter og avkastning kan forsvinne i egenandel.

- **⏳ Ventelistene er lange, og kvaliteten varierer.**
  Mens dere venter på plass, må familien ofte betale for hjemmehjelp, dagsenter eller privat pleie selv — uten at noen har fortalt hva det summerer seg til.

- **💸 Privat pleie kan spise opp arven på få år.**
  Private sykehjems- og bofellesskapsplasser koster typisk 40 000–90 000 kr i måneden. Få familier har regnet på hva 3–5 år med slik pleie gjør med formuen og arven.

- **🤐 Ingen gir deg det hele bildet.**
  Det finnes ingen nøytral oversikt som sammenligner egenfinansiering, offentlig tilbud med egenandel og privat pleie — side om side, med dine egne tall.

**Visuelt element:** En enkel illustrasjon/diagram: en familie i midten omgitt av fire piler fra «Forsikringsselger», «Bank», «Privat pleieaktør» og «Det offentlige» — alle peker innover, ingen snakker sammen. Underteksten: «Fire kilder. Fire agendaer. Null helhet.»

---

## 5. LØSNING — OVERSIKT

**Seksjonstittel:**
> ## Ett nøytralt regnestykke. Dine tall. Null skjult agenda.

**Verdiløfte:**
> Aktuarium henter offentlige data — SSB-kostnader, kommunale egenandelssatser, ventetidsstatistikk og aktuartabeller — og regner ut hva hver vei faktisk koster familien din over 20 år. Du svarer på noen spørsmål om helse, økonomi og bosted. Vi gir deg en lettlest rapport du kan dele med familien og en uavhengig rådgiver.

**Hovedfordeler (3–4 punkter):**
- **Du ser sannheten i kroner.** Hva hver vei koster, og hva som er igjen til familien etter 20 år.
- **Du slipper salgspresset.** Vi tar ingen provisjon og selger ingen forsikring. Inntekten vår er kun det du betaler oss.
- **Du får handlingsrom mens du fortsatt kan velge.** Beslutninger tatt i ro er bedre enn beslutninger tatt etter et fall eller en diagnose.

**Demo/preview:** Stort skjermbilde av sammenligningsmatrisen + en knapp «Se eksempelrapport (PDF)». Vis at rapporten bryter regnestykket ned i lesbare steg.

---

## 6. SLIK FUNKER DET (PROSESS)

**Seksjonstittel:**
> ## Fra forvirring til klarhet på 4 minutter

**Steg (3 steg, ikon/illustrasjon over hvert):**

1. **Fortell oss om situasjonen** — Alder, helse, formue, bolig og kommune. Enkle spørsmål, ingen sensitive detaljer lagres lenger enn nødvendig.

2. **Vi regner — på offentlige data** — Aktuarium sammenligner egenfinansiering, offentlig tilbud med egenandel og privat pleie. Vi tar med prisvekst, formuesuttak og dekningshull selgere hopper over.

3. **Du får rapporten — klar til å dele** — En lettlest PDF som viser hva hver vei koster og hva som er igjen til familien. Del den trygt med søsken, foreldre eller en uavhengig rådgiver.

**Visuell behandling:** Horisontal tidslinje med tre nummererte sirkler og enkle linjeikoner (skjema → kalkulator → dokument). På mobil vertikal stabling.

---

## 7. FUNKSJONER / FORDELER

**Seksjonstittel:**
> ## Bygget for å gi deg svar — ikke selge deg noe

**Funksjonsblokker (6 stk, 2x3 rutenett på desktop, 1 kolonne mobil):**

- **⚖️ Side-om-side-matrise**
  Egenfinansiering vs. offentlig + egenandel vs. privat pleie. Alt i kroner, over 20 år.

- **📈 Realistisk prisvekst innebygd**
  Vi regner inn forventet kostnadsvekst og formuesuttak — ikke dagens pris fryst i tid.

- **🇳🇴 Norske, lokale tall**
  Kommunale egenandelssatser og regionale pleiekostnader, ikke generiske gjennomsnitt.

- **🧾 Lettlest familierapport (PDF)**
  Laget for å deles ved kjøkkenbordet — og med rådgiver, søsken eller foreldre.

- **🔒 Personvern på norsk**
  Data lagres i Norge/EU, i tråd med GDPR. Vi selger aldri data videre.

- **🔄 Årlig oppdatering**
  Helse, formue eller kommunale satser endrer seg. Abonnenter får planen oppdatert automatisk.

---

## 8. SOSIALT BEVIS

**Seksjonstittel:**
> ## Familier som endelig fikk oversikt

**Testimonials (3 detaljerte — bruk som plassholder til ekte foreligger):**

- **Testimonial 1:**
  > «Vi hadde utsatt hele samtalen i årevis. Aktuarium gjorde det til et regnestykke i stedet for en krangel. Vi delte rapporten med begge søsknene mine samme kveld.»
  > **Kari Nordahl, 59 — datter og pårørende, Trondheim**
  > *Foto: kvinne ca. 60 år, varmt smil, hjemlig bakgrunn.*

- **Testimonial 2:**
  > «Som honorarbasert rådgiver lever jeg av å være objektiv. Aktuarium-rapporten er beviset jeg legger på bordet — kunden ser at jeg ikke har noen agenda.»
  > **Anders Holt, 47 — uavhengig finansrådgiver, Oslo**
  > *Foto: mann i dress, kontormiljø, tillitsvekkende.*

- **Testimonial 3:**
  > «Jeg trodde pappas pensjon dekket sykehjemmet. Egenandelen tok nesten alt. Skulle ønske vi hadde regnet på dette to år tidligere.»
  > **Mona Berg, 54 — pårørende, Stavanger**
  > *Foto: kvinne ca. 55 år, ettertenksom, utendørs.*

**Alternativt sosialt bevis:**
- **Case-resultat (boks):** «Familien Eide oppdaget et gap på 1,1 mill. — og justerte planen før, ikke etter, en diagnose.»
- **Delingsmetrikk:** «7 av 10 brukere deler rapporten med familie eller rådgiver innen en uke.»
- (Når aktuelt) omtale i Dinside, E24, Pengenytt eller liknende.

---

## 9. PRISER

**Seksjonstittel:**
> ## Betal én gang, eller hold planen oppdatert. Aldri provisjon.

**Prisnivåer (3 kort, midterste fremhevet):**

| **Engangsrapport** | **Familieabonnement** ⭐ MEST POPULÆR | **For rådgivere (white-label)** |
|---|---|---|
| **499 kr** engangs | **199 kr / mnd** | **Fra 12 000 kr / år** |
| Komplett sammenligning + PDF-rapport | Alt i engangsrapporten + årlige oppdateringer når helse, formue eller satser endrer seg | Din logo på rapportene + ubegrenset bruk til klienter |
| **[ Kjøp rapport ]** | **[ Start abonnement ]** | **[ Book demo ]** |
| *Best for: deg som vil ha klarhet nå* | *Best for: familier midt i en beslutning* | *Best for: uavhengige finansrådgivere, formuesforvaltere, arveadvokater* |

**Mikrokopi under tabellen:** *«Alle priser inkl. mva. Ingen binding på abonnement — si opp når som helst.»*

---

## 10. FOR RÅDGIVERE (white-label-bånd)

Eget, visuelt avvikende bånd (mørkere bakgrunn) som taler til distribusjonskanalen.

**Tittel:**
> ## Selger du objektivitet? Gi kundene beviset.
> Honorarbaserte rådgivere, formuesforvaltere og arveadvokater bruker Aktuarium-rapporten som det nøytrale grunnlaget for samtalen om pleie og arv. Din logo, våre tall, null provisjonsmistanke.

**CTA:** **[ Se white-label-løsningen ]**

---

## 11. FAQ

**Seksjonstittel:**
> ## Spørsmål familier stiller oss

1. **Selger dere forsikring eller tar provisjon?**
   Nei. Vi tjener kun på det du betaler for rapporten eller abonnementet. Vi har ingen avtaler med forsikringsselskap, banker eller pleieaktører. Det er hele poenget.

2. **Er dette finansiell rådgivning?**
   Nei. Aktuarium er et beslutningsverktøy som viser deg tallene basert på offentlige data og dine opplysninger. For konkrete råd anbefaler vi at du tar rapporten med til en uavhengig, honorarbasert rådgiver — den er laget for nettopp det.

3. **Hvor kommer tallene fra?**
   Fra offentlige kilder: SSB, Helsedirektoratet, kommunale egenandelssatser og anerkjente aktuartabeller. Vi viser kildene i rapporten, slik at du kan etterprøve dem.

4. **Hva skjer med personopplysningene mine?**
   De lagres trygt i Norge/EU i tråd med GDPR, brukes kun til å lage din rapport, og selges aldri videre. Du kan be om sletting når som helst.

5. **Hva om jeg ikke vet de eksakte tallene for formue eller helse?**
   Det går helt fint — du kan bruke anslag, og verktøyet viser hvordan resultatet endrer seg. Du kan oppdatere når du vet mer.

6. **Er dette bare for rike?**
   Nei. Jo mindre buffer en familie har, jo viktigere er det å vite hva egenandeler og ventetid faktisk koster. Verktøyet er nyttig på alle formuesnivåer.

7. **Kan jeg bruke dette for foreldrene mine, ikke meg selv?**
   Ja. Mange av brukerne våre er voksne barn som planlegger på vegne av aldrende foreldre. Rapporten er laget for å deles mellom generasjoner.

---

## 12. AVSLUTTENDE CTA

**Layout:** Full bredde, dyp grønnblå bakgrunn, sentrert tekst.

**Tittel:**
> ## De beste pleiebeslutningene tas i ro — ikke etter et fall.
> Få oversikten mens dere fortsatt kan velge.

**Støttetekst:**
> 4 minutter. Ingen kortinformasjon for å se det første resultatet. Ingen selger ringer deg.

**CTA-knapp:**
> **[ Regn ut min families situasjon — gratis ]**

**Risikoreduksjon (garanti):**
> 💯 **14 dagers full pengene-tilbake-garanti** på rapport og abonnement. Er du ikke tryggere på valget, får du pengene tilbake — uten spørsmål.

**Sekundær CTA:**
> Eller last ned eksempelrapporten først →

---

## 13. FOOTER

**Selskapsinfo:** Aktuarium AS · Org.nr. [xxx xxx xxx] · [Adresse] · kontakt@aktuarium.no

**Lenker:**
- Slik funker det · Priser · For rådgivere · FAQ · Blogg/Ressurser
- Personvernerklæring · Vilkår · Cookies · Tilgjengelighetserklæring (WCAG)

**Sosiale medier:** Facebook · LinkedIn · YouTube (de tre kanalene med dokumentert engasjement i målgruppen)

**Juridisk bunntekst:**
> Aktuarium gir beslutningsstøtte basert på offentlige data og leverer ikke individuell finansiell rådgivning i henhold til finansforetaksloven. Tallene er anslag og kan avvike fra faktiske kostnader.

---

## COPY-RETNINGSLINJER

- **Tone:** Rolig, etterrettelig, varm autoritet. Vi er familiens nøytrale alliert — aldri skremmende, aldri selgende. Snakk *med* leseren, ikke *til* dem.
- **Lesenivå:** Klart, dagligdags norsk (tilsvarende «8. klasse»-nivå). Korte setninger. Unngå sjargong; forklar «egenandel», «formuesuttak» o.l. i kontekst.
- **SEO-nøkkelord (vev inn naturlig):** *hva koster sykehjem, egenandel sykehjem, eldreomsorg kostnad, privat sykehjem pris, planlegge eldreomsorg, pleie av foreldre økonomi, langtidspleie Norge, dekker staten sykehjem.*
- **Skannbarhet:** Punktlister, korte avsnitt (maks 2–3 setninger), tydelige mellomtitler, ett budskap per seksjon.
- **Tall i kroner:** Bruk alltid konkrete norske kronebeløp framfor abstrakte begreper — det er kronene som skaper handling.

---

## TEKNISKE NOTATER

- **Mobil-først:** Alle seksjoner testes på mobil først. Hero-CTA skal være synlig uten scroll på mobil.
- **Lastetid:** Ingen video over folden. Komprimer hero-bilde (WebP, lazy-load alt under folden). Mål: LCP < 2,5 s.
- **Tilgjengelighet:** Høy kontrast, store klikkflater (målgruppen er 50–67+), WCAG 2.1 AA. Skriftstørrelse min. 18 px brødtekst.
- **Sporing:** GDPR-vennlig samtykkebanner (Datatilsynet-kompatibel). Mål konvertering på CTA-klikk og fullført kalkulator.
- **Skjema:** Vis første kalkulatorresultat *før* e-post kreves (reduserer frafall), be om e-post for å låse opp full rapport.

### Anbefalte A/B-tester (prioritert)
1. **Hovedtittel:** «Tror du staten dekker alt …» (A) vs. «Hva koster det egentlig å bli gammel …» (B).
2. **CTA-tekst:** «Regn ut min families situasjon» vs. «Se hva pleie vil koste oss».
3. **Pris-anker:** Vis engangs (499 kr) først vs. abonnement (199 kr/mnd) først.
4. **Sosialt bevis i hero:** Stjernesitat vs. brukertall («1 200+ familier»).
5. **Risikoreduksjon:** «14 dagers garanti» vs. «Ingen kortinfo for å starte».
```
