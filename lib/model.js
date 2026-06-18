// Aktuarium — beregningsmodell for pleiekostnadsrapporten.
// Holdes bevisst identisk med klient-kalkulatoren (kalkulator.html) slik at
// tallene på skjerm og i PDF-rapporten alltid stemmer overens.
//
// VIKTIG: Dette er et forenklet, illustrativt anslag basert på offentlige
// gjennomsnittstall — ikke individuell finansiell rådgivning.

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function clampNum(v, min, max, fallback) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const HELSE_AAR = { god: 3, middels: 5, svekket: 8 };
const REGIONER = {
  "1.05": "Oslo og store byer",
  "1.0": "Mellomstor kommune",
  "0.92": "Mindre kommune / distrikt",
};
const HJEMME_TEKST = {
  hjemme: "Ønsker pleie hjemme",
  blandet: "Åpen for begge deler",
  institusjon: "Institusjon er greit",
};

export function computeReport(input = {}) {
  const alder = clampNum(input.alder, 40, 100, 60);
  const helse = HELSE_AAR[input.helse] ? input.helse : "middels";
  const formue = num(input.formue);
  const bolig = num(input.bolig);
  const inntekt = num(input.inntekt);
  const regionRaw = String(input.region);
  const region = REGIONER[regionRaw] ? Number(regionRaw) : 1.0;
  const hjemme = HJEMME_TEKST[input.hjemme] ? input.hjemme : "blandet";

  const careYears = HELSE_AAR[helse];
  const infl = 1.03;
  // Snitt-inflasjonsfaktor: pleie antas å starte ca. 5 år fram i tid.
  const inflFactor = Math.pow(infl, careYears / 2 + 5);
  const assets = formue + bolig;

  let privatYr = 75000 * 12 * region; // premium privat sykehjem
  let egenYr = 50000 * 12 * region; // egenfinansiert hjemmepleie
  if (hjemme === "hjemme") egenYr *= 1.1;
  const fribelop = 110000; // inntekt skjermet fra egenandel (anslag)
  const egenandelYr = Math.min(0.85 * Math.max(inntekt - fribelop, 0), 430000);

  const costPrivat = privatYr * careYears * inflFactor;
  const costEgen = egenYr * careYears * inflFactor;
  const costOff = egenandelYr * careYears * inflFactor;

  const scen = {
    egen: {
      navn: "Egenfinansiering (pleie hjemme)",
      aarlig: egenYr,
      cost: costEgen,
      remaining: Math.max(0, assets - costEgen),
    },
    offentlig: {
      navn: "Offentlig + egenandel",
      aarlig: egenandelYr,
      cost: costOff,
      remaining: Math.max(0, assets - costOff),
    },
    privat: {
      navn: "Privat pleie",
      aarlig: privatYr,
      cost: costPrivat,
      remaining: Math.max(0, assets - costPrivat),
    },
  };

  const keys = Object.keys(scen);
  const bestKey = keys.reduce((a, b) => (scen[a].remaining >= scen[b].remaining ? a : b));
  const worstKey = keys.reduce((a, b) => (scen[a].remaining <= scen[b].remaining ? a : b));
  const diff = scen[bestKey].remaining - scen[worstKey].remaining;

  return {
    input: {
      navn: (input.navn || "").toString().slice(0, 120),
      epost: (input.epost || "").toString().slice(0, 200),
      alder,
      helse,
      formue,
      bolig,
      inntekt,
      region,
      regionTekst: REGIONER[regionRaw] || REGIONER["1.0"],
      hjemme,
      hjemmeTekst: HJEMME_TEKST[hjemme],
    },
    careYears,
    assets,
    scen,
    bestKey,
    worstKey,
    diff,
  };
}

export function formatKr(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
}
