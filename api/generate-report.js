// Vercel serverløs funksjon: POST /api/generate-report
// Tar imot spørreskjema-svar + e-post, beregner rapporten, bygger en PDF og
// sender den som vedlegg via Resend.
//
// Miljøvariabler (sett i Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  – API-nøkkel fra resend.com
//   MAIL_FROM       – avsender, f.eks. "Aktuarium <rapport@dittdomene.no>"
//                     (domenet må være verifisert i Resend)
//   ALLOW_ORIGIN    – (valgfritt) tillatt origin for CORS, f.eks.
//                     "https://sporg-no.github.io". Default "*".

import { Resend } from "resend";
import { computeReport, formatKr } from "../lib/model.js";
import { buildPdf } from "../lib/pdf.js";

export default async function handler(req, res) {
  const allowOrigin = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    const epost = (body.epost || "").toString().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost)) {
      return res.status(400).json({ error: "Ugyldig e-postadresse." });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "RESEND_API_KEY mangler i miljøvariablene." });
    }

    const report = computeReport(body);
    const pdf = await buildPdf(report);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.MAIL_FROM || "Aktuarium <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: epost,
      subject: "Din Aktuarium-rapport (PDF)",
      html: emailHtml(report),
      attachments: [{ filename: "aktuarium-rapport.pdf", content: pdf }],
    });

    if (error) {
      console.error("Resend-feil:", error);
      return res.status(502).json({ error: "Klarte ikke å sende e-posten." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("generate-report-feil:", err);
    return res.status(500).json({ error: "Det oppstod en serverfeil." });
  }
}

function emailHtml(report) {
  const best = report.scen[report.bestKey];
  const navn = report.input.navn ? report.input.navn.split(" ")[0] : "";
  const hei = navn ? `Hei ${escapeHtml(navn)},` : "Hei,";
  return `<!DOCTYPE html>
<html lang="no"><body style="margin:0;background:#FAF7F2;font-family:Arial,Helvetica,sans-serif;color:#1C2B2A;">
  <div style="max-width:560px;margin:0 auto;padding:28px 22px;">
    <div style="font-weight:800;font-size:22px;color:#0E5C5B;">Aktu<span style="color:#C9A227;">arium</span></div>
    <h1 style="font-size:20px;margin:22px 0 10px;">Rapporten din er klar</h1>
    <p style="font-size:15px;line-height:1.6;color:#1C2B2A;">${hei}</p>
    <p style="font-size:15px;line-height:1.6;color:#1C2B2A;">
      Takk for at du brukte Aktuarium. Den komplette pleiekostnadsrapporten ligger som
      PDF-vedlegg til denne e-posten.
    </p>
    <div style="background:#EAF4F2;border:1px solid #0E5C5B;border-radius:10px;padding:16px 18px;margin:18px 0;font-size:15px;">
      <strong>Beste vei i ditt anslag:</strong> ${escapeHtml(best.navn)}<br/>
      <strong>Igjen til familien:</strong> ${formatKr(best.remaining)}
    </div>
    <p style="font-size:14px;line-height:1.6;color:#5A6B69;">
      Tips: del rapporten med familien eller en uavhengig, honorarbasert rådgiver.
      Vi tar ingen provisjon og selger ingen forsikring — derfor er tallene nøytrale.
    </p>
    <p style="font-size:12px;line-height:1.6;color:#5A6B69;border-top:1px solid #E3DDD2;padding-top:14px;margin-top:22px;">
      Illustrativt anslag basert på offentlige data. Ikke individuell finansiell rådgivning.
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
