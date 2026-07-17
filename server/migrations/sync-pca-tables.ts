import { pool } from "../db";

export async function syncPcaTables() {
  const client = await pool.connect();
  try {
    console.log("[Migration] Sincronizando tablas PCA (Conservación Auditiva)...");

    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'noise_exposure_profiles'
    `);

    const pcaProgramsCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'pca_programs'
    `);

    if (tableCheck.rows.length === 0) {
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
    } else {
      console.log("[Migration] ✅ Tabla noise_exposure_profiles ya existe");
      // Even if noise_exposure_profiles exists, ensure pca_programs exists (independent check)
      if (pcaProgramsCheck.rows.length === 0) {
        console.log("[Migration] Creando tabla pca_programs (faltaba)...");
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
      } else {
        console.log("[Migration] ✅ Tabla pca_programs ya existe");
      }
    }
  } catch (error) {
    console.error("[Migration] Error sincronizando tablas PCA:", error);
  } finally {
    client.release();
  }

  await syncAudiometryRecordsTable();
}

async function syncAudiometryRecordsTable() {
  const client = await pool.connect();
  try {
    const audiometryCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audiometry_records'
    `);

    if (audiometryCheck.rows.length > 0) {
      console.log("[Migration] ✅ Tabla audiometry_records ya existe");
      return;
    }

    console.log("[Migration] Creando tabla audiometry_records...");

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audiometry_result') THEN
          CREATE TYPE audiometry_result AS ENUM (
            'normal',
            'trauma_leve',
            'trauma_moderado',
            'trauma_severo',
            'pendiente'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audiometry_type') THEN
          CREATE TYPE audiometry_type AS ENUM (
            'ingreso',
            'inicial_90_dias',
            'periodica',
            'seguimiento',
            'retiro'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audiometry_status') THEN
          CREATE TYPE audiometry_status AS ENUM (
            'programada',
            'realizada',
            'vencida',
            'cancelada'
          );
        END IF;
      END $$;
    `);
    console.log("[Migration] ✅ Enums de audiometría creados/verificados");

    await client.query(`
      CREATE TABLE IF NOT EXISTS audiometry_records (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        worker_id VARCHAR NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        medical_exam_id VARCHAR REFERENCES medical_exams(id) ON DELETE SET NULL,
        audiometry_type audiometry_type NOT NULL,
        scheduled_date DATE NOT NULL,
        exam_date DATE,
        audiometry_status audiometry_status NOT NULL DEFAULT 'programada',
        right_ear_500hz INTEGER,
        right_ear_1000hz INTEGER,
        right_ear_2000hz INTEGER,
        right_ear_3000hz INTEGER,
        right_ear_4000hz INTEGER,
        right_ear_6000hz INTEGER,
        right_ear_average INTEGER,
        left_ear_500hz INTEGER,
        left_ear_1000hz INTEGER,
        left_ear_2000hz INTEGER,
        left_ear_3000hz INTEGER,
        left_ear_4000hz INTEGER,
        left_ear_6000hz INTEGER,
        left_ear_average INTEGER,
        overall_result audiometry_result DEFAULT 'pendiente',
        is_baseline INTEGER NOT NULL DEFAULT 0,
        threshold_shift_detected INTEGER DEFAULT 0,
        threshold_shift_details TEXT,
        performed_by TEXT,
        professional_license TEXT,
        clinic_name TEXT,
        report_url TEXT,
        report_name TEXT,
        observations TEXT,
        recommendations TEXT,
        next_audiometry_date DATE,
        requires_followup INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log("[Migration] ✅ Tabla audiometry_records creada");

  } catch (error) {
    console.error("[Migration] Error creando tabla audiometry_records:", error);
  } finally {
    client.release();
  }
}
