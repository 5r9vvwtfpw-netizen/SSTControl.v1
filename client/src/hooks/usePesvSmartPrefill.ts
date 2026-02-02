import { useQuery } from "@tanstack/react-query";
import { Company, Vehicle, Driver, Worker } from "@shared/schema";

interface CompanyData {
  name: string;
  nit: string;
  arl: string | null;
  numWorkers: number;
  numVehicles: number;
  numDrivers: number;
}

interface VehicleStats {
  total: number;
  active: number;
  byType: Record<string, number>;
}

interface DriverStats {
  total: number;
  active: number;
  withLicenseExpiring: number;
}

interface PesvSmartPrefillData {
  companyData: CompanyData | null;
  vehicleStats: VehicleStats | null;
  driverStats: DriverStats | null;
  workersList: Worker[];
  isLoading: boolean;
  error: Error | null;
}

const DAYS_UNTIL_EXPIRY_THRESHOLD = 30; // Consider license expiring if less than 30 days left

export function usePesvSmartPrefill(): PesvSmartPrefillData {
  // Fetch company current information
  const { data: company, isLoading: isLoadingCompany, error: companyError } = useQuery<Company>({
    queryKey: ["/api/company/current"],
  });

  // Fetch vehicles list
  const { data: vehicles = [], isLoading: isLoadingVehicles, error: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Fetch drivers list
  const { data: drivers = [], isLoading: isLoadingDrivers, error: driversError } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Fetch workers list
  const { data: workers = [], isLoading: isLoadingWorkers, error: workersError } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  // Fetch SST objectives (for potential use in future enhancements)
  const { isLoading: isLoadingObjectives, error: objectivesError } = useQuery({
    queryKey: ["/api/objetivos-sst"],
  });

  // Determine loading state
  const isLoading = isLoadingCompany || isLoadingVehicles || isLoadingDrivers || isLoadingWorkers || isLoadingObjectives;

  // Determine error state (return first non-null error)
  const error = companyError || vehiclesError || driversError || workersError || objectivesError || null;

  // Process company data
  const companyData: CompanyData | null = company ? {
    name: company.name,
    nit: company.nit,
    arl: company.arlNombreEmpresa || null,
    numWorkers: company.numberOfWorkers,
    numVehicles: company.numberOfVehicles || vehicles.length,
    numDrivers: drivers.length,
  } : null;

  // Process vehicle stats
  const vehicleStats: VehicleStats | null = vehicles.length > 0 ? {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === "activo").length,
    byType: vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : null;

  // Process driver stats
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

  return {
    companyData,
    vehicleStats,
    driverStats,
    workersList: workers,
    isLoading,
    error: error as Error | null,
  };
}
