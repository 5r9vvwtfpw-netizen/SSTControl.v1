-- Migration: Add External LSO columns to responsible_designations table
-- This migration adds support for external LSO professionals (non-employee professionals)
-- as responsible parties for "Responsable del SG-SST" position
-- Required for Resolution 0312/2019 compliance

ALTER TABLE responsible_designations 
ADD COLUMN IF NOT EXISTS is_external_lso BOOLEAN DEFAULT FALSE;

ALTER TABLE responsible_designations 
ADD COLUMN IF NOT EXISTS external_lso_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN responsible_designations.is_external_lso IS 'Indicates if the responsible party is an external LSO professional (not a company worker)';
COMMENT ON COLUMN responsible_designations.external_lso_name IS 'Name of external LSO professional when no worker_id is provided';
