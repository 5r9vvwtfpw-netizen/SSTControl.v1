import { createHash, createHmac, timingSafeEqual } from "crypto";
import { pool } from "../db";
import { objectStorageService } from "../objectStorage";

const WORKER_DELETION_TOKEN_TTL_MS = 5 * 60 * 1000;
const WORKER_REFERENCE_COLUMN_NAMES = new Set(["worker_id", "workerId"]);

type ForeignKeyReference = {
  schemaName: string;
  tableName: string;
  constraintName: string;
  deleteAction: string;
  columns: Array<{ column: string; referencedColumn: string }>;
  hasCompanyId: boolean;
  relationshipKind?: "worker_account" | "sve_identification";
};

type ReferenceCount = ForeignKeyReference & {
  count: number;
  crossTenantCount: number;
  rowSetHash: string;
  disposition: "delete" | "cascade" | "unlink";
};

type DescendantForeignKey = {
  schemaName: string;
  tableName: string;
  constraintName: string;
  deleteAction: string;
  columns: Array<{ column: string; referencedColumn: string }>;
};

type DescendantCount = DescendantForeignKey & {
  parentTableName: string;
  count: number;
  rowSetHash: string;
  disposition: "cascade";
};

type WorkerIdentity = {
  id: string;
  name: string;
  identification_number: string;
  company_id: string;
  photo_url: string | null;
};

type QueryResult<T> = { rows: T[]; rowCount: number | null };
type DeletionClient = {
  query<T = unknown>(queryText: string, values?: unknown[]): Promise<QueryResult<T>>;
  release(): void;
};

type DeletionPlan = {
  workerId: string;
  companyId: string;
  actorId: string;
  expiresAt: number;
  snapshot: string;
  photoPresent: boolean;
};

export class WorkerDeletionError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
    public readonly code: string = "WORKER_DELETION_ERROR",
  ) {
    super(message);
    this.name = "WorkerDeletionError";
  }
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function getTokenSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new WorkerDeletionError(
      "La eliminación segura no está disponible: falta configurar la clave de sesión.",
      503,
      "DELETION_SECURITY_NOT_CONFIGURED",
    );
  }
  return secret;
}

