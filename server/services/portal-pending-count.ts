import { sql } from "drizzle-orm";
import { db } from "../db";

export type PortalPendingCount = {
  messages: number;
  capacitaciones: number;
  capacitacionesSst: number;
  capacitacionesPesv: number;
  examenes: number;
  inducciones: number;
  induccionesSst: number;
  induccionesPesv: number;
  audiometrias: number;
  elecciones: number;
  eleccionesCopasst: number;
  eleccionesConvivencia: number;
  encuestaDiaria: number;
  inspeccionesVehiculo: number;
  total: number;
};

const emptyCount = (): PortalPendingCount => ({
  messages: 0,
  capacitaciones: 0,
  capacitacionesSst: 0,
  capacitacionesPesv: 0,
  examenes: 0,
  inducciones: 0,
  induccionesSst: 0,
  induccionesPesv: 0,
  audiometrias: 0,
  elecciones: 0,
  eleccionesCopasst: 0,
  eleccionesConvivencia: 0,
  encuestaDiaria: 0,
  inspeccionesVehiculo: 0,
  total: 0,
});

export async function getPortalPendingCount(
  userId: string,
  companyId: string | null | undefined,
): Promise<PortalPendingCount> {
  if (!companyId) return emptyCount();

  const result = await db.execute(sql`
    WITH resolved_worker AS (
      SELECT COALESCE(u.worker_id, w.id) AS worker_id
      FROM users u
      LEFT JOIN workers w
        ON u.worker_id IS NULL
        AND lower(w.email) = lower(u.email)
        AND w.company_id = ${companyId}
      WHERE u.id = ${userId}
      LIMIT 1
    ),
    worker_driver AS (
      SELECT d.id, d.name
      FROM drivers d
      JOIN resolved_worker rw ON d.worker_id = rw.worker_id
      WHERE d.company_id = ${companyId}
      LIMIT 1
    ),
    training_pending AS (
      SELECT 'program:' || ca.id AS pending_id, 'sst' AS training_type
      FROM capacitacion_asistentes ca
      JOIN capacitacion_eventos ce ON ce.id = ca.evento_id
      JOIN resolved_worker rw ON rw.worker_id = ca.worker_id
      WHERE ce.company_id = ${companyId} AND ca.estado = 'invitado'

      UNION

      SELECT 'legacy:' || ta.id, 'sst'
      FROM training_attendees ta
      JOIN trainings t ON t.id = ta.training_id
      JOIN resolved_worker rw ON rw.worker_id = ta.worker_id
      WHERE t.company_id = ${companyId}
        AND ta.attended = 0
        AND ta.confirmed = 0

      UNION

      SELECT 'pesv:' || rwa.training_id, 'pesv'
      FROM road_safety_worker_attendees rwa
      JOIN road_safety_trainings rst ON rst.id = rwa.training_id
      JOIN resolved_worker rw ON rw.worker_id = rwa.worker_id
      WHERE rst.company_id = ${companyId}
        AND rwa.invited = 1
        AND rwa.attended = 0
        AND rwa.confirmed_at IS NULL

      UNION

      SELECT 'pesv:' || rsa.training_id, 'pesv'
      FROM road_safety_attendees rsa
      JOIN road_safety_trainings rst ON rst.id = rsa.training_id
      JOIN worker_driver wd ON wd.id = rsa.driver_id
      WHERE rst.company_id = ${companyId}
        AND rsa.attended = 0
        AND NOT EXISTS (
          SELECT 1
          FROM road_safety_worker_attendees rwa
          JOIN resolved_worker rw ON rw.worker_id = rwa.worker_id
          WHERE rwa.training_id = rsa.training_id
            AND rwa.confirmed_at IS NOT NULL
        )
    )
    SELECT
      (
        SELECT count(*)::int
        FROM internal_messages
        WHERE receiver_id = ${userId}
          AND company_id = ${companyId}
          AND status = 'unread'
      ) AS messages,
      (SELECT count(*)::int FROM training_pending) AS capacitaciones,
      (SELECT count(*)::int FROM training_pending WHERE training_type = 'sst') AS capacitaciones_sst,
      (SELECT count(*)::int FROM training_pending WHERE training_type = 'pesv') AS capacitaciones_pesv,
      (
        SELECT count(*)::int
        FROM medical_exams me
        JOIN resolved_worker rw ON rw.worker_id = me.worker_id
        WHERE me.company_id = ${companyId}
          AND me.notification_sent_at IS NOT NULL
          AND me.read_confirmed_at IS NULL
      ) AS examenes,
      (
        SELECT count(*)::int
        FROM sesiones_induccion_virtual s
        JOIN resolved_worker rw ON rw.worker_id = s.worker_id
        WHERE s.company_id = ${companyId}
          AND s.estado = 'pendiente'
          AND s.fecha_expiracion > now()
      ) AS inducciones,
      (
        SELECT count(*)::int
        FROM sesiones_induccion_virtual s
        JOIN resolved_worker rw ON rw.worker_id = s.worker_id
        WHERE s.company_id = ${companyId}
          AND s.estado = 'pendiente'
          AND s.fecha_expiracion > now()
          AND s.tipo_induccion <> 'pesv'
      ) AS inducciones_sst,
      (
        SELECT count(*)::int
        FROM sesiones_induccion_virtual s
        JOIN resolved_worker rw ON rw.worker_id = s.worker_id
        WHERE s.company_id = ${companyId}
          AND s.estado = 'pendiente'
          AND s.fecha_expiracion > now()
          AND s.tipo_induccion = 'pesv'
      ) AS inducciones_pesv,
      (
        SELECT count(*)::int
        FROM audiometry_records ar
        JOIN resolved_worker rw ON rw.worker_id = ar.worker_id
        WHERE ar.company_id = ${companyId}
          AND ar.audiometry_status = 'programada'
      ) AS audiometrias,
      (
        SELECT count(*)::int
        FROM copasst_elecciones e
        CROSS JOIN resolved_worker rw
        WHERE e.company_id = ${companyId}
          AND e.publicado_en_portal = true
          AND e.estado = 'votacion'
          AND NOT EXISTS (
            SELECT 1
            FROM copasst_registro_votacion r
            WHERE r.eleccion_id = e.id AND r.worker_id = rw.worker_id
          )
      ) + (
        SELECT count(*)::int
        FROM convivencia_elecciones e
        CROSS JOIN resolved_worker rw
        WHERE e.company_id = ${companyId}
          AND e.publicado_en_portal = true
          AND e.estado = 'votacion'
          AND NOT EXISTS (
            SELECT 1
            FROM convivencia_registro_votacion r
            WHERE r.eleccion_id = e.id AND r.worker_id = rw.worker_id
          )
      ) AS elecciones,
      (
        SELECT count(*)::int
        FROM copasst_elecciones e
        CROSS JOIN resolved_worker rw
        WHERE e.company_id = ${companyId}
          AND e.publicado_en_portal = true
          AND e.estado = 'votacion'
          AND NOT EXISTS (
            SELECT 1
            FROM copasst_registro_votacion r
            WHERE r.eleccion_id = e.id AND r.worker_id = rw.worker_id
          )
      ) AS elecciones_copasst,
      (
        SELECT count(*)::int
        FROM convivencia_elecciones e
        CROSS JOIN resolved_worker rw
        WHERE e.company_id = ${companyId}
          AND e.publicado_en_portal = true
          AND e.estado = 'votacion'
          AND NOT EXISTS (
            SELECT 1
            FROM convivencia_registro_votacion r
            WHERE r.eleccion_id = e.id AND r.worker_id = rw.worker_id
          )
      ) AS elecciones_convivencia,
      CASE
        WHEN EXISTS (SELECT 1 FROM worker_driver)
          AND NOT EXISTS (
            SELECT 1
            FROM pesv_encuestas_conductor p
            JOIN worker_driver wd ON lower(p.conductor_nombre) = lower(wd.name)
            WHERE p.company_id = ${companyId}
              AND p.fecha_registro = (now() AT TIME ZONE 'America/Bogota')::date
          )
        THEN 1 ELSE 0
      END AS encuesta_diaria,
      (
        SELECT count(*)::int
        FROM driver_vehicle_assignments dva
        JOIN worker_driver wd ON wd.id = dva.driver_id
        JOIN vehicles v ON v.id = dva.vehicle_id
        WHERE dva.company_id = ${companyId}
          AND dva.is_active = 1
          AND v.status = 'activo'
          AND dva.start_date <= (now() AT TIME ZONE 'America/Bogota')::date
          AND (
            dva.end_date IS NULL
            OR dva.end_date >= (now() AT TIME ZONE 'America/Bogota')::date
          )
          AND NOT EXISTS (
            SELECT 1
            FROM vehicle_inspections vi
            WHERE vi.driver_id = dva.driver_id
              AND vi.vehicle_id = dva.vehicle_id
              AND vi.inspection_date = (now() AT TIME ZONE 'America/Bogota')::date
          )
      ) AS inspecciones_vehiculo
  `);

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return emptyCount();

  const count = {
    messages: Number(row.messages ?? 0),
    capacitaciones: Number(row.capacitaciones ?? 0),
    capacitacionesSst: Number(row.capacitaciones_sst ?? 0),
    capacitacionesPesv: Number(row.capacitaciones_pesv ?? 0),
    examenes: Number(row.examenes ?? 0),
    inducciones: Number(row.inducciones ?? 0),
    induccionesSst: Number(row.inducciones_sst ?? 0),
    induccionesPesv: Number(row.inducciones_pesv ?? 0),
    audiometrias: Number(row.audiometrias ?? 0),
    elecciones: Number(row.elecciones ?? 0),
    eleccionesCopasst: Number(row.elecciones_copasst ?? 0),
    eleccionesConvivencia: Number(row.elecciones_convivencia ?? 0),
    encuestaDiaria: Number(row.encuesta_diaria ?? 0),
    inspeccionesVehiculo: Number(row.inspecciones_vehiculo ?? 0),
  };

  return {
    ...count,
    total:
      count.messages +
      count.capacitaciones +
      count.examenes +
      count.inducciones +
      count.audiometrias +
      count.elecciones +
      count.encuestaDiaria +
      count.inspeccionesVehiculo,
  };
}