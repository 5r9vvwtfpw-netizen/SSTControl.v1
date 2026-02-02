import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuditoriaInterna, Company, Worker, ObjetivoSst, EstandarSst } from "@shared/schema";

interface SmartPrefillData {
  codigo: string;
  titulo: string;
  objetivo: string;
  alcance: string;
  auditoristaLider: string;
  fechaProgramada: Date;
  trazabilidad: {
    estandarSst: string;
    objetivosSstRelacionados: string[];
    copasst: boolean;
  };
}

interface SmartPrefillResult {
  prefillData: SmartPrefillData | null;
  isLoading: boolean;
  detectedFields: string[];
  trazabilidadInfo: {
    estandar: string;
    descripcion: string;
    objetivos: Array<{ id: string; nombre: string }>;
  } | null;
}

export function useAuditSmartPrefill(
  tipo: "interna" | "externa" | "seguimiento",
  normaReferencia: "ISO_45001" | "res_0312_2019" | "ambas"
): SmartPrefillResult {
  const currentYear = new Date().getFullYear();

  const { data: auditorias = [], isLoading: loadingAuditorias } = useQuery<AuditoriaInterna[]>({
    queryKey: ["/api/auditorias-internas"],
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/my-company"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: objetivos = [] } = useQuery<ObjetivoSst[]>({
    queryKey: ["/api/objetivos-sst"],
  });

  const { data: estandares = [] } = useQuery<EstandarSst[]>({
    queryKey: ["/api/estandares-sst"],
  });

  const prefillData = useMemo(() => {
    if (loadingAuditorias) return null;

    const auditoriasDelAnio = auditorias.filter((a) => {
      const fechaCreacion = new Date(a.createdAt || "");
      return fechaCreacion.getFullYear() === currentYear;
    });
    const nextNumber = (auditoriasDelAnio.length + 1).toString().padStart(3, "0");

    const tipoPrefix = tipo === "interna" ? "INT" : tipo === "externa" ? "EXT" : "SEG";
    const codigo = `AUD-${tipoPrefix}-${currentYear}-${nextNumber}`;

    const tipoLabel = tipo === "interna" ? "Interna" : tipo === "externa" ? "Externa" : "de Seguimiento";
    const normaLabel = normaReferencia === "ISO_45001" 
      ? "ISO 45001:2018" 
      : normaReferencia === "res_0312_2019" 
        ? "Resolución 0312/2019" 
        : "ISO 45001:2018 y Resolución 0312/2019";

    const titulo = `Auditoría ${tipoLabel} SG-SST ${currentYear}`;

    const objetivoTexts: Record<string, string> = {
      "ISO_45001": "Evaluar la conformidad del Sistema de Gestión de SST con los requisitos de ISO 45001:2018, identificando oportunidades de mejora continua y verificando la eficacia de los controles establecidos.",
      "res_0312_2019": "Verificar el cumplimiento de los estándares mínimos de SST establecidos en la Resolución 0312/2019 y el Decreto 1072/2015, evaluando la gestión de riesgos laborales.",
      "ambas": "Evaluar la conformidad del SG-SST con ISO 45001:2018 y verificar el cumplimiento de los estándares mínimos de la Resolución 0312/2019, identificando oportunidades de mejora."
    };

    const alcanceBase = company?.name 
      ? `Aplica a todos los procesos, actividades y trabajadores de ${company.name}. `
      : "Aplica a todos los procesos, actividades y trabajadores de la organización. ";
    
    const alcanceNorma = normaReferencia === "ISO_45001"
      ? "Incluye la evaluación del contexto organizacional, liderazgo, planificación, apoyo, operación, evaluación del desempeño y mejora continua."
      : normaReferencia === "res_0312_2019"
        ? "Abarca el ciclo PHVA: Planear, Hacer, Verificar y Actuar según los estándares mínimos aplicables."
        : "Cubre todos los elementos del SG-SST según ISO 45001 y los estándares mínimos de la Resolución 0312/2019.";

    const responsableSst = workers.find((w) => 
      w.position?.toLowerCase().includes("sst") || 
      w.position?.toLowerCase().includes("seguridad") ||
      w.position?.toLowerCase().includes("salud ocupacional")
    );
    const auditoristaLider = responsableSst 
      ? `${responsableSst.name} - ${responsableSst.position}` 
      : "";

    const objetivosRelacionados = objetivos
      .filter((o) => o.estado === "activo" && o.anio === currentYear)
      .slice(0, 3)
      .map((o) => o.id);

    const estandarAuditoria = estandares.find((e) => e.codigo === "3.1.1");
    const estandarCopasst = estandares.find((e) => e.codigo === "6.1.4");

    return {
      codigo,
      titulo,
      objetivo: objetivoTexts[normaReferencia] || objetivoTexts["ISO_45001"],
      alcance: alcanceBase + alcanceNorma,
      auditoristaLider,
      fechaProgramada: new Date(),
      trazabilidad: {
        estandarSst: estandarAuditoria?.codigo || "3.1.1",
        objetivosSstRelacionados: objetivosRelacionados,
        copasst: !!estandarCopasst
      }
    };
  }, [auditorias, company, workers, objetivos, estandares, tipo, normaReferencia, currentYear, loadingAuditorias]);

  const detectedFields = useMemo(() => {
    const fields: string[] = [];
    if (prefillData) {
      fields.push("Código (auto-generado)");
      fields.push("Título");
      fields.push("Objetivo");
      fields.push("Alcance");
      if (prefillData.auditoristaLider) {
        fields.push("Auditor Líder");
      }
      fields.push("Trazabilidad con Estándar 3.1.1");
    }
    return fields;
  }, [prefillData]);

  const trazabilidadInfo = useMemo(() => {
    const estandarAuditoria = estandares.find((e) => e.codigo === "3.1.1");
    if (!estandarAuditoria) return null;

    const objetivosActivos = objetivos
      .filter((o) => o.estado === "activo" && o.anio === currentYear)
      .slice(0, 5);

    return {
      estandar: "3.1.1",
      descripcion: estandarAuditoria.descripcion || "Auditoría anual del SG-SST",
      objetivos: objetivosActivos.map((o) => ({ id: o.id, nombre: o.nombre }))
    };
  }, [estandares, objetivos, currentYear]);

  return {
    prefillData,
    isLoading: loadingAuditorias,
    detectedFields,
    trazabilidadInfo
  };
}