function hmac(value: string): string {
  return createHmac("sha256", getTokenSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-CO");
}

function normalizeIdentification(value: string): string {
  return value.trim().replace(/\s+/g, "").toLocaleUpperCase("es-CO");
}

function createPreviewToken(plan: DeletionPlan): string {
  const payload = Buffer.from(JSON.stringify(plan)).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

function readPreviewToken(token: unknown, actorId: string, workerId: string): DeletionPlan {
  if (typeof token !== "string") {
    throw new WorkerDeletionError("La confirmación venció o no es válida. Genere una vista previa nueva.", 400, "INVALID_PREVIEW_TOKEN");
  }

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) {
    throw new WorkerDeletionError("La confirmación venció o no es válida. Genere una vista previa nueva.", 400, "INVALID_PREVIEW_TOKEN");
  }

  const expectedSignature = hmac(payload);
  if (!safeEqual(signature, expectedSignature)) {
    throw new WorkerDeletionError("La confirmación venció o no es válida. Genere una vista previa nueva.", 400, "INVALID_PREVIEW_TOKEN");
  }

  let plan: DeletionPlan;
  try {
    plan = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as DeletionPlan;
  } catch {
    throw new WorkerDeletionError("La confirmación venció o no es válida. Genere una vista previa nueva.", 400, "INVALID_PREVIEW_TOKEN");
  }

  if (
    plan.actorId !== actorId ||
    plan.workerId !== workerId ||
    !plan.companyId ||
    !Number.isFinite(plan.expiresAt) ||
    plan.expiresAt <= Date.now() ||
    typeof plan.snapshot !== "string" ||
    typeof plan.photoPresent !== "boolean"
  ) {
    throw new WorkerDeletionError("La confirmación venció o no es válida. Genere una vista previa nueva.", 400, "INVALID_PREVIEW_TOKEN");
  }

  return plan;
}

async function getWorker(
  client: DeletionClient,
  workerId: string,
  companyId?: string,
  lock = false,
): Promise<WorkerIdentity> {
  const result = await client.query<WorkerIdentity>(
    `SELECT id, name, identification_number, company_id, photo_url
       FROM public.workers
      WHERE id = $1
        AND ($2::text IS NULL OR company_id = $2)
      ${lock ? "FOR UPDATE" : ""}`,
    [workerId, companyId ?? null],
  );

  if (!result.rows[0]) {
    throw new WorkerDeletionError("Trabajador no encontrado o fuera de la empresa autorizada.", 404, "WORKER_NOT_FOUND");
  }

  return result.rows[0];
}

async function listWorkerForeignKeys(client: DeletionClient): Promise<ForeignKeyReference[]> {
  const result = await client.query<{
    schema_name: string;
    table_name: string;
    constraint_name: string;
    delete_action: string;
    columns: Array<{ column: string; referencedColumn: string }>;
    has_company_id: boolean;
  }>(`
    SELECT
      child_namespace.nspname AS schema_name,
      child_table.relname AS table_name,
      constraint_row.conname AS constraint_name,
      constraint_row.confdeltype AS delete_action,
      json_agg(
        json_build_object(
          'column', child_column.attname,
          'referencedColumn', parent_column.attname
        )
        ORDER BY key_columns.ordinality
      ) AS columns,
      EXISTS (
        SELECT 1
          FROM pg_attribute company_column
         WHERE company_column.attrelid = child_table.oid
           AND company_column.attname = 'company_id'
           AND NOT company_column.attisdropped
      ) AS has_company_id
    FROM pg_constraint constraint_row
    JOIN pg_class child_table
      ON child_table.oid = constraint_row.conrelid
    JOIN pg_namespace child_namespace
      ON child_namespace.oid = child_table.relnamespace
    JOIN LATERAL unnest(constraint_row.conkey, constraint_row.confkey)
      WITH ORDINALITY AS key_columns(child_attnum, parent_attnum, ordinality)
      ON true
    JOIN pg_attribute child_column
      ON child_column.attrelid = child_table.oid
     AND child_column.attnum = key_columns.child_attnum
    JOIN pg_attribute parent_column
      ON parent_column.attrelid = constraint_row.confrelid
     AND parent_column.attnum = key_columns.parent_attnum
    WHERE constraint_row.contype = 'f'
      AND constraint_row.confrelid = 'public.workers'::regclass
      AND child_table.oid <> 'public.workers'::regclass
      AND child_namespace.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY
      child_namespace.nspname,
      child_table.oid,
      child_table.relname,
      constraint_row.conname,
      constraint_row.confdeltype
    ORDER BY child_namespace.nspname, child_table.relname, constraint_row.conname
  `);

  if (!result.rows.length) {
    throw new WorkerDeletionError("No fue posible verificar las relaciones de trabajadores; la operación se bloqueó.", 503, "WORKER_RELATIONSHIP_INVENTORY_FAILED");
  }

  return result.rows.map((row) => ({
    schemaName: row.schema_name,
    tableName: row.table_name,
    constraintName: row.constraint_name,
    deleteAction: row.delete_action,
    columns: row.columns,
    hasCompanyId: row.has_company_id,
  }));
}

function buildReferencePredicate(
  reference: ForeignKeyReference,
  worker: WorkerIdentity,
  startParameter = 1,
): { predicate: string; values: unknown[] } {
  if (!reference.columns.length) {
    throw new WorkerDeletionError("Se encontró una relación de datos no reconocida; la eliminación se bloqueó.", 409, "UNKNOWN_WORKER_RELATIONSHIP");
  }

  const values: unknown[] = [];
  const clauses = reference.columns.map(({ column, referencedColumn }) => {
    if (!(referencedColumn in worker)) {
      throw new WorkerDeletionError("Se encontró una relación de datos no reconocida; la eliminación se bloqueó.", 409, "UNKNOWN_WORKER_RELATIONSHIP");
    }
    values.push(worker[referencedColumn as keyof WorkerIdentity]);
    return `${quoteIdentifier(column)} = $${startParameter + values.length - 1}`;
  });

  return { predicate: clauses.join(" AND "), values };
}

function containsExternalObjectReference(value: unknown): boolean {
  if (typeof value === "string") {
    return /^(?:\/objects\/|uploads\/|s3:\/\/|https?:\/\/)/i.test(value.trim());
  }
  if (Array.isArray(value)) return value.some(containsExternalObjectReference);
  if (value && typeof value === "object") {
    return Object.values(value).some(containsExternalObjectReference);
  }
  return false;
}

async function loadReferenceRows(
  client: DeletionClient,
  reference: ForeignKeyReference,
  worker: WorkerIdentity,
  companyId: string,
): Promise<ReferenceCount> {
  const { predicate, values } = buildReferencePredicate(reference, worker);
  const tableName = `${quoteIdentifier(reference.schemaName)}.${quoteIdentifier(reference.tableName)}`;
  const companyPredicate = reference.hasCompanyId
    ? `AND ${quoteIdentifier("company_id")} = $${values.length + 1}`
    : "";
  const crossTenantPredicate = reference.hasCompanyId
    ? `AND ${quoteIdentifier("company_id")} IS DISTINCT FROM $${values.length + 1}`
    : "";
  const rowsResult = await client.query<{ row_json: unknown }>(
    `SELECT to_jsonb(reference_row) AS row_json
       FROM ${tableName} AS reference_row
      WHERE ${predicate} ${companyPredicate}
      ORDER BY to_jsonb(reference_row)::text`,
    reference.hasCompanyId ? [...values, companyId] : values,
  );
  const crossTenantResult = reference.hasCompanyId
    ? await client.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM ${tableName}
        WHERE ${predicate} ${crossTenantPredicate}`,
      [...values, companyId],
    )
    : { rows: [{ count: "0" }] };

  const hash = createHash("sha256");
  for (const row of rowsResult.rows) {
    // Database cascades cannot remove stored objects. Reject rather than
    // silently orphan a linked document or evidence file.
    if (containsExternalObjectReference(row.row_json)) {
      throw new WorkerDeletionError(
        "Hay archivos o enlaces externos en los registros asociados. La eliminación se bloqueó para revisión técnica.",
        409,
        "LINKED_EXTERNAL_FILES",
      );
    }
    hash.update(JSON.stringify(row.row_json));
    hash.update("\n");
  }

  const count = rowsResult.rows.length;
  const disposition =
    reference.deleteAction === "c"
      ? "cascade"
      : reference.deleteAction === "n"
        ? "unlink"
        : "delete";

  return {
    ...reference,
    count,
    crossTenantCount: Number(crossTenantResult.rows[0]?.count ?? 0),
    rowSetHash: hash.digest("hex"),
    disposition,
  };
}

async function listDescendantForeignKeys(
  client: DeletionClient,
  schemaName: string,
  tableName: string,
): Promise<DescendantForeignKey[]> {
  const result = await client.query<{
    schema_name: string;
    table_name: string;
    constraint_name: string;
    delete_action: string;
    columns: Array<{ column: string; referencedColumn: string }>;
  }>(`
    SELECT
      child_namespace.nspname AS schema_name,
      child_table.relname AS table_name,
      constraint_row.conname AS constraint_name,
      constraint_row.confdeltype AS delete_action,
      json_agg(
        json_build_object(
          'column', child_column.attname,
          'referencedColumn', parent_column.attname
        )
        ORDER BY key_columns.ordinality
      ) AS columns
    FROM pg_constraint constraint_row
    JOIN pg_class parent_table
      ON parent_table.oid = constraint_row.confrelid
    JOIN pg_namespace parent_namespace
      ON parent_namespace.oid = parent_table.relnamespace
    JOIN pg_class child_table
      ON child_table.oid = constraint_row.conrelid
    JOIN pg_namespace child_namespace
      ON child_namespace.oid = child_table.relnamespace
    JOIN LATERAL unnest(constraint_row.conkey, constraint_row.confkey)
      WITH ORDINALITY AS key_columns(child_attnum, parent_attnum, ordinality)
      ON true
    JOIN pg_attribute child_column
      ON child_column.attrelid = child_table.oid
     AND child_column.attnum = key_columns.child_attnum
    JOIN pg_attribute parent_column
      ON parent_column.attrelid = parent_table.oid
     AND parent_column.attnum = key_columns.parent_attnum
    WHERE constraint_row.contype = 'f'
      AND parent_namespace.nspname = $1
      AND parent_table.relname = $2
      AND child_namespace.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY
      child_namespace.nspname,
      child_table.relname,
      constraint_row.conname,
      constraint_row.confdeltype
    ORDER BY child_namespace.nspname, child_table.relname, constraint_row.conname
  `, [schemaName, tableName]);

  return result.rows.map((row) => ({
    schemaName: row.schema_name,
    tableName: row.table_name,
    constraintName: row.constraint_name,
    deleteAction: row.delete_action,
    columns: row.columns,
  }));
}

async function loadMaquinariaInspectionResponses(
  client: DeletionClient,
  worker: WorkerIdentity,
  foreignKey: DescendantForeignKey,
): Promise<DescendantCount> {
  const result = await client.query<{ row_json: unknown; company_id: string }>(
    `SELECT to_jsonb(response_row) AS row_json, inspection.company_id
       FROM public.maquinaria_inspeccion_respuestas AS response_row
       JOIN public.maquinaria_inspecciones AS inspection
         ON inspection.id = response_row.inspection_id
      WHERE inspection.worker_id = $1
      ORDER BY to_jsonb(response_row)::text`,
    [worker.id],
  );

  const hash = createHash("sha256");
  for (const row of result.rows) {
    if (row.company_id !== worker.company_id) {
      throw new WorkerDeletionError(
        "Se detectaron respuestas de inspección asociadas a otra empresa. La eliminación se bloqueó.",
        409,
        "CROSS_TENANT_WORKER_RELATIONSHIP",
      );
    }
    if (containsExternalObjectReference(row.row_json)) {
      throw new WorkerDeletionError(
        "Hay archivos o enlaces externos en las respuestas de inspección. La eliminación se bloqueó para revisión técnica.",
        409,
        "LINKED_EXTERNAL_FILES",
      );
    }
    hash.update(JSON.stringify(row.row_json));
    hash.update("\n");
  }

  return {
    ...foreignKey,
    parentTableName: "maquinaria_inspecciones",
    count: result.rows.length,
    rowSetHash: hash.digest("hex"),
    disposition: "cascade",
  };
}

async function countReferences(
  client: DeletionClient,
  worker: WorkerIdentity,
  companyId: string,
): Promise<{
  references: ReferenceCount[];
  descendants: DescendantCount[];
  unknownReferences: string[];
}> {
  const foreignKeys = await listWorkerForeignKeys(client);
  const references: ForeignKeyReference[] = [...foreignKeys];

  for (const reference of foreignKeys) {
    if (reference.schemaName !== "public") {
      throw new WorkerDeletionError("Se encontró una relación fuera del esquema esperado; la eliminación se bloqueó para revisión.", 409, "UNKNOWN_WORKER_RELATIONSHIP");
    }
  }

  // These legacy links deliberately have no FK: users use worker UUIDs while
  // SVE cases store the worker's identification number in worker_id.
  references.push(
    {
      schemaName: "public",
      tableName: "users",
      constraintName: "worker_deletion_users_worker_id",
      deleteAction: "n",
      columns: [{ column: "worker_id", referencedColumn: "id" }],
      hasCompanyId: true,
      relationshipKind: "worker_account",
    },
    {
      schemaName: "public",
      tableName: "sve_cases",
      constraintName: "worker_deletion_sve_cases_identification_number",
      deleteAction: "a",
      columns: [{ column: "worker_id", referencedColumn: "identification_number" }],
      hasCompanyId: true,
      relationshipKind: "sve_identification",
    },
  );

  const countedReferences: ReferenceCount[] = [];
  for (const reference of references) {
    countedReferences.push(await loadReferenceRows(client, reference, worker, companyId));
  }

  const descendants: DescendantCount[] = [];
  for (const reference of countedReferences.filter((candidate) => candidate.count > 0)) {
    const childForeignKeys = await listDescendantForeignKeys(
      client,
      reference.schemaName,
      reference.tableName,
    );
    if (!childForeignKeys.length) continue;
    // SET NULL relationships are preserved/unlinked, not deleted; their
    // descendants therefore cannot be removed by this worker deletion.
    if (reference.deleteAction === "n") continue;

    const isMaquinariaInspection =
      reference.schemaName === "public" && reference.tableName === "maquinaria_inspecciones";
    const isExplicitMaquinariaChild =
      childForeignKeys.length === 1 &&
      childForeignKeys[0].schemaName === "public" &&
      childForeignKeys[0].tableName === "maquinaria_inspeccion_respuestas" &&
      childForeignKeys[0].deleteAction === "c" &&
      childForeignKeys[0].columns.length === 1 &&
      childForeignKeys[0].columns[0].column === "inspection_id" &&
      childForeignKeys[0].columns[0].referencedColumn === "id";

    if (!isMaquinariaInspection || !isExplicitMaquinariaChild) {
      throw new WorkerDeletionError(
        reference.tableName === "sve_cases"
          ? "Los casos SVE tienen registros dependientes no incluidos en el plan. La eliminación se bloqueó para evitar dejar datos huérfanos."
          : `La relación ${reference.tableName} tiene registros dependientes no incluidos en el plan. La eliminación se bloqueó.`,
        409,
        reference.tableName === "sve_cases"
          ? "UNKNOWN_SVE_CASE_DESCENDANT"
          : "UNKNOWN_WORKER_DESCENDANT",
      );
    }

    descendants.push(
      await loadMaquinariaInspectionResponses(client, worker, childForeignKeys[0]),
    );
    const furtherDescendants = await listDescendantForeignKeys(
      client,
      childForeignKeys[0].schemaName,
      childForeignKeys[0].tableName,
    );
    if (furtherDescendants.length) {
      throw new WorkerDeletionError(
        "Las respuestas de inspección tienen registros dependientes no incluidos en el plan. La eliminación se bloqueó.",
        409,
        "UNKNOWN_WORKER_DESCENDANT",
      );
    }
  }

  const fkColumnsResult = await client.query<{ table_name: string; column_name: string }>(`
    SELECT DISTINCT child_table.relname AS table_name, child_column.attname AS column_name
    FROM pg_constraint constraint_row
    JOIN pg_class child_table ON child_table.oid = constraint_row.conrelid
    JOIN pg_namespace child_namespace ON child_namespace.oid = child_table.relnamespace
    JOIN LATERAL unnest(constraint_row.conkey) AS child_key(attnum) ON true
    JOIN pg_attribute child_column
      ON child_column.attrelid = child_table.oid
     AND child_column.attnum = child_key.attnum
    WHERE constraint_row.contype = 'f'
      AND child_namespace.nspname = 'public'
  `);
  const foreignKeyColumns = new Set(
    fkColumnsResult.rows.map((row) => `${row.table_name}.${row.column_name}`),
  );

  const plainWorkerColumns = await client.query<{ table_name: string; column_name: string; has_company_id: boolean }>(`
    SELECT DISTINCT
      table_row.relname AS table_name,
      column_row.attname AS column_name,
      EXISTS (
        SELECT 1 FROM pg_attribute company_column
         WHERE company_column.attrelid = table_row.oid
           AND company_column.attname = 'company_id'
           AND NOT company_column.attisdropped
      ) AS has_company_id
    FROM pg_class table_row
    JOIN pg_namespace namespace_row ON namespace_row.oid = table_row.relnamespace
    JOIN pg_attribute column_row ON column_row.attrelid = table_row.oid
    WHERE namespace_row.nspname = 'public'
      AND table_row.relkind IN ('r', 'p')
      AND column_row.attnum > 0
      AND NOT column_row.attisdropped
      AND (
        column_row.attname = ANY($1::text[])
        OR column_row.attname ~* '(worker|trabajador|empleado).*(_?id)$'
      )
      AND table_row.oid <> 'public.workers'::regclass
  `, [[...WORKER_REFERENCE_COLUMN_NAMES]]);

  const unknownReferences: string[] = [];
  const recognizedPlainLinks = new Set([
    "users.worker_id",
    "sve_cases.worker_id",
  ]);
  for (const column of plainWorkerColumns.rows) {
    if (foreignKeyColumns.has(`${column.table_name}.${column.column_name}`)) continue;
    if (recognizedPlainLinks.has(`${column.table_name}.${column.column_name}`)) continue;

    const tableName = `${quoteIdentifier("public")}.${quoteIdentifier(column.table_name)}`;
    const workerColumn = quoteIdentifier(column.column_name);
    const result = await client.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM ${tableName} WHERE ${workerColumn} = $1`,
      [worker.id],
    );
    if (Number(result.rows[0]?.count ?? 0) > 0) {
      unknownReferences.push(`${column.table_name}.${column.column_name}`);
    }
  }

  return { references: countedReferences, descendants, unknownReferences };
}

