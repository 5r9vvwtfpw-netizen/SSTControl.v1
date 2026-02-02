import { useMemo } from "react";
import { usePesvSmartPrefill } from "./usePesvSmartPrefill";
import { 
  getPrefillConfigForStep, 
  PrefillFieldConfig 
} from "@/data/pesv-smart-prefill-map";
import type { PrefillField } from "@/components/pesv/SmartPrefillBanner";

interface CompanyDataFields {
  name: string;
  nit: string;
  arl: string | null;
  numWorkers: number;
  numVehicles: number;
  numDrivers: number;
  actividadEconomica?: string;
  responsableSst?: string;
  representanteLegal?: string;
}

interface RawPrefillData {
  companyData: CompanyDataFields | null;
  vehicleStats: {
    total: number;
    active: number;
    byType: Record<string, number>;
  } | null;
  driverStats: {
    total: number;
    active: number;
    withLicenseExpiring: number;
  } | null;
  workersList: Array<{ id: string; name: string }>;
}

interface UsePesvStepPrefillResult {
  isLoading: boolean;
  error: Error | null;
  prefillFields: PrefillField[];
  defaultValues: Record<string, unknown>;
  rawData: RawPrefillData;
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
        const companyRecord = data.companyData as unknown as Record<string, unknown>;
        const value = companyRecord[sourceField];
        return value != null ? String(value) : null;
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
      return null;
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
    isLoading,
    error,
  } = usePesvSmartPrefill();

  const stepConfig = useMemo(() => getPrefillConfigForStep(stepCode), [stepCode]);

  const rawData: RawPrefillData = useMemo(
    () => ({
      companyData: companyData as CompanyDataFields | null,
      vehicleStats,
      driverStats,
      workersList: workersList.map(w => ({ id: w.id, name: w.name })),
    }),
    [companyData, vehicleStats, driverStats, workersList]
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
