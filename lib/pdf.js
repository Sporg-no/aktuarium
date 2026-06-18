// Bygger en lettlest, merkevaretilpasset PDF-rapport fra computeReport()-resultatet.
// Bruker pdfkit (ren JS, ingen headless-nettleser) — fungerer fint i serverløse miljøer.

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
      const M = doc.page.margin;
      const contentW = W - M * 2;
      const today = new Date().toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // ---------- Toppbanner ----------
      doc.rect(0, 0, W, 90).fill(GREEN);
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text("Aktuarium", M, 30);
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#CFE6E3")
        .text("Uavhengig pleiekostnadsrapport — ingen provisjon", M, 58);

      doc.y = 120;

      // ---------- Tittel ----------
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(20);
      doc.text("Hva pleie kan koste familien din", { width: contentW });
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10).fillColor(MUTED);
      const navn = report.input.navn ? `Utarbeidet for ${report.input.navn}` : "Utarbeidet for deg";
      doc.text(`${navn} · ${today}`, { width: contentW });

      doc.moveDown(1);
      doc.fillColor(INK).fontSize(11);
      doc.text(
        "Denne rapporten sammenligner tre veier for pleie og omsorg — egenfinansiering, " +
          "offentlig tilbud med egenandel, og privat pleie — og viser hva hver vei kan koste " +
          "over et anslått pleieforløp, samt hva som er igjen til familien.",
        { width: contentW, align: "left" }
      );

      doc.moveDown(1);

      // ---------- Forutsetninger ----------
      sectionTitle(doc, "Dine forutsetninger", M, contentW);
      const inp = report.input;
      const rows = [
        ["Alder", `${inp.alder} år`],
        ["Helse", `${HELSE_TEKST[inp.helse] || inp.helse} (anslått ${report.careYears} år med pleie)`],
        ["Oppsparte midler", formatKr(inp.formue)],
        ["Boligverdi", formatKr(inp.bolig)],
        ["Årlig inntekt / pensjon", formatKr(inp.inntekt)],
        ["Region", inp.regionTekst],
        ["Ønske om bosituasjon", inp.hjemmeTekst],
        ["Samlet utgangsformue", formatKr(report.assets)],
      ];
      doc.font("Helvetica").fontSize(10.5);
      rows.forEach(([k, v]) => {
        const y = doc.y;
        doc.fillColor(MUTED).text(k, M, y, { width: contentW * 0.5 });
        doc.fillColor(INK).font("Helvetica-Bold").text(v, M + contentW * 0.5, y, {
          width: contentW * 0.5,
          align: "right",
        });
        doc.font("Helvetica");
        doc.moveDown(0.35);
      });

      doc.moveDown(0.8);

      // ---------- Sammenligning ----------
      sectionTitle(doc, "Sammenligning over pleieforløpet", M, contentW);
      doc.font("Helvetica").fontSize(10).fillColor(MUTED);
      doc.text(
        "Beløpene inkluderer anslått prisvekst (3 %/år) og formuesuttak. «Igjen til familien» " +
          "er utgangsformuen minus samlede pleiekostnader.",
        { width: contentW }
      );
      doc.moveDown(0.6);

      const order = ["egen", "offentlig", "privat"];
      order.forEach((key) => {
        scenarioCard(doc, report.scen[key], key === report.bestKey, M, contentW);
        doc.moveDown(0.5);
      });

      doc.moveDown(0.3);

      // ---------- Oppsummering ----------
      const best = report.scen[report.bestKey];
      summaryBox(
        doc,
        `Beste vei i dette anslaget: ${best.navn}. Forskjellen mellom beste og dårligste ` +
          `vei er ${formatKr(report.diff)} for familien din over ${report.careYears} år.`,
        M,
        contentW
      );

      // ---------- Forutsetninger / metode ----------
      if (doc.y > doc.page.height - 230) doc.addPage();
      doc.moveDown(1);
      sectionTitle(doc, "Forutsetninger bak tallene", M, contentW);
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
      const bullets = [
        "Pleieårene avhenger av oppgitt helse (god ≈ 3 år, middels ≈ 5 år, svekket ≈ 8 år).",
        "Privat pleie er regnet til ca. 75 000 kr/mnd, egenfinansiert hjemmepleie til ca. 50 000 kr/mnd.",
        "Egenandel på offentlig sykehjem er anslått til inntil 85 % av inntekt over et fribeløp.",
        "Kostnadene er justert for region og ca. 3 % årlig prisvekst.",
        "Tallene er anslag basert på offentlige gjennomsnittstall (SSB, Helsedirektoratet, kommunale satser).",
      ];
      bullets.forEach((b) => {
        const y = doc.y;
        doc.fillColor(GREEN).text("•", M, y, { width: 12 });
        doc.fillColor(MUTED).text(b, M + 14, y, { width: contentW - 14 });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.8);
      doc.rect(M, doc.y, contentW, 0.8).fill(LINE);
      doc.moveDown(0.6);
      doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED);
      doc.text(
        "Aktuarium gir beslutningsstøtte basert på offentlige data og leverer ikke individuell " +
          "finansiell rådgivning i henhold til finansforetaksloven. Tallene er anslag og kan avvike " +
          "fra faktiske kostnader. Ta gjerne rapporten med til en uavhengig, honorarbasert rådgiver.",
        M,
        doc.y,
        { width: contentW }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function sectionTitle(doc, text, x, width) {
  doc.font("Helvetica-Bold").fontSize(13).fillColor(GREEN_DARK);
  doc.text(text, x, doc.y, { width });
  doc.moveDown(0.2);
  doc.rect(x, doc.y, 46, 2.5).fill(GOLD);
  doc.moveDown(0.5);
  doc.fillColor(INK);
}

function scenarioCard(doc, s, isBest, x, width) {
  const h = 58;
  const y = doc.y;
  doc.save();
  doc.roundedRect(x, y, width, h, 8);
  if (isBest) doc.fillAndStroke(BEST_BG, GREEN);
  else doc.fillAndStroke("#FFFFFF", LINE);
  doc.restore();

  // venstre: navn (+ evt. merke)
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11.5);
  doc.text(s.navn, x + 14, y + 12, { width: width * 0.5 - 14 });
  if (isBest) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN_DARK);
    doc.text("MEST IGJEN TIL FAMILIEN", x + 14, y + 34, { width: width * 0.5 - 14 });
  } else {
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
    doc.text(`Årlig pleiekostnad ca. ${formatKr(s.aarlig)}`, x + 14, y + 34, {
      width: width * 0.55 - 14,
    });
  }

  // høyre: igjen til familien
  doc.font("Helvetica").fontSize(8).fillColor(MUTED);
  doc.text("Igjen til familien", x + width * 0.55, y + 12, {
    width: width * 0.45 - 14,
    align: "right",
  });
  doc.font("Helvetica-Bold").fontSize(16).fillColor(GREEN);
  doc.text(formatKr(s.remaining), x + width * 0.55, y + 24, {
    width: width * 0.45 - 14,
    align: "right",
  });

  doc.y = y + h;
}

function summaryBox(doc, text, x, width) {
  const pad = 14;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK);
  const textH = doc.heightOfString(text, { width: width - pad * 2 });
  const h = textH + pad * 2;
  doc.save();
  doc.roundedRect(x, doc.y, width, h, 8).fillAndStroke(BEST_BG, GREEN);
  doc.restore();
  doc.fillColor(INK).text(text, x + pad, doc.y + pad, { width: width - pad * 2 });
  doc.y += pad;
}
