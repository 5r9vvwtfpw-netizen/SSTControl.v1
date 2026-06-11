/**
 * generate-manual.ts
 *
 * Actualiza automáticamente el Manual de Usuario inyectando el historial
 * de versiones desde docs/changelog.json.
 *
 * USO:
 *   npx tsx scripts/generate-manual.ts
 *
 * FLUJO PARA NUEVAS FUNCIONALIDADES:
 *   1. Agregar entrada en docs/changelog.json (nueva versión o nueva entrada en versión actual)
 *   2. Ejecutar: npx tsx scripts/generate-manual.ts
 *   3. El manual se actualiza automáticamente
 */

import fs from "fs";
import path from "path";

const CHANGELOG_PATH = path.resolve("docs/changelog.json");
const MANUAL_PATH = path.resolve("docs/manual/PLANTILLA-MANUAL.md");

const MARKER_START = "<!-- INICIO-CHANGELOG -->";
const MARKER_END = "<!-- FIN-CHANGELOG -->";

interface ChangeEntry {
  type: "nueva-funcionalidad" | "mejora" | "correccion" | "deprecado";
  modulo: string;
  titulo: string;
  descripcion: string;
  ruta: string | null;
  fase: string;
}

interface VersionEntry {
  version: string;
  date: string;
  changes: ChangeEntry[];
}

interface Changelog {
  entries: VersionEntry[];
}

const TIPO_ICON: Record<string, string> = {
  "nueva-funcionalidad": "Nuevo",
  "mejora": "Mejora",
  "correccion": "Corrección",
  "deprecado": "Deprecado",
};

const TIPO_LABEL: Record<string, string> = {
  "nueva-funcionalidad": "Nueva funcionalidad",
  "mejora": "Mejora",
  "correccion": "Corrección",
  "deprecado": "Deprecado",
};

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${day} de ${months[month - 1]} de ${year}`;
}

function generateChangelogSection(changelog: Changelog): string {
  const lines: string[] = [];

  lines.push("## 16. Historial de Versiones");
  lines.push("");
  lines.push("> Esta sección se genera automáticamente desde `docs/changelog.json`.");
  lines.push("> Para agregar cambios, edita ese archivo y ejecuta `npx tsx scripts/generate-manual.ts`.");
  lines.push("");

  for (const entry of changelog.entries) {
    lines.push(`### v${entry.version} — ${formatDate(entry.date)}`);
    lines.push("");

    const byType = new Map<string, ChangeEntry[]>();
    for (const change of entry.changes) {
      if (!byType.has(change.type)) byType.set(change.type, []);
      byType.get(change.type)!.push(change);
    }

    const typeOrder = ["nueva-funcionalidad", "mejora", "correccion", "deprecado"];
    for (const tipo of typeOrder) {
      const changes = byType.get(tipo);
      if (!changes || changes.length === 0) continue;

      lines.push(`#### ${TIPO_LABEL[tipo]}`);
      lines.push("");

      for (const change of changes) {
        lines.push(`**${change.modulo}** — ${change.titulo}`);
        lines.push(change.descripcion);
        if (change.ruta) {
          lines.push(`*Ruta:* \`${change.ruta}\``);
        }
        lines.push(`*Fase:* ${change.fase}`);
        lines.push("");
      }
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

function updateManual(manualContent: string, newSection: string): string {
  const startIdx = manualContent.indexOf(MARKER_START);
  const endIdx = manualContent.indexOf(MARKER_END);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `Error: No se encontraron los marcadores en el manual.\n` +
      `Se esperaban: "${MARKER_START}" y "${MARKER_END}"\n` +
      `Agrégalos al final del manual antes de la última línea de copyright.`
    );
    process.exit(1);
  }

  const before = manualContent.slice(0, startIdx);
  const after = manualContent.slice(endIdx + MARKER_END.length);

  return `${before}${MARKER_START}\n\n${newSection}\n${MARKER_END}${after}`;
}

function updateHeaderVersion(content: string, latestVersion: string): string {
  return content.replace(
    /\*\*Versión:\*\* .+/,
    `**Versión:** ${latestVersion}`
  ).replace(
    /\*\*Fecha:\*\* .+/,
    `**Fecha:** ${formatDate(new Date().toISOString().slice(0, 10))}`
  );
}

function main() {
  console.log("Leyendo changelog...");
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.error(`No se encontró: ${CHANGELOG_PATH}`);
    process.exit(1);
  }

  const changelog: Changelog = JSON.parse(fs.readFileSync(CHANGELOG_PATH, "utf-8"));
  console.log(`  ${changelog.entries.length} versiones encontradas.`);

  console.log("Leyendo manual...");
  if (!fs.existsSync(MANUAL_PATH)) {
    console.error(`No se encontró: ${MANUAL_PATH}`);
    process.exit(1);
  }

  let manual = fs.readFileSync(MANUAL_PATH, "utf-8");

  const latestVersion = changelog.entries[0]?.version ?? "4.0.0";
  console.log(`  Versión más reciente: ${latestVersion}`);

  const changelogSection = generateChangelogSection(changelog);
  manual = updateManual(manual, changelogSection);
  manual = updateHeaderVersion(manual, latestVersion);

  fs.writeFileSync(MANUAL_PATH, manual, "utf-8");

  const totalChanges = changelog.entries.reduce((sum, e) => sum + e.changes.length, 0);
  console.log(`\nManual actualizado exitosamente.`);
  console.log(`  Versiones documentadas: ${changelog.entries.length}`);
  console.log(`  Total de cambios registrados: ${totalChanges}`);
  console.log(`  Archivo: ${MANUAL_PATH}`);
}

main();