function referenceSnapshot(
  references: ReferenceCount[],
  descendants: DescendantCount[],
  photoUrl: string | null,
): string {
  const normalized = references.map((reference) => ({
    schema: reference.schemaName,
    table: reference.tableName,
    constraint: reference.constraintName,
    action: reference.deleteAction,
    columns: reference.columns,
    count: reference.count,
    crossTenantCount: reference.crossTenantCount,
    rowSetHash: reference.rowSetHash,
  }));
  return hmac(JSON.stringify({
    references: normalized,
    descendants: descendants.map((descendant) => ({
      schema: descendant.schemaName,
      table: descendant.tableName,
      parentTable: descendant.parentTableName,
      constraint: descendant.constraintName,
      action: descendant.deleteAction,
      columns: descendant.columns,
      count: descendant.count,
      rowSetHash: descendant.rowSetHash,
      disposition: descendant.disposition,
    })),
    photoPresent: Boolean(photoUrl),
    photoUrlFingerprint: photoUrl ? hmac(photoUrl) : null,
  }));
}

function assertNoUnknownOrCrossTenantReferences(
  references: ReferenceCount[],
  unknownReferences: string[],
): void {
  if (unknownReferences.length) {
    throw new WorkerDeletionError(
      "Hay registros relacionados que no se pueden clasificar con seguridad. No se eliminó ningún dato; solicite revisión técnica.",
      409,
      "UNKNOWN_WORKER_RELATIONSHIP",
    );
  }

  if (references.some((reference) => reference.crossTenantCount > 0)) {
    throw new WorkerDeletionError(
      "Se detectaron relaciones entre empresas. No se eliminó ningún dato; solicite revisión técnica.",
      409,
      "CROSS_TENANT_WORKER_RELATIONSHIP",
    );
  }

  if (references.some((reference) => reference.count > 0 && !["a", "r", "c", "n"].includes(reference.deleteAction))) {
    throw new WorkerDeletionError(
      "Se encontró una regla de borrado no reconocida. No se eliminó ningún dato.",
      409,
      "UNKNOWN_FOREIGN_KEY_ACTION",
    );
  }
}

