// Bygger en flersides, merkevaretilpasset PDF-rapport fra computeReport().
// Ren JS (pdfkit) — ingen headless-nettleser. Seksjoner:
//  1) Sammendrag  2) Dine forutsetninger  3) Detaljert kostnadsoppdeling
//  4) År-for-år nedtrekk  5) Inntekt vs. terskler  6) Følsomhet
//  7) Arv  8) Sjekkliste til rådgiver  9) Metode og kilder

import PDFDocument from "pdfkit";
import { formatKr } from "./model.js";

const GREEN = "#0E5C5B";
const GREEN_DARK = "#0A4544";
const GOLD = "#C9A227";
const INK = "#1C2B2A";
const MUTED = "#5A6B69";
const LINE = "#E3DDD2";
const BEST_BG = "#EAF4F2";

const HELSE_TEKST = { god: "God", middels: "Middels", svekket: "Svekket" };

export function buildPdf(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const M = doc.page.margins.left;
      const CW = W - M * 2;
      const bottom = () => doc.page.height - doc.page.margins.bottom;
      const ensure = (need) => {
        if (doc.y + need > bottom()) doc.addPage();
      };
      const today = new Date().toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const inp = report.input;

      // ============ TOPPBANNER (side 1) ============
      doc.rect(0, 0, W, 90).fill(GREEN);
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text("Aktuarium", M, 30);
      doc.font("Helvetica").fontSize(10).fillColor("#CFE6E3")
        .text("Uavhengig pleiekostnadsrapport — ingen provisjon", M, 58);
      doc.y = 120;

      doc.fillColor(INK).font("Helvetica-Bold").fontSize(20)
        .text("Hva pleie kan koste familien din", { width: CW });
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10).fillColor(MUTED);
      const navn = inp.navn ? `Utarbeidet for ${inp.navn}` : "Utarbeidet for deg";
      doc.text(`${navn} · ${today}`, { width: CW });
      doc.moveDown(1);
      doc.fillColor(INK).fontSize(11).text(
        "Rapporten sammenligner tre veier for pleie — offentlig (kommunal) med egenandel, " +
          "privat hjelp hjemme, og privat institusjon — og viser hva hver vei kan koste over et " +
          "anslått pleieforløp, hva som er igjen til familien, og hva du kan gjøre nå.",
        { width: CW }
      );
      doc.moveDown(1);

      // ============ 1) SAMMENDRAG ============
      sectionTitle("Sammendrag");
      const best = report.scen[report.bestKey];
      summaryBox(
        `Beste vei i ditt anslag: ${best.navn}. Da er det anslagsvis ${formatKr(best.remaining)} ` +
          `igjen til familien etter ${report.careYears} år. Forskjellen mellom beste og dårligste ` +
          `vei er ${formatKr(report.diff)}.`
      );
      doc.moveDown(0.5);
      ["offentlig", "egen", "privat"].forEach((k) => {
        scenarioCard(report.scen[k], k === report.bestKey);
        doc.moveDown(0.4);
      });

      // ============ 2) DINE FORUTSETNINGER ============
      ensure(170);
      doc.moveDown(0.6);
      sectionTitle("Dine forutsetninger");
      [
        ["Alder", `${inp.alder} år`],
        ["Helse", `${HELSE_TEKST[inp.helse] || inp.helse} (anslått ${report.careYears} år pleie)`],
        ["Behov for hjelp", inp.behovTekst],
        ["Oppsparte midler", formatKr(inp.formue)],
        ["Boligverdi", formatKr(inp.bolig)],
        ["Årlig inntekt / pensjon", formatKr(inp.inntekt)],
        ["Region", inp.regionTekst],
        ["Samlet utgangsformue", formatKr(report.assets)],
      ].forEach(([k, v]) => kvRow(k, v));

      // ============ 3) DETALJERT KOSTNADSOPPDELING ============
      ensure(120);
      doc.moveDown(0.8);
      sectionTitle("Detaljert kostnadsoppdeling (per år, dagens nivå)");
      ["offentlig", "egen", "privat"].forEach((k) => {
        const s = report.scen[k];
        ensure(90);
        doc.moveDown(0.3);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(s.navn, M, doc.y, { width: CW });
        doc.moveDown(0.2);
        const rows = s.poster.map((p) => [
          p.post + (p.note ? `  (${p.note})` : ""),
          formatKr(p.belop),
        ]);
        rows.push(["Sum per år", formatKr(s.aarlig)]);
        table([{ w: 0.74, align: "left" }, { w: 0.26, align: "right" }], rows, { boldLast: true });
      });
      doc.moveDown(0.2);
      doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED).text(
        "Matombringing og dagsenter kommer i tillegg ved behov (~150–200 kr/dag). Medisinske " +
          "egenandeler har frikort-tak på " + formatKr(report.terskler.frikort) + ".",
        M, doc.y, { width: CW }
      );

      // ============ 4) ÅR-FOR-ÅR NEDTREKK ============
      doc.addPage();
      sectionTitle("År for år: slik tæres formuen");
      doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(
        "Gjenstående formue ved utgangen av hvert pleieår (kostnad vokser ~3 %/år).",
        M, doc.y, { width: CW }
      );
      doc.moveDown(0.5);
      ["offentlig", "egen", "privat"].forEach((k) => {
        const s = report.scen[k];
        ensure(60 + s.yearly.length * 16);
        doc.font("Helvetica-Bold").fontSize(10.5).fillColor(GREEN_DARK).text(s.navn, M, doc.y, { width: CW });
        doc.moveDown(0.15);
        const rows = s.yearly.map((r) => [
          `År ${r.aar}`,
          formatKr(r.kostnad),
          formatKr(r.gjenstaende),
        ]);
        tableH(
          ["Pleieår", "Kostnad", "Igjen til familien"],
          [{ w: 0.3 }, { w: 0.35, align: "right" }, { w: 0.35, align: "right" }],
          rows
        );
        doc.moveDown(0.5);
      });

      // ============ 5) INNTEKT VS. TERSKLER ============
      ensure(180);
      doc.moveDown(0.4);
      sectionTitle("Din inntekt vs. tersklene som styrer egenandelen");
      const t = report.terskler;
      tableH(
        ["Terskel", "Beløp", "Din situasjon"],
        [{ w: 0.4 }, { w: 0.3, align: "right" }, { w: 0.3, align: "right" }],
        [
          ["1G (grunnbeløp)", formatKr(t.G), t.overG ? "over" : "under"],
          ["2G", formatKr(t.G2), t.over2G ? "over" : "under"],
          ["Frikort helse", formatKr(t.frikort), "—"],
          ["Din årsinntekt", formatKr(t.inntekt), ""],
        ]
      );
      doc.moveDown(0.3);
      const terskelTekst = t.over2G
        ? "Inntekten din er over 2G. Praktisk bistand i hjemmet betales da etter kommunal timepris " +
          "(ofte 200–600 kr/t, gjerne med et månedstak), ikke den lave maksprisen på 245 kr/mnd. " +
          (t.overG
            ? "Deler av inntekten over 1G gir 85 % egenandel ved langtids sykehjem."
            : "")
        : "Inntekten din er under 2G. Praktisk bistand i hjemmet har da et statlig pristak på " +
          "245 kr/mnd (2 940 kr/år).";
      doc.font("Helvetica").fontSize(10).fillColor(INK).text(terskelTekst, M, doc.y, { width: CW });

      // ============ 6) FØLSOMHET ============
      ensure(150);
      doc.moveDown(0.8);
      sectionTitle("Følsomhet: hva om det blir verre?");
      doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(
        "Igjen til familien under to tøffere forutsetninger.",
        M, doc.y, { width: CW }
      );
      doc.moveDown(0.4);
      tableH(
        ["Vei", "Grunnscenario", "Pleie +2 år", "Kostnad +5 %/år"],
        [{ w: 0.34 }, { w: 0.22, align: "right" }, { w: 0.22, align: "right" }, { w: 0.22, align: "right" }],
        ["offentlig", "egen", "privat"].map((k) => {
          const s = report.scen[k];
          return [s.navn, formatKr(s.remaining), formatKr(s.remLengre), formatKr(s.remDyrere)];
        })
      );

      // ============ 7) ARV ============
      ensure(120);
      doc.moveDown(0.8);
      sectionTitle("Arv: hva står på spill");
      doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(
        `«Igjen til familien» er i praksis det som går videre til arvingene. I dette anslaget ` +
          `varierer det fra ${formatKr(report.scen[report.worstKey].remaining)} (${report.scen[report.worstKey].navn}) ` +
          `til ${formatKr(report.scen[report.bestKey].remaining)} (${report.scen[report.bestKey].navn}) — ` +
          `en forskjell på ${formatKr(report.diff)}. Valget av omsorgsvei er derfor også et arvespørsmål, ` +
          `og bør tas i ro før en diagnose eller et fall tvinger det fram.`,
        M, doc.y, { width: CW }
      );

      // ============ 8) SJEKKLISTE ============
      ensure(200);
      doc.moveDown(0.8);
      sectionTitle("Sjekkliste: ta med til en uavhengig rådgiver");
      [
        "Hva dekker hjemkommunen vår av hjemmesykepleie og praktisk bistand — og hva er ventetiden?",
        "Hva blir egenandelen for langtids sykehjem ut fra vår faktiske inntekt og pensjon?",
        "Bør boligen beholdes, leies ut eller selges for å finansiere pleie?",
        "Hvordan påvirker valg av omsorgsvei arven til barna?",
        "Har vi forsikringer (behandling/uføre/kritisk sykdom) som faktisk dekker noe av dette?",
        "Hva er plan B hvis pleiebehovet varer lenger eller blir mer omfattende enn antatt?",
      ].forEach((b) => bullet(b));
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(GREEN_DARK)
        .text("Neste steg: del denne rapporten med familien og en honorarbasert (ikke provisjonslønnet) rådgiver.",
          M, doc.y, { width: CW });

      // ============ 9) METODE OG KILDER ============
      ensure(180);
      doc.moveDown(0.8);
      sectionTitle("Metode og kilder");
      [
        "Grunnbeløp 1G = 130 160 kr (NAV, fra 1. mai 2025).",
        "Langtids sykehjem: 75 % av inntekt inntil 1G (minus fribeløp 10 450 kr/år) + 85 % over 1G (Lovdata SF 2011-12-16-1349 m/endring 2024-12-16-3180; Helsedirektoratet 2025).",
        "Hjemmesykepleie (medisinsk) er gratis; praktisk bistand < 2G har tak på 245 kr/mnd.",
        "Privat hjelp hjemme ~600 kr/t og privat institusjon ~75 000 kr/mnd er markedsanslag.",
        "Kostnader vokser ~3 %/år; pleie antas å starte ~5 år fram i tid.",
      ].forEach((b) => bullet(b, 9));

      doc.moveDown(0.6);
      ensure(60);
      doc.rect(M, doc.y, CW, 0.8).fill(LINE);
      doc.moveDown(0.5);
      doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED).text(
        "Aktuarium gir beslutningsstøtte basert på offentlige data og leverer ikke individuell " +
          "finansiell rådgivning i henhold til finansforetaksloven. Tallene er anslag og kan avvike " +
          "fra faktiske kostnader.",
        M, doc.y, { width: CW }
      );

      doc.end();

      // ---------- helpers ----------
      function sectionTitle(text) {
        ensure(40);
        doc.font("Helvetica-Bold").fontSize(13).fillColor(GREEN_DARK).text(text, M, doc.y, { width: CW });
        doc.moveDown(0.2);
        doc.rect(M, doc.y, 46, 2.5).fill(GOLD);
        doc.moveDown(0.5);
        doc.fillColor(INK);
      }
      function kvRow(k, v) {
        ensure(20);
        const y = doc.y;
        doc.font("Helvetica").fontSize(10.5).fillColor(MUTED).text(k, M, y, { width: CW * 0.55 });
        doc.font("Helvetica-Bold").fillColor(INK).text(v, M + CW * 0.55, y, { width: CW * 0.45, align: "right" });
        doc.moveDown(0.3);
      }
      function bullet(text, size) {
        ensure(22);
        const y = doc.y;
        doc.font("Helvetica").fontSize(size || 10).fillColor(GREEN).text("•", M, y, { width: 12 });
        doc.fillColor(MUTED).text(text, M + 14, y, { width: CW - 14 });
        doc.moveDown(0.25);
      }
      function summaryBox(text) {
        const pad = 14;
        ensure(40);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(INK);
        const h = doc.heightOfString(text, { width: CW - pad * 2 }) + pad * 2;
        ensure(h + 6);
        doc.save();
        doc.roundedRect(M, doc.y, CW, h, 8).fillAndStroke(BEST_BG, GREEN);
        doc.restore();
        doc.fillColor(INK).text(text, M + pad, doc.y + pad, { width: CW - pad * 2 });
        doc.y += pad;
      }
      function scenarioCard(s, isBest) {
        const h = 54;
        ensure(h + 6);
        const y = doc.y;
        doc.save();
        doc.roundedRect(M, y, CW, h, 8);
        if (isBest) doc.fillAndStroke(BEST_BG, GREEN);
        else doc.fillAndStroke("#FFFFFF", LINE);
        doc.restore();
        doc.fillColor(INK).font("Helvetica-Bold").fontSize(11.5).text(s.navn, M + 14, y + 11, { width: CW * 0.5 - 14 });
        if (isBest) {
          doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN_DARK)
            .text("MEST IGJEN TIL FAMILIEN", M + 14, y + 32, { width: CW * 0.5 - 14 });
        } else {
          doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
            .text(`Ca. ${formatKr(s.aarlig)} per år`, M + 14, y + 32, { width: CW * 0.55 - 14 });
        }
        doc.font("Helvetica").fontSize(8).fillColor(MUTED)
          .text("Igjen til familien", M + CW * 0.55, y + 11, { width: CW * 0.45 - 14, align: "right" });
        doc.font("Helvetica-Bold").fontSize(15).fillColor(GREEN)
          .text(formatKr(s.remaining), M + CW * 0.55, y + 23, { width: CW * 0.45 - 14, align: "right" });
        doc.y = y + h;
      }
      // enkel tabell uten header
      function table(cols, rows, opts) {
        opts = opts || {};
        rows.forEach((row, ri) => {
          ensure(20);
          const y = doc.y;
          let cx = M;
          row.forEach((cell, ci) => {
            const w = cols[ci].w * CW;
            const last = opts.boldLast && ri === rows.length - 1;
            doc.font(last ? "Helvetica-Bold" : "Helvetica").fontSize(9.5)
              .fillColor(last ? INK : MUTED)
              .text(cell, cx + 2, y, { width: w - 4, align: cols[ci].align || "left" });
            cx += w;
          });
          doc.moveDown(0.15);
          doc.rect(M, doc.y, CW, 0.5).fill(LINE);
          doc.moveDown(0.2);
        });
      }
      // tabell med header-rad
      function tableH(headers, cols, rows) {
        ensure(24);
        let y = doc.y;
        let cx = M;
        headers.forEach((hh, ci) => {
          const w = cols[ci].w * CW;
          doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN_DARK)
            .text(hh, cx + 2, y, { width: w - 4, align: cols[ci].align || "left" });
          cx += w;
        });
        doc.moveDown(0.2);
        doc.rect(M, doc.y, CW, 1).fill(GREEN);
        doc.moveDown(0.25);
        rows.forEach((row) => {
          ensure(18);
          const ry = doc.y;
          let rx = M;
          row.forEach((cell, ci) => {
            const w = cols[ci].w * CW;
            doc.font("Helvetica").fontSize(9.5).fillColor(INK)
              .text(cell, rx + 2, ry, { width: w - 4, align: cols[ci].align || "left" });
            rx += w;
          });
          doc.moveDown(0.15);
          doc.rect(M, doc.y, CW, 0.5).fill(LINE);
          doc.moveDown(0.2);
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}
