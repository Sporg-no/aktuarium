// Aktuarium — beregningsmodell for pleiekostnadsrapporten (v3).
// Bygger på verifiserte norske 2025/2026-satser. Headline-tallene (scen.*.cost/
// remaining) holdes identisk med klient-kalkulatoren (kalkulator.html).
// De rike feltene (yearly, breakdown, sensitivity, terskler) brukes i PDF-en.
//
// KILDER (sjekket juni 2026):
// - Grunnbeløp 1G = 130 160 kr fra 1. mai 2025 (NAV).
// - Langtids sykehjem, egenandel: 75 % av inntekt inntil 1G (minus fribeløp
//   10 450 kr/år) + 85 % av inntekt over 1G (Lovdata SF 2011-12-16-1349 m/
//   endring 2024-12-16-3180; Helsedirektoratet fortolkning 2025).
// - Hjemmesykepleie (medisinsk hjelp/personlig stell) er gratis.
// - Praktisk bistand, inntekt < 2G: statlig maks 245 kr/mnd (2 940 kr/år).
//   Over 2G: kommunal timepris (ofte 200–600 kr/t) med månedstak.
// - Frikort egenandelstak helsetjenester: 3 278 kr.
// - Matombringing/dagsenter: ~150–200 kr/dag (kommer i tillegg ved behov).
// - Privat hjelp hjemme ~500–700 kr/t; privat institusjon: markedsanslag.
//
// VIKTIG: Forenklet, illustrativt anslag — ikke individuell finansiell rådgivning.

const G = 130160; // folketrygdens grunnbeløp (1G), per 1. mai 2025
const FRIBELOP_LANGTID = 10450; // årlig fribeløp, langtidsopphold
const PB_UNDER_2G_MND = 245; // praktisk bistand, maks/mnd ved inntekt < 2G (2025)
const PB_OVER_2G_MND = 2500; // praktisk bistand, anslag/mnd ved inntekt ≥ 2G (kommunal sats m/tak)
const FRIKORT = 3278; // egenandelstak helsetjenester
const TIMEPRIS_PRIVAT = 600; // kr/t privat praktisk bistand (markedsanslag)
const PRIVAT_INST_MND = 75000; // kr/mnd privat institusjon/bofellesskap (markedsanslag)
const VEKST = 0.03; // antatt årlig kostnadsvekst
const START_OM = 5; // pleie antas å starte ca. 5 år fram i tid

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

// Sum av vekstfaktorene over pleieforløpet (eksakt år-for-år, ikke tilnærming).
function faktorSum(aar, vekst) {
  // kostnad år y (y=0..aar-1) = base * (1+vekst)^(START_OM + y)
  let s = 0;
  for (let y = 0; y < aar; y++) s += Math.pow(1 + vekst, START_OM + y);
  return s;
}

// Årlig egenandel ved langtidsopphold på sykehjem (av inntekt, ikke formue).
export function egenandelLangtid(inntekt) {
  const del1 = 0.75 * Math.max(Math.min(inntekt, G) - FRIBELOP_LANGTID, 0);
  const del2 = 0.85 * Math.max(inntekt - G, 0);
  return { del1, del2, sum: del1 + del2 };
}

function praktiskBistandAarlig(inntekt) {
  return (inntekt < 2 * G ? PB_UNDER_2G_MND : PB_OVER_2G_MND) * 12;
}

function byggYearly(base, aar, assets, vekst) {
  const rows = [];
  let kumulativ = 0;
  for (let y = 1; y <= aar; y++) {
    const kostnad = base * Math.pow(1 + vekst, START_OM + (y - 1));
    kumulativ += kostnad;
    rows.push({ aar: y, kostnad, gjenstaende: Math.max(0, assets - kumulativ) });
  }
  return rows;
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
  const assets = formue + bolig;
  const fSum = faktorSum(careYears, VEKST);

  // Årlige basiskostnader (nominelt, dagens nivå) + itemisert oppdeling per vei
  const egenYr = timer * 52 * TIMEPRIS_PRIVAT * region;
  const privatInstYr = PRIVAT_INST_MND * 12 * region;

  const ea = egenandelLangtid(inntekt);
  let offentligYr, offentligPoster;
  if (behovKey === "omfattende") {
    offentligYr = ea.sum;
    offentligPoster = [
      { post: "Hjemmesykepleie (medisinsk)", belop: 0, note: "gratis" },
      { post: "Sykehjem egenandel – 75 % inntil 1G", belop: ea.del1 },
      { post: "Sykehjem egenandel – 85 % over 1G", belop: ea.del2 },
    ];
  } else {
    const pb = praktiskBistandAarlig(inntekt);
    offentligYr = pb;
    offentligPoster = [
      { post: "Hjemmesykepleie (medisinsk)", belop: 0, note: "gratis" },
      {
        post: "Praktisk bistand (egenandel)",
        belop: pb,
        note: inntekt < 2 * G ? "maks 245 kr/mnd (< 2G)" : "kommunal sats (≥ 2G)",
      },
    ];
  }

  function lagScen(navn, base, poster) {
    return {
      navn,
      aarlig: base,
      poster,
      cost: base * fSum,
      remaining: Math.max(0, assets - base * fSum),
      yearly: byggYearly(base, careYears, assets, VEKST),
      // følsomhet
      remLengre: Math.max(0, assets - base * faktorSum(careYears + 2, VEKST)),
      remDyrere: Math.max(0, assets - base * faktorSum(careYears, 0.05)),
    };
  }

  const scen = {
    offentlig: lagScen("Offentlig (kommunal) med egenandel", offentligYr, offentligPoster),
    egen: lagScen("Privat hjelp hjemme", egenYr, [
      { post: `Privat praktisk bistand (~${timer} t/uke à 600 kr)`, belop: egenYr },
    ]),
    privat: lagScen("Privat institusjon / bofellesskap", privatInstYr, [
      { post: "Privat institusjon/bofellesskap (~75 000 kr/mnd)", belop: privatInstYr },
    ]),
  };

  const keys = Object.keys(scen);
  const bestKey = keys.reduce((a, b) => (scen[a].remaining >= scen[b].remaining ? a : b));
  const worstKey = keys.reduce((a, b) => (scen[a].remaining <= scen[b].remaining ? a : b));
  const diff = scen[bestKey].remaining - scen[worstKey].remaining;

  // Inntekt vs. terskler
  const terskler = {
    G,
    G2: 2 * G,
    frikort: FRIKORT,
    inntekt,
    overG: inntekt > G,
    over2G: inntekt >= 2 * G,
  };

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
    terskler,
    konstanter: { G, FRIKORT, TIMEPRIS_PRIVAT, PRIVAT_INST_MND, VEKST },
  };
}

export function formatKr(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
}
