import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ActividadPlanTrabajo } from "@shared/schema";

const MESES = [
  { id: "enero", nombre: "ENERO", short: "ENE", trimestre: 1 },
  { id: "febrero", nombre: "FEBRERO", short: "FEB", trimestre: 1 },
  { id: "marzo", nombre: "MARZO", short: "MAR", trimestre: 1 },
  { id: "abril", nombre: "ABRIL", short: "ABR", trimestre: 2 },
  { id: "mayo", nombre: "MAYO", short: "MAY", trimestre: 2 },
  { id: "junio", nombre: "JUNIO", short: "JUN", trimestre: 2 },
  { id: "julio", nombre: "JULIO", short: "JUL", trimestre: 3 },
  { id: "agosto", nombre: "AGOSTO", short: "AGO", trimestre: 3 },
  { id: "septiembre", nombre: "SEPTIEMBRE", short: "SEP", trimestre: 3 },
  { id: "octubre", nombre: "OCTUBRE", short: "OCT", trimestre: 4 },
  { id: "noviembre", nombre: "NOVIEMBRE", short: "NOV", trimestre: 4 },
  { id: "diciembre", nombre: "DICIEMBRE", short: "DIC", trimestre: 4 },
];

const CICLOS_PHVA = [
  { id: "planear", nombre: "I PLANEAR", color: "#1565C0" },
  { id: "hacer", nombre: "II HACER", color: "#2E7D32" },
  { id: "verificar", nombre: "III VERIFICAR", color: "#F57C00" },
  { id: "actuar", nombre: "IV ACTUAR", color: "#C62828" },
];

interface ActividadAgrupada {
  nombre: string;
  responsable: string;
  ciclo: string;
  programa: string;
  objetivo: string;
  meta: string;
  cargo: string;
  meses: Record<string, { programado: ActividadPlanTrabajo | null; ejecutado: boolean }>;
  recursosAdministrativos: boolean;
  recursosFinancieros: boolean;
  observaciones: string;
  actividades: ActividadPlanTrabajo[];
}

interface CronogramaGridProps {
  actividades: ActividadPlanTrabajo[];
  planId: string;
  anio: number;
  onEditActividad?: (actividad: ActividadPlanTrabajo) => void;
  onDeleteActividad?: (actividadId: string) => void;
  onNewActividad?: () => void;
}

function getCicloFromPrograma(programa: string): string {
  const planear = ["otro", "identificacion-peligros", "comunicacion"];
  const hacer = ["capacitacion", "medicina-preventiva", "higiene-seguridad", "riesgo-psicosocial", "seguridad-vial", "emergencias", "vigilancia-epidemiologica", "inspeccion", "epp", "comites"];
  const verificar = ["auditoria"];
  const actuar = ["mejora-continua"];
  
  if (planear.includes(programa)) return "planear";
  if (hacer.includes(programa)) return "hacer";
  if (verificar.includes(programa)) return "verificar";
  if (actuar.includes(programa)) return "actuar";
  return "planear";
}

