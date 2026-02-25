import { pool } from "../db";

export async function syncPcaTables() {
  const client = await pool.connect();
  try {
    console.log("[Migration] Sincronizando tablas PCA (Conservación Auditiva)...");

    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'noise_exposure_profiles'
    `);

    if (tableCheck.rows.length > 0) {
      console.log("[Migration] ✅ Tabla noise_exposure_profiles ya existe");
      return;
    }

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pca_control_type') THEN
          CREATE TYPE pca_control_type AS ENUM ('fuente', 'medio', 'epp', 'administrativo');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pca_action_status') THEN
          CREATE TYPE pca_action_status AS ENUM ('planificada', 'en_progreso', 'implementada', 'verificada', 'cancelada');
        END IF;
      END $$;
    `);
    console.log("[Migration] ✅ Enums PCA creados/verificados");

    await client.query(`
      CREATE TABLE IF NOT EXISTS noise_exposure_profiles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        area TEXT NOT NULL,
        job_position TEXT,
        job_profile_id VARCHAR REFERENCES job_profiles(id) ON DELETE SET NULL,
        environmental_measurement_id VARCHAR REFERENCES environmental_measurements(id) ON DELETE SET NULL,
        noise_level INTEGER NOT NULL,
        exposure_hours_day NUMERIC(4,2) NOT NULL,
        dose_percentage INTEGER,
        exceeds_limit INTEGER NOT NULL DEFAULT 0,
        required_protection TEXT[],
        exposed_workers_count INTEGER DEFAULT 0,
        audiometry_frequency_months INTEGER DEFAULT 24,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_review_date DATE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log("[Migration] ✅ Tabla noise_exposure_profiles creada");

    await client.query(`
      CREATE TABLE IF NOT EXISTS worker_exposure_assignments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        worker_id VARCHAR NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        exposure_profile_id VARCHAR NOT NULL REFERENCES noise_exposure_profiles(id) ON DELETE CASCADE,
        assignment_date DATE NOT NULL,
        end_date DATE,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log("[Migration] ✅ Tabla worker_exposure_assignments creada");

    await client.query(`
      CREATE TABLE IF NOT EXISTS pca_control_actions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        exposure_profile_id VARCHAR REFERENCES noise_exposure_profiles(id) ON DELETE SET NULL,
        control_type pca_control_type NOT NULL,
        description TEXT NOT NULL,
        objective TEXT,
        planned_date DATE NOT NULL,
        implementation_date DATE,
        verification_date DATE,
        responsible TEXT NOT NULL,
        verified_by TEXT,
        pre_implementation_level INTEGER,
        post_implementation_level INTEGER,
        effectiveness_percentage INTEGER,
        is_effective INTEGER,
        status pca_action_status NOT NULL DEFAULT 'planificada',
        evidence_url TEXT,
        evidence_name TEXT,
        observations TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log("[Migration] ✅ Tabla pca_control_actions creada");

    await client.query(`
      CREATE TABLE IF NOT EXISTS pca_programs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        total_exposed_workers INTEGER DEFAULT 0,
        total_audiometries_scheduled INTEGER DEFAULT 0,
        total_audiometries_completed INTEGER DEFAULT 0,
        total_control_actions INTEGER DEFAULT 0,
        total_controls_implemented INTEGER DEFAULT 0,
        audiometry_compliance_rate INTEGER,
        hearing_loss_incidence_rate NUMERIC(10,4),
        control_effectiveness_rate INTEGER,
        analysis_notes TEXT,
        recommendations TEXT,
        status TEXT NOT NULL DEFAULT 'borrador',
        approved_by TEXT,
        approval_date DATE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log("[Migration] ✅ Tabla pca_programs creada");

    console.log("[Migration] ✅ Todas las tablas PCA sincronizadas correctamente");
  } catch (error) {
    console.error("[Migration] Error sincronizando tablas PCA:", error);
  } finally {
    client.release();
  }
}
