import { useMemo } from "react";
import { 
  usePesvSmartPrefill, 
  CompanyData,
  VehicleStats,
  DriverStats,
  SstObjectiveData,
  OperationalStats
} from "./usePesvSmartPrefill";
import { 
  getPrefillConfigForStep, 
  PrefillFieldConfig 
} from "@/data/pesv-smart-prefill-map";
import type { PrefillField } from "@/components/pesv/SmartPrefillBanner";

interface RawPrefillData {
  companyData: CompanyData | null;
  vehicleStats: VehicleStats | null;
  driverStats: DriverStats | null;
  workersList: Array<{ id: string; name: string }>;
  sstObjectives: SstObjectiveData[];
  operationalStats: OperationalStats;
}

interface UsePesvStepPrefillResult {
  isLoading: boolean;
  error: Error | null;
  prefillFields: PrefillField[];
  defaultValues: Record<string, unknown>;
  rawData: RawPrefillData;
}

function getCompanyField(companyData: CompanyData, fieldName: string): string | null {
  switch (fieldName) {
    case 'name': return companyData.name;
    case 'nit': return companyData.nit;
    case 'arl': return companyData.arl;
    case 'actividadEconomica': return companyData.actividadEconomica;
    case 'responsableSst': return companyData.responsableSst;
    case 'representanteLegal': return companyData.representanteLegal;
    default: return null;
  }
}

function resolveFieldValue(
  fieldConfig: PrefillFieldConfig,
  data: RawPrefillData
): string | number | null | undefined {
  const { source, sourceField, transform } = fieldConfig;

  switch (source) {
    case "company": {
      if (!data.companyData) return null;
      if (sourceField) {
        return getCompanyField(data.companyData, sourceField);
      }
      return null;
    }

    case "vehicles": {
      if (!data.vehicleStats) return null;
      switch (transform) {
        case "count":
          return data.vehicleStats.total;
        case "active":
          return data.vehicleStats.active;
        case "byType":
          return JSON.stringify(data.vehicleStats.byType);
        case "list":
          return `${data.vehicleStats.total} vehículos`;
        default:
          return data.vehicleStats.total;
      }
    }

    case "drivers": {
      if (!data.driverStats) return null;
      switch (transform) {
        case "count":
          return data.driverStats.total;
        case "active":
          return data.driverStats.active;
        case "expiring":
          return data.driverStats.withLicenseExpiring;
        case "list":
          return `${data.driverStats.total} conductores`;
        default:
          return data.driverStats.total;
      }
    }

    case "workers": {
      if (!data.workersList) return null;
      switch (transform) {
        case "count":
          return data.workersList.length;
        case "list":
          return `${data.workersList.length} trabajadores`;
        default:
          return data.workersList.length;
      }
    }

    case "sstObjectives": {
      if (!data.sstObjectives || data.sstObjectives.length === 0) return null;
      switch (transform) {
        case "count":
          return data.sstObjectives.length;
        case "list":
          return `${data.sstObjectives.length} objetivos`;
        default:
          return data.sstObjectives.length;
      }
    }

    case "inspections": {
      const stats = data.operationalStats?.inspections;
      if (!stats) return null;
      switch (transform) {
        case "count":
          return stats.total;
        case "passed":
          return stats.passed;
        case "failed":
          return stats.failed;
        case "list":
          return stats.items.length > 0
            ? stats.items.slice(0, 5).map(i => i.label).join("; ")
            : null;
        case "summary":
          return stats.total > 0
            ? `${stats.total} inspecciones (${stats.passed} aprobadas, ${stats.failed} rechazadas)`
            : "Sin inspecciones registradas";
        default:
          return stats.total;
      }
    }

    case "incidents": {
      const stats = data.operationalStats?.incidents;
      if (!stats) return null;
      switch (transform) {
        case "count":
          return stats.total;
        case "injuries":
          return stats.injuries;
        case "fatalities":
          return stats.fatalities;
        case "list":
          return stats.items.length > 0
            ? stats.items.slice(0, 5).map(i => i.label).join("; ")
            : null;
        case "summary":
          return stats.total > 0
            ? `${stats.total} siniestros (${stats.injuries} lesionados, ${stats.fatalities} fatalidades)`
            : "Sin siniestros registrados";
        default:
          return stats.total;
      }
    }

    case "trainings": {
      const stats = data.operationalStats?.trainings;
      if (!stats) return null;
      switch (transform) {
        case "count":
          return stats.total;
        case "completed":
          return stats.completed;
        case "list":
          return stats.items.length > 0
            ? stats.items.slice(0, 5).map(t => t.label).join("; ")
            : null;
        case "summary":
          return stats.total > 0
            ? `${stats.total} capacitaciones (${stats.completed} completadas)`
            : "Sin capacitaciones registradas";
        default:
          return stats.total;
      }
    }

    case "audits": {
      const stats = data.operationalStats?.audits;
      if (!stats) return null;
      switch (transform) {
        case "count":
          return stats.total;
        case "list":
          return stats.items.length > 0
            ? stats.items.slice(0, 5).map(a => a.label).join("; ")
            : null;
        case "summary":
          return stats.total > 0
            ? `${stats.total} auditorías realizadas`
            : "Sin auditorías registradas";
        default:
          return stats.total;
      }
    }

    case "calculated":
      return null;

    default:
      return null;
  }
}

export function usePesvStepPrefill(stepCode: string): UsePesvStepPrefillResult {
  const {
    companyData,
    vehicleStats,
    driverStats,
    workersList,
    sstObjectives,
    operationalStats,
    isLoading,
    error,
  } = usePesvSmartPrefill();

  const stepConfig = useMemo(() => getPrefillConfigForStep(stepCode), [stepCode]);

  const rawData: RawPrefillData = useMemo(
    () => ({
      companyData,
      vehicleStats,
      driverStats,
      workersList: workersList.map(w => ({ id: w.id, name: w.name })),
      sstObjectives,
      operationalStats,
    }),
    [companyData, vehicleStats, driverStats, workersList, sstObjectives, operationalStats]
  );

  const prefillFields: PrefillField[] = useMemo(() => {
    if (!stepConfig || isLoading) return [];

    return stepConfig.fields.map((fieldConfig) => {
      const value = resolveFieldValue(fieldConfig, rawData);
      return {
        label: fieldConfig.label,
        value,
        applied: value != null,
      };
    });
  }, [stepConfig, rawData, isLoading]);

  const defaultValues: Record<string, unknown> = useMemo(() => {
    if (!stepConfig || isLoading) return {};

    const values: Record<string, unknown> = {};
    stepConfig.fields.forEach((fieldConfig) => {
      const value = resolveFieldValue(fieldConfig, rawData);
      if (value != null) {
        values[fieldConfig.field] = value;
      }
    });

    return values;
  }, [stepConfig, rawData, isLoading]);

  return {
    isLoading,
    error,
    prefillFields,
    defaultValues,
    rawData,
  };
}
