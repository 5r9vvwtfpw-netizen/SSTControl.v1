import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { hasGlobalAccess } from "@shared/permissions";
import { Company, ProviderAccessLog, InsertProviderAccessLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { type ChapterType } from "@shared/chapter-modules";

type AccessSession = {
  logId: string;
  companyId: string;
  startTime: Date;
};

type StoredAccessSession = {
  logId: string;
  companyId: string;
  startTime: string;
};

type CompanyContextType = {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  companies: Company[];
  isLoading: boolean;
  selectedCompany: Company | null;
  canSelectCompany: boolean;
  effectiveCompanyId: string | null;
  companyChapter: ChapterType | null;
  startAccessSession: (companyId: string, reason: string, description: string, ticketNumber?: string) => Promise<void>;
  endAccessSession: () => Promise<void>;
  currentAccessSession: AccessSession | null;
  pendingCompanySelection: Company | null;
  setPendingCompanySelection: (company: Company | null) => void;
};

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyIdInternal] = useState<string | null>(null);
  const [currentAccessSession, setCurrentAccessSession] = useState<AccessSession | null>(null);
  const [pendingCompanySelection, setPendingCompanySelectionInternal] = useState<Company | null>(null);
  const previousCompanyIdRef = useRef<string | null>(null);

  const canSelectCompany = useMemo(() => {
    return user?.role === 'superadmin';
  }, [user?.role]);

  useEffect(() => {
    if (!canSelectCompany) {
      setSelectedCompanyIdInternal(null);
      setCurrentAccessSession(null);
      localStorage.removeItem("superadmin_selected_company");
      localStorage.removeItem("superadmin_access_session");
      queryClient.removeQueries({ queryKey: ["/api/companies"] });
    }
  }, [canSelectCompany, queryClient]);

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: canSelectCompany && user?.role === 'superadmin',
    staleTime: 0,
  });

  // Query para obtener la empresa del usuario (para usuarios no-superadmin)
  const { data: userCompany, isLoading: isLoadingUserCompany } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !!user && !canSelectCompany && !!user.companyId,
    staleTime: 60000, // 1 minuto de cache
  });

  // Combinar estados de carga: para superadmin usa companies, para usuarios regulares usa userCompany
  const isLoading = canSelectCompany ? isLoadingCompanies : isLoadingUserCompany;

  useEffect(() => {
    if (canSelectCompany && companies.length > 0 && !selectedCompanyId && !currentAccessSession) {
      const storedSession = localStorage.getItem("superadmin_access_session");
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession) as StoredAccessSession;
          if (companies.find(c => c.id === parsed.companyId)) {
            const session: AccessSession = {
              logId: parsed.logId,
              companyId: parsed.companyId,
              startTime: new Date(parsed.startTime),
            };
            setSelectedCompanyIdInternal(parsed.companyId);
            setCurrentAccessSession(session);
            previousCompanyIdRef.current = parsed.companyId;
          }
        } catch {
          localStorage.removeItem("superadmin_access_session");
        }
      }
    }
  }, [canSelectCompany, companies, selectedCompanyId, currentAccessSession]);

  const createAccessLogMutation = useMutation({
    mutationFn: async (data: Partial<InsertProviderAccessLog>) => {
      const response = await apiRequest("POST", "/api/provider-access-logs", data);
      return response.json() as Promise<ProviderAccessLog>;
    },
  });

  const updateAccessLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProviderAccessLog> }) => {
      const response = await apiRequest("PATCH", `/api/provider-access-logs/${id}`, data);
      return response.json() as Promise<ProviderAccessLog>;
    },
  });

  const startAccessSession = useCallback(async (
    companyId: string,
    reason: string,
    description: string,
    ticketNumber?: string
  ) => {
    if (!user || !canSelectCompany) return;

    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    if (currentAccessSession && currentAccessSession.companyId === companyId) {
      setSelectedCompanyIdInternal(companyId);
      previousCompanyIdRef.current = companyId;
      return;
    }

    if (currentAccessSession) {
      try {
        await updateAccessLogMutation.mutateAsync({
          id: currentAccessSession.logId,
          data: { accessEnd: new Date() }
        });
      } catch (error) {
        console.error("Error closing previous access session:", error);
      }
    }

    try {
      const log = await createAccessLogMutation.mutateAsync({
        providerId: user.id,
        providerName: user.fullName || user.username,
        providerEmail: user.email || user.username,
        providerRole: user.role,
        clientCompanyId: companyId,
        clientCompanyName: company.name,
        clientCompanyNit: company.nit || undefined,
        accessReason: reason as any,
        accessDescription: description,
        ticketNumber: ticketNumber || undefined,
        modulesAccessed: [],
        recordsViewed: 0,
        recordsModified: 0,
      });

      const session: AccessSession = {
        logId: log.id,
        companyId: companyId,
        startTime: new Date(),
      };

      setCurrentAccessSession(session);
      setSelectedCompanyIdInternal(companyId);
      previousCompanyIdRef.current = companyId;
      
      const storedSession: StoredAccessSession = {
        logId: log.id,
        companyId: companyId,
        startTime: session.startTime.toISOString(),
      };
      localStorage.setItem("superadmin_access_session", JSON.stringify(storedSession));
      localStorage.setItem("superadmin_selected_company", companyId);
      
      // Invalidar TODAS las queries de datos para refrescar con la nueva empresa
      queryClient.invalidateQueries({ queryKey: ["/api/provider-access-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/environmental-measurements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
    } catch (error) {
      console.error("Error creating access session:", error);
      throw error;
    }
  }, [user, canSelectCompany, companies, currentAccessSession, createAccessLogMutation, updateAccessLogMutation, queryClient]);

  const endAccessSession = useCallback(async () => {
    if (!currentAccessSession) return;

    try {
      await updateAccessLogMutation.mutateAsync({
        id: currentAccessSession.logId,
        data: { accessEnd: new Date() }
      });

      setCurrentAccessSession(null);
      setSelectedCompanyIdInternal(null);
      previousCompanyIdRef.current = null;
      localStorage.removeItem("superadmin_access_session");
      localStorage.removeItem("superadmin_selected_company");
      
      queryClient.invalidateQueries({ queryKey: ["/api/provider-access-logs"] });
    } catch (error) {
      console.error("Error ending access session:", error);
    }
  }, [currentAccessSession, updateAccessLogMutation, queryClient]);

  const setPendingCompanySelection = useCallback((company: Company | null) => {
    if (company === null) {
      setPendingCompanySelectionInternal(null);
    } else {
      setPendingCompanySelectionInternal(company);
    }
  }, []);

  const setSelectedCompanyId = useCallback((id: string | null) => {
    if (!canSelectCompany) return;
    
    if (id === null) {
      endAccessSession();
      return;
    }

    if (currentAccessSession && currentAccessSession.companyId === id) {
      return;
    }

    const company = companies.find(c => c.id === id);
    if (company) {
      setPendingCompanySelectionInternal(company);
    }
  }, [canSelectCompany, companies, currentAccessSession, endAccessSession]);

  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  const effectiveCompanyId = useMemo(() => {
    if (canSelectCompany) {
      return selectedCompanyId;
    }
    return user?.companyId || null;
  }, [canSelectCompany, selectedCompanyId, user?.companyId]);

  // Calcular el capítulo basándose en número de trabajadores y nivel de riesgo
  // según Resolución 0312/2019 - Esta es la ÚNICA lógica válida según la norma
  const calculateChapterByWorkers = useCallback((company: any): ChapterType => {
    const workers = company.numberOfWorkers || 0;
    const riskLevel = company.riskLevel || "I";
    const isHighRisk = riskLevel === "IV" || riskLevel === "V";
    
    // Capítulo 3: >50 trabajadores O cualquier empresa con riesgo IV-V
    // Según Resolución 0312/2019: Empresas de alto riesgo SIEMPRE van al capítulo 3
    if (workers > 50 || isHighRisk) {
      return 3;
    }
    
    // Capítulo 2: 11-50 trabajadores Y riesgo I, II o III
    if (workers >= 11 && workers <= 50) {
      return 2;
    }
    
    // Capítulo 1: ≤10 trabajadores Y riesgo I, II o III
    return 1;
  }, []);

  // Obtener el capítulo de la empresa según Resolución 0312/2019
  // El capítulo se determina ÚNICAMENTE por número de trabajadores y nivel de riesgo
  // NO se basa en el plan de suscripción (el plan solo afecta facturación, no cumplimiento)
  const companyChapter = useMemo((): ChapterType | null => {
    // Empresa a evaluar
    let companyData: any = null;
    
    // Para superadmin, usar la empresa seleccionada
    if (canSelectCompany && selectedCompany) {
      companyData = selectedCompany;
    } 
    // Para usuarios normales, usar su empresa
    else if (userCompany) {
      companyData = userCompany;
    }
    
    if (!companyData) {
      return null;
    }
    
    // PRIORIDAD: Siempre calcular dinámicamente basándose en número de trabajadores y nivel de riesgo
    // según Resolución 0312/2019. El capítulo almacenado en BD podría estar desactualizado
    // si la empresa cambió su número de trabajadores o nivel de riesgo.
    // SST-2026-0031: Este cálculo garantiza que empresas con >50 trabajadores (61 estándares)
    // siempre tengan acceso a todos los módulos correspondientes.
    const calculatedChapter = calculateChapterByWorkers(companyData);
    
    // Log para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      const storedChapter = companyData.calculatedChapter;
      if (storedChapter && parseInt(storedChapter, 10) !== calculatedChapter) {
        console.warn(`[CompanyContext] Chapter mismatch - stored: ${storedChapter}, calculated: ${calculatedChapter} (workers: ${companyData.numberOfWorkers}, risk: ${companyData.riskLevel})`);
      }
    }
    
    return calculatedChapter;
  }, [canSelectCompany, selectedCompany, userCompany, calculateChapterByWorkers]);

  return (
    <CompanyContext.Provider
      value={{
        selectedCompanyId,
        setSelectedCompanyId,
        companies: canSelectCompany ? companies : [],
        isLoading,
        selectedCompany,
        canSelectCompany,
        effectiveCompanyId,
        companyChapter,
        startAccessSession,
        endAccessSession,
        currentAccessSession,
        pendingCompanySelection,
        setPendingCompanySelection,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext must be used within a CompanyProvider");
  }
  return context;
}
