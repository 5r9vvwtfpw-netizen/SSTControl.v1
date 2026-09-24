import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfPath = path.join(root, "documents", "informe-alcance-sst-colombia-los-picas-corbeta.pdf");
const htmlPath = path.join(root, "documents", "descargar-informe-corbeta.html");
const downloadName = "Informe-SG-SST-Los-Picas-para-Corbeta.pdf";
const pdf = fs.readFileSync(pdfPath);

if (pdf.subarray(0, 5).toString() !== "%PDF-") {
  throw new Error("El archivo de origen no es un PDF");
}

const base64 = pdf.toString("base64");
const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Descargar informe SG-SST para Corbeta</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, -apple-system, sans-serif; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: #eef4ef; color: #173b2b; }
    main { box-sizing: border-box; width: min(100% - 32px, 520px); padding: 40px; border-radius: 16px; background: white; box-shadow: 0 12px 40px #173b2b19; }
    h1 { margin: 0 0 12px; font-size: 24px; }
    p { line-height: 1.5; color: #42594a; }
    button, a { cursor: pointer; font: inherit; }
    button { width: 100%; margin-top: 18px; padding: 14px 20px; border: 0; border-radius: 8px; background: #20643f; color: white; font-weight: 700; }
    button:hover { background: #174e31; }
    a { display: inline-block; margin-top: 20px; color: #174e31; }
    small { display: block; margin-top: 22px; color: #64756b; }
  </style>
</head>
<body>
  <main>
    <h1>Informe SG-SST para Corbeta</h1>
    <p>Archivo PDF original de 7 páginas. Pulsa el botón para descargarlo; no uses «Guardar como» del navegador.</p>
    <button id="download" type="button">Descargar PDF</button>
    <a href="data:application/pdf;base64,${base64}" download="${downloadName}">Si el botón no funciona, usa este enlace alternativo</a>
    <small>El archivo se prepara en este navegador y no se envía a otro servicio.</small>
  </main>
  <script id="pdf-data" type="text/plain">${base64}</script>
  <script>
    document.getElementById("download").addEventListener("click", function () {
      const binary = atob(document.getElementById("pdf-data").textContent.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = ${JSON.stringify(downloadName)};
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, html);
console.log(`Página de descarga generada: ${htmlPath}`);