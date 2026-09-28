import assert from "node:assert/strict";
import test from "node:test";
import { inflateSync } from "node:zlib";
import sharp from "sharp";
import {
  generateSignedSaasContractPdf,
  renderCanonicalSaasContractHtml,
  renderSignedSaasContractHtml,
  sha256,
} from "../server/services/saas-contract-artifacts";
import {
  createSaasSigningCode,
  hashSaasSigningIp,
  hashSaasSigningOtp,
  normalizePersonName,
  normalizeSignerId,
  getTrustedSaasSigningIp,
  SAAS_SIGNING_OBJECTS_PATH_PATTERN,
  safeHashEqual,
  verifyUploadedProofMime,
} from "../server/services/saas-signing-security";

test("el código de firma tiene seis dígitos y se liga a solicitud y challenge", () => {
  const code = createSaasSigningCode();
  assert.match(code, /^\d{6}$/);
  const first = hashSaasSigningOtp("s".repeat(40), "request-a", "challenge-a", code);
  assert.equal(first.length, 64);
  assert.equal(safeHashEqual(first, hashSaasSigningOtp("s".repeat(40), "request-a", "challenge-a", code)), true);
  assert.equal(safeHashEqual(first, hashSaasSigningOtp("s".repeat(40), "request-b", "challenge-a", code)), false);
  assert.equal(safeHashEqual(first, hashSaasSigningOtp("s".repeat(40), "request-a", "challenge-b", code)), false);
  assert.equal(safeHashEqual(first, hashSaasSigningOtp("another-secret".padEnd(40, "x"), "request-a", "challenge-a", code)), false);
});

test("la huella IP usa separación de dominio y clave", () => {
  const ipHash = hashSaasSigningIp("s".repeat(40), "203.0.113.2");
  assert.equal(ipHash.length, 64);
  assert.equal(ipHash, hashSaasSigningIp("s".repeat(40), "203.0.113.2"));
  assert.notEqual(ipHash, hashSaasSigningIp("s".repeat(40), "203.0.113.3"));
  assert.notEqual(ipHash, hashSaasSigningIp("other-secret".padEnd(40, "x"), "203.0.113.2"));
});

test("la IP para rate limits ignora x-forwarded-for no confiable", () => {
  const ip = getTrustedSaasSigningIp({
    ip: "198.51.100.17",
    socket: { remoteAddress: "127.0.0.1" },
    headers: { "x-forwarded-for": "203.0.113.99, 198.51.100.1" },
  });
  assert.equal(ip, "198.51.100.17");
  assert.equal(getTrustedSaasSigningIp({
    socket: { remoteAddress: "127.0.0.1" },
    headers: { "x-forwarded-for": "203.0.113.99" },
  }), "127.0.0.1");
});

test("el prefijo de artefactos SaaS se reserva para rutas privadas", () => {
  assert.equal(SAAS_SIGNING_OBJECTS_PATH_PATTERN.test("/objects/saas-signing/demo/proof.pdf"), true);
  assert.equal(SAAS_SIGNING_OBJECTS_PATH_PATTERN.test("/objects/SAAS-SIGNING/demo/source.html"), true);
  assert.equal(SAAS_SIGNING_OBJECTS_PATH_PATTERN.test("/objects/other-company/file.pdf"), false);
});

test("se valida el tipo MIME contra la firma binaria del soporte", () => {
  const pdf = Buffer.from("%PDF-1.7\ncontenido");
  assert.equal(verifyUploadedProofMime("application/pdf", pdf), "application/pdf");
  assert.equal(verifyUploadedProofMime("image/png", pdf), null);
  assert.equal(verifyUploadedProofMime(
    "image/png",
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
  ), "image/png");
  assert.equal(verifyUploadedProofMime(
    "image/jpeg",
    Buffer.from([0xff, 0xd8, 0xff, 0x00]),
  ), "image/jpeg");
});

test("normaliza identificación y nombre para cotejo registral", () => {
  assert.equal(normalizeSignerId("1.234.567-890"), "1234567890");
  assert.equal(normalizePersonName("  LUZ ADRIANA Díaz Calle "), "luz adriana diaz calle");
});

test("la instantánea SSR conserva el contrato publicado y produce artefactos firmados", async () => {
  const source = renderCanonicalSaasContractHtml();
  assert.ok(source.includes("1. Partes del Contrato"));
  assert.ok(source.includes("17. Contacto"));
  const sourceSha256 = sha256(Buffer.from(source, "utf8"));
  const snapshot = {
    signerName: "Representante de prueba",
    signerId: "TEST-1234",
    capacity: "legal_representative" as const,
    companyName: "DEMO-PRUEBA",
    companyNit: "900000000-1",
    contractVersion: "1.2",
    sourceSha256,
    challengeId: "test-challenge",
    signedAt: new Date("2026-01-01T00:00:00.000Z"),
    ip: "127.0.0.1",
    userAgent: "test-harness",
    testOnly: true,
    signatureImage: await sharp({
      create: { width: 180, height: 60, channels: 4, background: "#ffffff" },
    }).png().toBuffer(),
  };
  const signedHtml = renderSignedSaasContractHtml(source, snapshot);
  assert.ok(signedHtml.includes("PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL"));
  assert.ok(signedHtml.includes(sourceSha256));
  const pdf = await generateSignedSaasContractPdf(source, snapshot);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  const pdfBody = pdf.toString("latin1");
  const streams = [...pdfBody.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
    .map((match) => Buffer.from(match[1], "latin1"))
    .flatMap((stream) => {
      try { return [inflateSync(stream).toString("latin1")]; }
      catch { return [stream.toString("latin1")]; }
    })
    .join("\n");
  const decodedPdfText = [...streams.matchAll(/<([a-f0-9]+)>/gi)]
    .map((match) => Buffer.from(match[1], "hex").toString("latin1"))
    .join("")
    .toUpperCase()
    .replace(/\s/g, "");
  assert.ok(decodedPdfText.includes("PRUEBAFUNCIONAL"));
});