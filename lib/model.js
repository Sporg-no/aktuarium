// Aktuarium — beregningsmodell for pleiekostnadsrapporten (v2).
// Bygger på verifiserte norske 2025/2026-satser. Holdes bevisst identisk med
// klient-kalkulatoren (kalkulator.html) slik at skjerm og PDF alltid stemmer.
//
// KILDER (sjekket juni 2026):
// - Grunnbeløp 1G = 130 160 kr fra 1. mai 2025 (NAV).
// - Langtids sykehjem, egenandel: 75 % av inntekt inntil 1G (minus fribeløp
//   10 450 kr/år) + 85 % av inntekt over 1G (Lovdata SF 2011-12-16-1349 m/
//   endring 2024-12-16-3180; Helsedirektoratet fortolkning 2025).
// - Hjemmesykepleie (medisinsk hjelp/personlig stell) er gratis; kun praktisk
//   bistand har egenandel (inntekt < 2G: statlig maks ~250 kr/mnd).
// - Privat hjelp hjemme: ~500–700 kr/t (markedsanslag, private leverandører).
// - Privat institusjon/bofellesskap: månedspris er markedsanslag.
//
// VIKTIG: Forenklet, illustrativt anslag — ikke individuell finansiell rådgivning.

const G = 130160; // folketrygdens grunnbeløp (1G), per 1. mai 2025
const FRIBELOP_LANGTID = 10450; // årlig fribeløp, langtidsopphold
const TIMEPRIS_PRIVAT = 600; // kr/t privat praktisk bistand (markedsanslag)
const PRIVAT_INST_MND = 75000; // kr/mnd privat institusjon/bofellesskap (markedsanslag)
const INFLASJON = 1.03; // antatt årlig kostnadsvekst

const HELSE_AAR = { god: 3, middels: 5, svekket: 8 };
const BEHOV = {
  lett: { timer: 4, tekst: "Lett behov (~4 t/uke)" },
  middels: { timer: 12, tekst: "Middels behov (~12 t/uke)" },
  omfattende: { timer: 40, tekst: "Omfattende / heldøgn" },
};
const REGIONER = {
  "1.05": "Oslo og store byer",
  "1.0": "Mellomstor kommune",
  "0.92": "Mindre kommune / distrikt",
};

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
function clampNum(v, min, max, fallback) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Årlig egenandel ved langtidsopphold på sykehjem (av inntekt, ikke formue).
export function egenandelLangtid(inntekt) {
  const del1 = 0.75 * Math.max(Math.min(inntekt, G) - FRIBELOP_LANGTID, 0);
  const del2 = 0.85 * Math.max(inntekt - G, 0);
  return del1 + del2;
}

// Årlig egenandel for praktisk bistand i hjemmet (hjemmesykepleie er gratis).
function praktiskBistandAarlig(inntekt) {
  if (inntekt < 2 * G) return 250 * 12; // statlig maks for inntekt < 2G (anslag 2025)
  return 1500 * 12; // over 2G: kommunal sats (anslag)
}

export function computeReport(input = {}) {
  const alder = clampNum(input.alder, 40, 100, 60);
  const helse = HELSE_AAR[input.helse] ? input.helse : "middels";
  const behovKey = BEHOV[input.behov] ? input.behov : "middels";
  const formue = num(input.formue);
  const bolig = num(input.bolig);
  const inntekt = num(input.inntekt);
  const regionRaw = String(input.region);
  const region = REGIONER[regionRaw] ? Number(regionRaw) : 1.0;

  const careYears = HELSE_AAR[helse];
  const timer = BEHOV[behovKey].timer;
  // Snitt-inflasjonsfaktor: pleie antas å starte ca. 5 år fram i tid.
  const inflFactor = Math.pow(INFLASJON, careYears / 2 + 5);
  const assets = formue + bolig;

  // Årlige kostnader per vei
  const egenYr = timer * 52 * TIMEPRIS_PRIVAT * region; // privat hjelp hjemme
  const privatInstYr = PRIVAT_INST_MND * 12 * region; // privat institusjon
  const offentligYr =
    behovKey === "omfattende" ? egenandelLangtid(inntekt) : praktiskBistandAarlig(inntekt);

  const costEgen = egenYr * careYears * inflFactor;
  const costOff = offentligYr * careYears * inflFactor;
  const costPrivat = privatInstYr * careYears * inflFactor;

  const scen = {
    offentlig: {
      navn: "Offentlig (kommunal) med egenandel",
      aarlig: offentligYr,
      cost: costOff,
      remaining: Math.max(0, assets - costOff),
    },
    egen: {
      navn: "Privat hjelp hjemme",
      aarlig: egenYr,
      cost: costEgen,
      remaining: Math.max(0, assets - costEgen),
    },
    privat: {
      navn: "Privat institusjon / bofellesskap",
      aarlig: privatInstYr,
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
      behov: behovKey,
      behovTekst: BEHOV[behovKey].tekst,
      formue,
      bolig,
      inntekt,
      region,
      regionTekst: REGIONER[regionRaw] || REGIONER["1.0"],
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
