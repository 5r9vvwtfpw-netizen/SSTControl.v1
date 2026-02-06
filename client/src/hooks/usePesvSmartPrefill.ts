import { useQuery } from "@tanstack/react-query";
import { Company, Vehicle, Driver, Worker, ObjetivoSst, VehicleInspection, RoadIncident, RoadSafetyTraining, AuditoriaInterna } from "@shared/schema";

export interface CompanyData {
  name: string;
  nit: string;
  arl: string | null;
  numWorkers: number;
  numVehicles: number;
  numDrivers: number;
  actividadEconomica: string | null;
  responsableSst: string | null;
  representanteLegal: string | null;
}

export interface VehicleStats {
  total: number;
  active: number;
  byType: Record<string, number>;
}

export interface DriverStats {
  total: number;
  active: number;
  withLicenseExpiring: number;
}

export interface SstObjectiveData {
  id: string;
  nombre: string;
  descripcion: string | null;
  porcentajeAvance: number;
}

export interface InspectionSummary {
  id: string;
  label: string;
  date: string;
  vehicleId: string;
  driverId: string;
  result: string;
}

export interface IncidentSummary {
  id: string;
  label: string;
  date: string;
  type: string;
  severity: string;
  location: string;
}

export interface TrainingSummary {
  id: string;
  label: string;
  date: string;
  status: string;
  totalAttendees: number;
}

export interface AuditSummary {
  id: string;
  label: string;
  date: string;
  tipo: string;
  estado: string;
}

export interface OperationalStats {
  inspections: {
    total: number;
    passed: number;
    failed: number;
    items: InspectionSummary[];
  };
  incidents: {
    total: number;
    injuries: number;
    fatalities: number;
    items: IncidentSummary[];
  };
  trainings: {
    total: number;
    completed: number;
    items: TrainingSummary[];
  };
  audits: {
    total: number;
    items: AuditSummary[];
  };
}

export interface PesvSmartPrefillData {
  companyData: CompanyData | null;
  vehicleStats: VehicleStats | null;
  driverStats: DriverStats | null;
  workersList: Worker[];
  sstObjectives: SstObjectiveData[];
  operationalStats: OperationalStats;
  isLoading: boolean;
  error: Error | null;
}

const DAYS_UNTIL_EXPIRY_THRESHOLD = 30;