export async function previewDeepWorkerDeletion(workerId: string, actorId: string) {
  const client = await pool.connect() as unknown as DeletionClient;
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const worker = await getWorker(client, workerId);
    const companyResult = await client.query<{ name: string }>(
      "SELECT name FROM public.companies WHERE id = $1",
      [worker.company_id],
    );
    if (!companyResult.rows[0]) {
      throw new WorkerDeletionError("No se encontró la empresa asociada; la eliminación se bloqueó.", 409, "WORKER_COMPANY_NOT_FOUND");
    }

    const { references, descendants, unknownReferences } =
      await countReferences(client, worker, worker.company_id);
    assertNoUnknownOrCrossTenantReferences(references, unknownReferences);

    const plan: DeletionPlan = {
      workerId: worker.id,
      companyId: worker.company_id,
      actorId,
      expiresAt: Date.now() + WORKER_DELETION_TOKEN_TTL_MS,
      snapshot: referenceSnapshot(references, descendants, worker.photo_url),
      photoPresent: Boolean(worker.photo_url),
    };

    await client.query("COMMIT");
    return {
      worker: {
        id: worker.id,
        name: worker.name,
        identificationNumber: worker.identification_number,
      },
      companyName: companyResult.rows[0].name,
      photoPresent: plan.photoPresent,
      expiresAt: new Date(plan.expiresAt).toISOString(),
      previewToken: createPreviewToken(plan),
      relationships: [
        ...references
          .filter((reference) => reference.count > 0)
          .map((reference) => ({
            table: reference.tableName,
            count: reference.count,
            disposition: reference.relationshipKind === "worker_account"
              ? "desactivar_y_desvincular"
              : reference.disposition,
          })),
        ...descendants
          .filter((descendant) => descendant.count > 0)
          .map((descendant) => ({
            table: descendant.tableName,
            count: descendant.count,
            disposition: descendant.disposition,
          })),
      ],
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function writeMinimalDeletionAudit(
  client: DeletionClient,
  worker: WorkerIdentity,
  actorId: string,
  references: ReferenceCount[],
  descendants: DescendantCount[],
  action: "delete" | "delete_unlinked",
): Promise<void> {
  const actorResult = await client.query<{ role: string }>(
    "SELECT role FROM public.users WHERE id = $1",
    [actorId],
  );
  const actor = actorResult.rows[0];
  if (!actor) {
    throw new WorkerDeletionError("No se pudo verificar al usuario que solicita la operación.", 403, "DELETION_ACTOR_NOT_FOUND");
  }

  const relationCounts: Record<string, number> = {};
  for (const reference of references) {
    if (reference.count > 0) {
      relationCounts[reference.tableName] = (relationCounts[reference.tableName] ?? 0) + reference.count;
    }
  }
  for (const descendant of descendants) {
    if (descendant.count > 0) {
      relationCounts[descendant.tableName] =
        (relationCounts[descendant.tableName] ?? 0) + descendant.count;
    }
  }
  await client.query(
    `INSERT INTO public.audit_logs
      (company_id, user_id, user_role, username, entity_type, entity_id, action,
       data_subject_id, data_subject_name, old_values, new_values, description, source)
     VALUES ($1, $2, $3, $4, 'worker', $5, 'delete', NULL, NULL, NULL, $6, $7, 'api')`,
    [
      worker.company_id,
      actorId,
      actor.role,
      actor.role,
      `worker-deletion:${hmac(`${worker.company_id}:${worker.id}`).slice(0, 24)}`,
      JSON.stringify({ action, reason: action === "delete" ? "registro_creado_por_error_confirmado_por_superadmin" : "sin_vinculaciones", relationCounts, workerRowDeleted: 1 }),
      "Eliminación de trabajador confirmada; se registraron únicamente cantidades por tipo de relación.",
    ],
  );
}

async function updateCompanyWorkerCount(client: DeletionClient, companyId: string): Promise<void> {
  await client.query(
    `UPDATE public.companies
        SET number_of_workers = (
          SELECT count(*)::integer FROM public.workers WHERE company_id = $1
        )
      WHERE id = $1`,
    [companyId],
  );
}

type PhotoCleanupResult =
  | { status: "not_present" }
  | { status: "deleted" }
  | { status: "retained_shared" }
  | { status: "failed"; message: string };

async function cleanupWorkerPhotoAfterCommit(workerId: string, photoUrl: string | null): Promise<PhotoCleanupResult> {
  if (!photoUrl) return { status: "not_present" };

  try {
    const targetPath = objectStorageService.normalizeObjectEntityPath(photoUrl);
    // Only remove photos created for this worker. A stored URL must never be
    // allowed to select an arbitrary S3 object for deletion.
    if (!targetPath.startsWith(`/objects/worker-photos/${workerId}-`) ||
        !/^\/objects\/worker-photos\/[a-f0-9-]+-\d+\.[A-Za-z0-9]+$/.test(targetPath)) {
      return { status: "failed", message: "La ruta de la fotografía requiere revisión manual." };
    }
    const client = await pool.connect() as unknown as DeletionClient;
    let photoPaths: string[] = [];
    try {
      const sharingResult = await client.query<{ photo_url: string }>(
        "SELECT photo_url FROM public.workers WHERE photo_url IS NOT NULL",
        [],
      );
      photoPaths = sharingResult.rows.map((row) =>
        objectStorageService.normalizeObjectEntityPath(row.photo_url),
      );
    } finally {
      client.release();
    }

    if (photoPaths.includes(targetPath)) {
      return { status: "retained_shared" };
    }

    await objectStorageService.deleteObject(targetPath);
    return { status: "deleted" };
  } catch {
    return {
      status: "failed",
      message: "El registro se eliminó, pero no se pudo limpiar o verificar la foto en almacenamiento; se requiere revisión.",
    };
  }
}

async function deleteWorkerRow(client: DeletionClient, worker: WorkerIdentity): Promise<void> {
  const result = await client.query(
    "DELETE FROM public.workers WHERE id = $1 AND company_id = $2",
    [worker.id, worker.company_id],
  );
  if (result.rowCount !== 1) {
    throw new WorkerDeletionError("El trabajador cambió durante la operación. No se eliminó ningún dato.", 409, "WORKER_CHANGED_DURING_DELETE");
  }
}

export async function executeDeepWorkerDeletion(input: {
  workerId: string;
  actorId: string;
  previewToken: unknown;
  confirmName: unknown;
  confirmIdentificationNumber: unknown;
  confirmErroneousRecord: unknown;
}) {
  if (input.confirmErroneousRecord !== true) {
    throw new WorkerDeletionError(
      "Confirme que la ficha y sus evidencias se crearon por error antes de eliminarlas.",
      400,
      "ERRONEOUS_RECORD_CONFIRMATION_REQUIRED",
    );
  }
  const plan = readPreviewToken(input.previewToken, input.actorId, input.workerId);
  if (typeof input.confirmName !== "string" || typeof input.confirmIdentificationNumber !== "string") {
    throw new WorkerDeletionError("Escriba el nombre completo y el número de identificación para confirmar.", 400, "IDENTITY_CONFIRMATION_REQUIRED");
  }

  const client = await pool.connect() as unknown as DeletionClient;
  let photoUrl: string | null = null;
  let deletionResult: { deleted: true; workerRecordDeleted: number; relatedRecordsProcessed: number };
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const worker = await getWorker(client, input.workerId, plan.companyId, true);
    const expectedName = normalizeIdentity(worker.name);
    const submittedName = normalizeIdentity(input.confirmName);
    const expectedIdentification = normalizeIdentification(worker.identification_number);
    const submittedIdentification = normalizeIdentification(input.confirmIdentificationNumber);
    if (!safeEqual(expectedName, submittedName) || !safeEqual(expectedIdentification, submittedIdentification)) {
      throw new WorkerDeletionError("El nombre o la identificación no coinciden. No se eliminó ningún dato.", 400, "IDENTITY_CONFIRMATION_MISMATCH");
    }

    const { references, descendants, unknownReferences } =
      await countReferences(client, worker, worker.company_id);
    assertNoUnknownOrCrossTenantReferences(references, unknownReferences);
    if (
      plan.photoPresent !== Boolean(worker.photo_url) ||
      !safeEqual(referenceSnapshot(references, descendants, worker.photo_url), plan.snapshot)
    ) {
      throw new WorkerDeletionError("Los registros vinculados cambiaron desde la vista previa. Revísela de nuevo antes de confirmar.", 409, "DELETION_PREVIEW_STALE");
    }

    const blockingAction = references.find((reference) =>
      reference.count > 0 && !["a", "r", "c", "n"].includes(reference.deleteAction),
    );
    if (blockingAction) {
      throw new WorkerDeletionError("La eliminación encontró una relación no compatible. No se eliminó ningún dato.", 409, "UNKNOWN_FOREIGN_KEY_ACTION");
    }

    await writeMinimalDeletionAudit(client, worker, input.actorId, references, descendants, "delete");

    // Plain-text user links have no FK: disable worker portal accounts and unlink all linked users.
    const userReference = references.find((reference) => reference.relationshipKind === "worker_account");
    if (userReference && userReference.count > 0) {
      await client.query(
        `UPDATE public.users
            SET worker_id = NULL,
                is_active = CASE WHEN role = 'trabajador' THEN false ELSE is_active END
          WHERE worker_id = $1
            AND company_id = $2`,
        [worker.id, worker.company_id],
      );
    }

    // Remove NO ACTION / RESTRICT children explicitly; CASCADE and SET NULL are
    // left to PostgreSQL after the strict worker+company delete below.
    for (const reference of references) {
      if (!reference.count || !["a", "r"].includes(reference.deleteAction)) continue;
      const { predicate, values } = buildReferencePredicate(reference, worker);
      const tenantPredicate = reference.hasCompanyId
        ? ` AND ${quoteIdentifier("company_id")} = $${values.length + 1}`
        : "";
      await client.query(
        `DELETE FROM ${quoteIdentifier(reference.schemaName)}.${quoteIdentifier(reference.tableName)}
          WHERE ${predicate}${tenantPredicate}`,
        reference.hasCompanyId ? [...values, worker.company_id] : values,
      );
    }

    await deleteWorkerRow(client, worker);
    await updateCompanyWorkerCount(client, worker.company_id);
    photoUrl = worker.photo_url;
    await client.query("COMMIT");
    deletionResult = {
      deleted: true,
      workerRecordDeleted: 1,
      relatedRecordsProcessed: references.reduce((total, reference) => total + reference.count, 0) +
        descendants.reduce((total, descendant) => total + descendant.count, 0),
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    if ((error as { code?: string }).code === "23503") {
      throw new WorkerDeletionError(
        "Hay un registro relacionado que no se pudo clasificar con seguridad. La transacción se revirtió y no se eliminó ningún dato.",
        409,
        "UNKNOWN_WORKER_RELATIONSHIP",
      );
    }
    throw error;
  } finally {
    client.release();
  }

  const photoCleanup = await cleanupWorkerPhotoAfterCommit(input.workerId, photoUrl);
  return { ...deletionResult, complete: photoCleanup.status === "not_present" || photoCleanup.status === "deleted", photoCleanup };
}

export async function deleteUnlinkedWorker(input: {
  workerId: string;
  companyId: string;
  actorId: string;
}) {
  const client = await pool.connect() as unknown as DeletionClient;
  let photoUrl: string | null = null;
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const worker = await getWorker(client, input.workerId, input.companyId, true);
    const { references, descendants, unknownReferences } =
      await countReferences(client, worker, worker.company_id);
    assertNoUnknownOrCrossTenantReferences(references, unknownReferences);

    const linkedTables = references
      .filter((reference) => reference.count > 0)
      .map((reference) => reference.tableName);
    if (linkedTables.length) {
      throw new WorkerDeletionError(
        `Este trabajador tiene registros vinculados (${[...new Set(linkedTables)].join(", ")}). Solo superadmin puede iniciar una eliminación profunda con vista previa y confirmación.`,
        409,
        "WORKER_HAS_LINKED_RECORDS",
      );
    }

    await writeMinimalDeletionAudit(client, worker, input.actorId, references, descendants, "delete_unlinked");
    await deleteWorkerRow(client, worker);
    await updateCompanyWorkerCount(client, worker.company_id);
    photoUrl = worker.photo_url;
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    if ((error as { code?: string }).code === "23503") {
      throw new WorkerDeletionError(
        "El trabajador tiene registros vinculados no clasificados. La transacción se revirtió y no se eliminó ningún dato.",
        409,
        "WORKER_HAS_LINKED_RECORDS",
      );
    }
    throw error;
  } finally {
    client.release();
  }
  const photoCleanup = await cleanupWorkerPhotoAfterCommit(input.workerId, photoUrl);
  return {
    deleted: true,
    workerRecordDeleted: 1,
    relatedRecordsProcessed: 0,
    complete: photoCleanup.status === "not_present" || photoCleanup.status === "deleted",
    photoCleanup,
  };
}