export function CronogramaGrid({ actividades, planId, anio, onEditActividad, onDeleteActividad, onNewActividad }: CronogramaGridProps) {
  const { toast } = useToast();

  const { actividadesAgrupadas, totalesPorMes, totalesGenerales } = useMemo(() => {
    const grupos: Record<string, ActividadAgrupada> = {};
    const totales: Record<string, { programado: number; ejecutado: number }> = {};
    
    MESES.forEach(m => {
      totales[m.id] = { programado: 0, ejecutado: 0 };
    });

    actividades.forEach((act) => {
      const key = act.actividad;
      const ciclo = getCicloFromPrograma(act.programa);
      
      if (!grupos[key]) {
        grupos[key] = {
          nombre: act.actividad,
          responsable: act.responsable,
          ciclo,
          programa: act.programa,
          objetivo: act.objetivo,
          meta: act.meta,
          cargo: act.cargo,
          meses: {},
          recursosAdministrativos: false,
          recursosFinancieros: false,
          observaciones: "",
          actividades: [],
        };
        MESES.forEach((m) => {
          grupos[key].meses[m.id] = { programado: null, ejecutado: false };
        });
      }
      
      grupos[key].meses[act.mes] = {
        programado: act,
        ejecutado: act.ejecutado || act.estado === "completada",
      };
      
      totales[act.mes].programado++;
      if (act.ejecutado || act.estado === "completada") {
        totales[act.mes].ejecutado++;
      }
      
      grupos[key].actividades.push(act);
      if (act.recursosAdministrativos) grupos[key].recursosAdministrativos = true;
      if (act.recursosFinancierosCheck || (act.recursosFinancieros && act.recursosFinancieros > 0)) {
        grupos[key].recursosFinancieros = true;
      }
      if (act.observaciones) grupos[key].observaciones = act.observaciones;
    });

    const agrupadas = Object.values(grupos).sort((a, b) => {
      const cicloOrder = ["planear", "hacer", "verificar", "actuar"];
      return cicloOrder.indexOf(a.ciclo) - cicloOrder.indexOf(b.ciclo);
    });
    
    const totalProgramado = Object.values(totales).reduce((sum, t) => sum + t.programado, 0);
    const totalEjecutado = Object.values(totales).reduce((sum, t) => sum + t.ejecutado, 0);
    const porcentajeCumplimiento = totalProgramado > 0 ? Math.round((totalEjecutado / totalProgramado) * 100) : 0;

    return { 
      actividadesAgrupadas: agrupadas, 
      totalesPorMes: totales,
      totalesGenerales: { programado: totalProgramado, ejecutado: totalEjecutado, porcentaje: porcentajeCumplimiento }
    };
  }, [actividades]);

  const refetchAllQueries = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["/api/planes-trabajo-anual", planId, "actividades"] }),
      queryClient.refetchQueries({ queryKey: ["/api/planes-trabajo-anual", planId, "insights"] }),
      queryClient.refetchQueries({ queryKey: ["/api/planes-trabajo-anual", planId, "agenda"] }),
    ]);
  };

  // Mutación para toggle ejecutado
  const toggleEjecutadoMutation = useMutation({
    mutationFn: async ({ actividadId, ejecutado }: { actividadId: string; ejecutado: boolean }) => {
      const res = await apiRequest("PATCH", `/api/actividades-plan-trabajo/${actividadId}`, { 
        ejecutado,
        estado: ejecutado ? "completada" : "pendiente"
      });
      return res.json();
    },
    onSuccess: async () => {
      await refetchAllQueries();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutación para agregar programación (crear actividad en un mes)
  const addProgramacionMutation = useMutation({
    mutationFn: async (data: { 
      planId: string; 
      actividad: string;
      mes: string;
      trimestre: number;
      programa: string;
      objetivo: string;
      meta: string;
      responsable: string;
      cargo: string;
    }) => {
      const res = await apiRequest("POST", `/api/actividades-plan-trabajo`, {
        planTrabajoId: data.planId,
        actividad: data.actividad,
        mes: data.mes,
        trimestre: data.trimestre,
        programa: data.programa,
        objetivo: data.objetivo,
        meta: data.meta,
        responsable: data.responsable,
        cargo: data.cargo,
        estado: "pendiente",
        ejecutado: false,
      });
      return res.json();
    },
    onSuccess: async () => {
      await refetchAllQueries();
      toast({ title: "Programado", description: "Actividad programada para el mes" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutación para quitar programación (eliminar actividad)
  const removeProgramacionMutation = useMutation({
    mutationFn: async (actividadId: string) => {
      const res = await apiRequest("DELETE", `/api/actividades-plan-trabajo/${actividadId}`);
      return res;
    },
    onSuccess: async () => {
      await refetchAllQueries();
      toast({ title: "Eliminado", description: "Se quitó la programación del mes" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleRecursoMutation = useMutation({
    mutationFn: async ({ actividadId, field, value }: { actividadId: string; field: string; value: boolean }) => {
      const res = await apiRequest("PATCH", `/api/actividades-plan-trabajo/${actividadId}`, { [field]: value });
      return res.json();
    },
    onSuccess: async () => {
      await refetchAllQueries();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Handler para clic en celda P (programado)
  const handleToggleProgramado = (grupo: ActividadAgrupada, mesId: string) => {
    const mesInfo = MESES.find(m => m.id === mesId);
    if (!mesInfo) return;

    const mesData = grupo.meses[mesId];
    
    if (mesData.programado) {
      // Ya hay programación, eliminar
      removeProgramacionMutation.mutate(mesData.programado.id);
    } else {
      // No hay programación, crear
      addProgramacionMutation.mutate({
        planId,
        actividad: grupo.nombre,
        mes: mesId,
        trimestre: mesInfo.trimestre,
        programa: grupo.programa,
        objetivo: grupo.objetivo,
        meta: grupo.meta,
        responsable: grupo.responsable,
        cargo: grupo.cargo,
      });
    }
  };

  // Handler para clic en celda E (ejecutado)
  const handleToggleEjecutado = (actividadId: string, currentValue: boolean) => {
    toggleEjecutadoMutation.mutate({ actividadId, ejecutado: !currentValue });
  };

  const handleToggleRecurso = (actividad: ActividadPlanTrabajo, field: "recursosAdministrativos" | "recursosFinancierosCheck") => {
    const currentValue = actividad[field] || false;
    toggleRecursoMutation.mutate({ actividadId: actividad.id, field, value: !currentValue });
  };

  let currentCiclo = "";

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Encabezado del documento */}
      <div className="bg-[#1565C0] text-white">
        <div className="grid grid-cols-[1fr_auto] border-b border-blue-400">
          <div className="p-3 border-r border-blue-400">
            <h1 className="text-lg font-bold text-center">PLAN DE TRABAJO ANUAL DE SEGURIDAD Y SALUD EN EL TRABAJO</h1>
            <p className="text-sm text-center text-blue-100">SISTEMA DE GESTIÓN DE LA SEGURIDAD Y SALUD EN EL TRABAJO SG-SST</p>
          </div>
          <div className="p-2 text-xs min-w-[150px]">
            <p><strong>Código:</strong> RG-SST-001</p>
            <p><strong>Versión:</strong> 001</p>
            <p><strong>Fecha:</strong> Enero {anio}</p>
          </div>
        </div>
      </div>

      {/* Objetivo */}
      <div className="bg-[#E3F2FD] p-3 border-b">
        <p className="text-sm"><strong className="text-[#1565C0]">OBJETIVO:</strong> Documentar, Implementar y mantener las actividades del Sistema de Gestión de Seguridad y Salud en el Trabajo de acuerdo a lo establecido en el Decreto 1072 de 2015 y en los estándares mínimos de la Resolución 0312 de 2019.</p>
      </div>

      {/* Meta e Indicador */}
      <div className="grid grid-cols-2 bg-[#E8F5E9] border-b text-sm">
        <div className="p-2 border-r">
          <strong className="text-[#2E7D32]">META:</strong> Cumplir con el 90% de las actividades programadas en el Sistema de Gestión de la Seguridad y Salud en el Trabajo para la vigencia.
        </div>
        <div className="p-2">
          <strong className="text-[#2E7D32]">INDICADOR:</strong> (Nº de Actividades Ejecutadas / Nº de Actividades Programadas) x 100
        </div>
      </div>

      {/* Título Cronograma */}
      <div className="bg-[#2E7D32] text-white text-center py-2 font-bold text-lg">
        CRONOGRAMA
      </div>
      
      {/* Tabla del Cronograma */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#4CAF50] text-white">
              <th rowSpan={2} className="border border-[#2E7D32] px-1 py-1 text-center w-[80px] sticky left-0 bg-[#4CAF50] z-20">
                Ciclo
              </th>
              <th rowSpan={2} className="border border-[#2E7D32] px-2 py-1 text-left min-w-[200px] sticky left-[80px] bg-[#4CAF50] z-20">
                ACTIVIDAD
              </th>
              <th colSpan={24} className="border border-[#2E7D32] px-1 py-1 text-center">
                VIGENCIA {anio}
              </th>
              <th rowSpan={2} className="border border-[#2E7D32] px-1 py-1 text-center min-w-[100px]">
                Responsable(s)
              </th>
              <th colSpan={2} className="border border-[#2E7D32] px-1 py-1 text-center">
                RECURSOS
              </th>
              <th rowSpan={2} className="border border-[#2E7D32] px-1 py-1 text-center min-w-[80px]">
                OBS.
              </th>
              <th rowSpan={2} className="border border-[#2E7D32] px-1 py-1 text-center w-[50px]">
                ACC.
              </th>
            </tr>
            <tr className="bg-[#66BB6A] text-white text-[9px]">
              {MESES.map((mes) => (
                <th key={mes.id} colSpan={2} className="border border-[#2E7D32] px-0 py-1 text-center">
                  {mes.short}
                </th>
              ))}
              <th className="border border-[#2E7D32] px-0 py-1 text-center w-[25px]" title="Administrativos">Adm</th>
              <th className="border border-[#2E7D32] px-0 py-1 text-center w-[25px]" title="Financieros">Fin</th>
            </tr>
            <tr className="bg-[#81C784] text-white text-[8px]">
              <th className="border border-[#2E7D32] sticky left-0 bg-[#81C784] z-20"></th>
              <th className="border border-[#2E7D32] sticky left-[80px] bg-[#81C784] z-20"></th>
              {MESES.flatMap((mes) => [
                <th key={`${mes.id}-p`} className="border border-[#2E7D32] px-0 py-0.5 text-center w-[18px] bg-[#A5D6A7]">P</th>,
                <th key={`${mes.id}-e`} className="border border-[#2E7D32] px-0 py-0.5 text-center w-[18px] bg-[#C8E6C9]">E</th>
              ])}
              <th className="border border-[#2E7D32]"></th>
              <th className="border border-[#2E7D32]"></th>
              <th className="border border-[#2E7D32]"></th>
              <th className="border border-[#2E7D32]"></th>
              <th className="border border-[#2E7D32]"></th>
            </tr>
          </thead>
          <tbody>
            {actividadesAgrupadas.map((grupo, idx) => {
              const showCiclo = grupo.ciclo !== currentCiclo;
              if (showCiclo) currentCiclo = grupo.ciclo;
              const cicloInfo = CICLOS_PHVA.find(c => c.id === grupo.ciclo);
              
              return (
                <tr 
                  key={grupo.nombre + idx} 
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50 transition-colors`}
                  data-testid={`row-actividad-${idx}`}
                >
                  <td 
                    className={`border border-gray-300 px-1 py-1 text-center font-bold text-[9px] sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    style={{ color: cicloInfo?.color }}
                  >
                    {showCiclo && cicloInfo?.nombre}
                  </td>
                  
                  <td className={`border border-gray-300 px-1 py-1 text-left sticky left-[80px] z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-gray-800 cursor-help block truncate max-w-[190px]" data-testid={`text-actividad-${idx}`}>
                          {grupo.nombre}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[350px] bg-gray-900 text-white">
                        <p className="font-semibold mb-1">{grupo.nombre}</p>
                        {grupo.objetivo && (
                          <p className="text-xs text-gray-300"><strong>Objetivo:</strong> {grupo.objetivo}</p>
                        )}
                        {grupo.meta && (
                          <p className="text-xs text-gray-300"><strong>Meta:</strong> {grupo.meta}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  
                  {MESES.flatMap((mes) => {
                    const mesData = grupo.meses[mes.id];
                    const isProgramado = mesData.programado !== null;
                    const isEjecutado = mesData.ejecutado;
                    const isLoading = addProgramacionMutation.isPending || removeProgramacionMutation.isPending || toggleEjecutadoMutation.isPending;
                    
                    return [
                      // Celda P (Programado) - EDITABLE
                      <td 
                        key={`${grupo.nombre}-${mes.id}-p`}
                        className={`border border-gray-300 text-center w-[18px] h-[22px] cursor-pointer select-none transition-colors ${
                          isProgramado 
                            ? 'bg-[#4CAF50] text-white font-bold hover:bg-[#388E3C]' 
                            : 'hover:bg-[#C8E6C9]'
                        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => handleToggleProgramado(grupo, mes.id)}
                        title={isProgramado ? "Clic para quitar programación" : "Clic para programar"}
                        data-testid={`cell-p-${idx}-${mes.id}`}
                      >
                        {isProgramado ? "1" : ""}
                      </td>,
                      // Celda E (Ejecutado) - EDITABLE solo si hay P
                      <td 
                        key={`${grupo.nombre}-${mes.id}-e`}
                        className={`border border-gray-300 text-center w-[18px] h-[22px] select-none transition-colors ${
                          isProgramado 
                            ? isEjecutado 
                              ? 'bg-[#2E7D32] text-white font-bold hover:bg-[#1B5E20] cursor-pointer' 
                              : 'bg-[#FFF9C4] hover:bg-[#FFF176] cursor-pointer'
                            : ''
                        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => {
                          if (isProgramado && mesData.programado) {
                            handleToggleEjecutado(mesData.programado.id, isEjecutado);
                          }
                        }}
                        title={isProgramado ? (isEjecutado ? "Ejecutado - Clic para desmarcar" : "Pendiente - Clic para marcar ejecutado") : "Primero debe programar (P)"}
                        data-testid={`cell-e-${idx}-${mes.id}`}
                      >
                        {isProgramado && isEjecutado ? "1" : ""}
                      </td>
                    ];
                  })}
                  
                  <td className="border border-gray-300 px-1 py-1 text-center text-[9px]" data-testid={`text-responsable-${idx}`}>
                    {grupo.responsable}
                  </td>
                  
                  <td className="border border-gray-300 px-0.5 py-1 text-center cursor-pointer hover:bg-gray-100">
                    {grupo.actividades[0] && (
                      <span 
                        onClick={() => handleToggleRecurso(grupo.actividades[0], "recursosAdministrativos")}
                      >
                        {grupo.recursosAdministrativos ? "x" : ""}
                      </span>
                    )}
                  </td>
                  
                  <td className="border border-gray-300 px-0.5 py-1 text-center cursor-pointer hover:bg-gray-100">
                    {grupo.actividades[0] && (
                      <span 
                        onClick={() => handleToggleRecurso(grupo.actividades[0], "recursosFinancierosCheck")}
                      >
                        {grupo.recursosFinancieros ? "x" : ""}
                      </span>
                    )}
                  </td>
                  
                  <td className="border border-gray-300 px-1 py-1 text-[8px] max-w-[80px] truncate" data-testid={`text-observaciones-${idx}`}>
                    {grupo.observaciones}
                  </td>
                  
                  <td className="border border-gray-300 px-0.5 py-1">
                    <div className="flex items-center justify-center gap-0.5">
                      {onEditActividad && grupo.actividades[0] && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => onEditActividad(grupo.actividades[0])}
                          data-testid={`button-edit-${idx}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteActividad && grupo.actividades[0] && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5 text-destructive hover:text-destructive"
                          onClick={() => onDeleteActividad(grupo.actividades[0].id)}
                          data-testid={`button-delete-${idx}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Fila de Totales */}
            <tr className="bg-[#FFF3E0] font-bold text-[9px]">
              <td className="border border-gray-400 px-1 py-1 text-center sticky left-0 bg-[#FFF3E0] z-10" colSpan={2}>
                Total Actividades
              </td>
              {MESES.flatMap((mes) => [
                <td key={`total-${mes.id}-p`} className="border border-gray-400 text-center bg-[#FFE0B2]">
                  {totalesPorMes[mes.id].programado || ""}
                </td>,
                <td key={`total-${mes.id}-e`} className="border border-gray-400 text-center bg-[#FFCC80]">
                  {totalesPorMes[mes.id].ejecutado || ""}
                </td>
              ])}
              <td className="border border-gray-400" colSpan={5}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sección de Monitoreo */}
      <div className="bg-[#E8F5E9] border-t-2 border-[#2E7D32] p-3">
        <h3 className="font-bold text-[#2E7D32] mb-2">MONITOREO DEL PROGRAMA / VIGENCIA {anio}</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-2 rounded shadow text-center">
            <p className="text-gray-600 text-xs">Actividades Programadas</p>
            <p className="text-2xl font-bold text-[#1565C0]">{totalesGenerales.programado}</p>
          </div>
          <div className="bg-white p-2 rounded shadow text-center">
            <p className="text-gray-600 text-xs">Actividades Ejecutadas</p>
            <p className="text-2xl font-bold text-[#2E7D32]">{totalesGenerales.ejecutado}</p>
          </div>
          <div className="bg-white p-2 rounded shadow text-center">
            <p className="text-gray-600 text-xs">% Cumplimiento</p>
            <p className={`text-2xl font-bold ${totalesGenerales.porcentaje >= 90 ? 'text-[#2E7D32]' : totalesGenerales.porcentaje >= 70 ? 'text-[#F57C00]' : 'text-[#C62828]'}`}>
              {totalesGenerales.porcentaje}%
            </p>
          </div>
          <div className="bg-white p-2 rounded shadow text-center">
            <p className="text-gray-600 text-xs">Meta</p>
            <p className="text-2xl font-bold text-gray-700">90%</p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-gray-100 px-4 py-2 border-t text-xs text-gray-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-[#4CAF50] text-white text-[8px] flex items-center justify-center rounded">1</span>
            <strong>P:</strong> Programado (clic para toggle)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-[#FFF9C4] border border-[#FBC02D] text-[8px] flex items-center justify-center rounded"></span>
            <strong>E:</strong> Pendiente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-[#2E7D32] text-white text-[8px] flex items-center justify-center rounded">1</span>
            <strong>E:</strong> Ejecutado
          </span>
          <span className="ml-auto">Total actividades únicas: {actividadesAgrupadas.length}</span>
        </div>
      </div>
    </div>
  );
}