export function usePesvSmartPrefill(): PesvSmartPrefillData {
  const { data: company, isLoading: isLoadingCompany, error: companyError } = useQuery<Company>({
    queryKey: ["/api/company/current"],
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles, error: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [], isLoading: isLoadingDrivers, error: driversError } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: workers = [], isLoading: isLoadingWorkers, error: workersError } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: objetivos = [], isLoading: isLoadingObjectives, error: objectivesError } = useQuery<ObjetivoSst[]>({
    queryKey: ["/api/objetivos-sst"],
  });

  const { data: inspections = [], isLoading: isLoadingInspections, error: inspectionsError } = useQuery<VehicleInspection[]>({
    queryKey: ["/api/vehicle-inspections"],
  });

  const { data: incidents = [], isLoading: isLoadingIncidents, error: incidentsError } = useQuery<RoadIncident[]>({
    queryKey: ["/api/road-incidents"],
  });

  const { data: trainings = [], isLoading: isLoadingTrainings, error: trainingsError } = useQuery<RoadSafetyTraining[]>({
    queryKey: ["/api/road-safety-trainings"],
  });

  const { data: audits = [], isLoading: isLoadingAudits, error: auditsError } = useQuery<AuditoriaInterna[]>({
    queryKey: ["/api/auditorias-internas"],
  });

  const isLoading = isLoadingCompany || isLoadingVehicles || isLoadingDrivers || isLoadingWorkers || isLoadingObjectives
    || isLoadingInspections || isLoadingIncidents || isLoadingTrainings || isLoadingAudits;

  const error = companyError || vehiclesError || driversError || workersError || objectivesError
    || inspectionsError || incidentsError || trainingsError || auditsError || null;

  const companyData: CompanyData | null = company ? {
    name: company.name,
    nit: company.nit,
    arl: company.arlNombreEmpresa || null,
    numWorkers: company.numberOfWorkers,
    numVehicles: company.numberOfVehicles || vehicles.length,
    numDrivers: drivers.length,
    actividadEconomica: company.actividadPrincipal || null,
    responsableSst: company.responsableSstNombre || null,
    representanteLegal: company.representanteLegal || null,
  } : null;

  const sstObjectives: SstObjectiveData[] = objetivos.map(obj => ({
    id: obj.id,
    nombre: obj.nombre,
    descripcion: obj.descripcion || null,
    porcentajeAvance: obj.porcentajeAvance || 0,
  }));

  const vehicleStats: VehicleStats | null = vehicles.length > 0 ? {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === "activo").length,
    byType: vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : null;

  const driverStats: DriverStats | null = drivers.length > 0 ? {
    total: drivers.length,
    active: drivers.filter(d => d.status === "activo").length,
    withLicenseExpiring: drivers.filter(d => {
      if (!d.licenseExpiry) return false;
      const expiryDate = new Date(d.licenseExpiry);
      const today = new Date();
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= DAYS_UNTIL_EXPIRY_THRESHOLD;
    }).length,
  } : null;

  const vehicleMap = vehicles.reduce((acc, v) => { acc[v.id] = v.plate || v.make || v.id; return acc; }, {} as Record<string, string>);
  const driverMap = drivers.reduce((acc, d) => { acc[d.id] = d.name || d.id; return acc; }, {} as Record<string, string>);

  const operationalStats: OperationalStats = {
    inspections: {
      total: inspections.length,
      passed: inspections.filter(i => i.result === "aprobado" || i.result === "approved").length,
      failed: inspections.filter(i => i.result === "rechazado" || i.result === "rejected" || i.result === "failed").length,
      items: inspections.map(i => ({
        id: i.id,
        label: `Inspección ${i.inspectionDate} - ${vehicleMap[i.vehicleId] || 'Vehículo'} (${i.result})`,
        date: i.inspectionDate,
        vehicleId: i.vehicleId,
        driverId: i.driverId,
        result: i.result,
      })).sort((a, b) => b.date.localeCompare(a.date)),
    },
    incidents: {
      total: incidents.length,
      injuries: incidents.reduce((sum, i) => sum + (i.injuries || 0), 0),
      fatalities: incidents.reduce((sum, i) => sum + (i.fatalities || 0), 0),
      items: incidents.map(i => ({
        id: i.id,
        label: `Siniestro ${i.incidentDate} - ${i.type} (${i.severity}) - ${i.location}`,
        date: i.incidentDate,
        type: i.type,
        severity: i.severity,
        location: i.location,
      })).sort((a, b) => b.date.localeCompare(a.date)),
    },
    trainings: {
      total: trainings.length,
      completed: trainings.filter(t => t.status === "completada" || t.status === "completed").length,
      items: trainings.map(t => ({
        id: t.id,
        label: `${t.title} - ${t.trainingDate} (${t.status})`,
        date: t.trainingDate,
        status: t.status,
        totalAttendees: t.totalAttendees || 0,
      })).sort((a, b) => b.date.localeCompare(a.date)),
    },
    audits: {
      total: audits.length,
      items: audits.map(a => ({
        id: a.id,
        label: `Auditoría ${(a as any).titulo || a.id} - ${(a as any).fechaProgramada || ''}`,
        date: (a as any).fechaProgramada || '',
        tipo: (a as any).tipo || '',
        estado: (a as any).estado || '',
      })).sort((a, b) => b.date.localeCompare(a.date)),
    },
  };

  return {
    companyData,
    vehicleStats,
    driverStats,
    workersList: workers,
    sstObjectives,
    operationalStats,
    isLoading,
    error: error as Error | null,
  };
}
