/**
 * SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
 * 
 * Copyright (c) 2024-2026. Todos los derechos reservados.
 * 
 * Este software es propiedad confidencial y está protegido por las leyes de
 * propiedad intelectual de Colombia (Ley 23 de 1982, Decisión Andina 351).
 * 
 * Queda estrictamente prohibida su reproducción, distribución, modificación
 * o ingeniería inversa sin autorización expresa por escrito del propietario.
 * 
 * CONFIDENCIAL - NO DISTRIBUIR
 */

import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PHVANavigation } from "@/components/PHVANavigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useWebSocketNotifications } from "@/hooks/use-websocket-notifications";
import { CompanyProvider } from "@/hooks/use-company-context";
import { ProtectedRoute } from "@/lib/protected-route";
import { SubscriptionProtectedRoute } from "@/lib/subscription-protected-route";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Footer, FooterMinimal } from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Trabajadores from "@/pages/Trabajadores";
import Accidentes from "@/pages/Accidentes";
import Capacitaciones from "@/pages/Capacitaciones";
import Inspecciones from "@/pages/Inspecciones";
import MedidasPreventivas from "@/pages/MedidasPreventivas";
import SaludOcupacional from "@/pages/SaludOcupacional";
import EstandaresSst from "@/pages/EstandaresSst";
import DetalleEstandarSst from "@/pages/DetalleEstandarSst";
import EvaluacionesSst from "@/pages/EvaluacionesSst";
import DetalleEvaluacionSst from "@/pages/DetalleEvaluacionSst";
import Informes from "@/pages/Informes";
import AuthPage from "@/pages/AuthPage";
import Pesv from "@/pages/Pesv";
import PesvVehiculos from "@/pages/PesvVehiculos";
import PesvConductores from "@/pages/PesvConductores";
import PesvInspecciones from "@/pages/PesvInspecciones";
import PesvMantenimientoVehicular from "@/pages/PesvMantenimientoVehicular";
import PesvMonitoreoGps from "@/pages/PesvMonitoreoGps";
import PesvRutasSeguras from "@/pages/PesvRutasSeguras";
import PesvSiniestros from "@/pages/PesvSiniestros";
import PesvMejoraContinua from "@/pages/PesvMejoraContinua";
import PesvRevisionDireccion from "@/pages/PesvRevisionDireccion";
import PesvCapacitaciones from "@/pages/PesvCapacitaciones";
import PesvInspeccionesEvaluacion from "@/pages/PesvInspeccionesEvaluacion";
import PesvSiniestrosEvaluacion from "@/pages/PesvSiniestrosEvaluacion";
import PesvCapacitacionesEvaluacion from "@/pages/PesvCapacitacionesEvaluacion";
import PesvAuditorias from "@/pages/PesvAuditorias";
import DetalleEvaluacionPesv from "@/pages/DetalleEvaluacionPesv";
import EvaluacionesPesv from "@/pages/EvaluacionesPesv";
import MatrizRiesgosViales from "@/pages/MatrizRiesgosViales";
import ContextoOrganizacionalPesv from "@/pages/ContextoOrganizacionalPesv";
import IndicadoresPesv from "@/pages/IndicadoresPesv";
import FactoresDesempenoPesv from "@/pages/FactoresDesempenoPesv";
import PesvComite from "@/pages/PesvComite";
import PesvLiderazgo from "@/pages/PesvLiderazgo";
import CompanyManagement from "@/pages/CompanyManagement";
import CompanyDetail from "@/pages/CompanyDetail";
import GestionUsuarios from "@/pages/GestionUsuarios";
import ProfesionalesLicenciados from "@/pages/ProfesionalesLicenciados";
import PortalLicenciado from "@/pages/PortalLicenciado";
import DetalleInvestigacionLSO from "@/pages/DetalleInvestigacionLSO";
import PerfilesCargo from "@/pages/PerfilesCargo";
import ExamenesMedicos from "@/pages/ExamenesMedicos";
import ResponsibleDesignation from "@/pages/ResponsibleDesignation";
import AsignarLsoExterno from "@/pages/AsignarLsoExterno";
import ResourceAllocation from "@/pages/ResourceAllocation";
import AfiliacionesSsss from "@/pages/AfiliacionesSsss";
import TrabajadoresAltoRiesgo from "@/pages/TrabajadoresAltoRiesgo";
import CopasstGestion from "@/pages/CopasstGestion";
import CapacitacionCopasst from "@/pages/CapacitacionCopasst";
import CopasstCms from "@/pages/CopasstCms";
import CopasstEvaluaciones from "@/pages/CopasstEvaluaciones";
import ComiteConvivenciaActas from "@/pages/ComiteConvivenciaActas";
import ProgramaCapacitacionAnual from "@/pages/ProgramaCapacitacionAnual";
import Curso50Horas from "@/pages/Curso50Horas";
import RegistrosInduccion from "@/pages/RegistrosInduccion";
import MedicionesAmbientales from "@/pages/MedicionesAmbientales";
import ConservacionAuditiva from "@/pages/ConservacionAuditiva";
import SustanciasQuimicas from "@/pages/SustanciasQuimicas";
import VigilanciaEpidemiologica from "@/pages/VigilanciaEpidemiologica";
import PerfilSociodemografico from "@/pages/PerfilSociodemografico";
import ActividadesPromocionPrevencion from "@/pages/ActividadesPromocionPrevencion";
import PoliticasSst from "@/pages/PoliticasSst";
import PlanesTrabajoAnual from "@/pages/PlanesTrabajoAnual";
import DetallePlanTrabajo from "@/pages/DetallePlanTrabajo";
import MatrizLegal from "@/pages/MatrizLegal";
import ConservacionDocumentos from "@/pages/ConservacionDocumentos";
import ObjetivosSst from "@/pages/ObjetivosSst";
import EvaluacionProveedores from "@/pages/EvaluacionProveedores";
import GestionCambios from "@/pages/GestionCambios";
import AdquisicionesSst from "@/pages/AdquisicionesSst";
import ComunicacionSst from "@/pages/ComunicacionSst";
import PortalEmpleados from "@/pages/PortalEmpleados";
import Iperc from "@/pages/Iperc";
import PlanEmergencias from "@/pages/PlanEmergencias";
import AuditoriasInternas from "@/pages/AuditoriasInternas";
import RevisionesDireccion from "@/pages/RevisionesDireccion";
import RecomendacionesArl from "@/pages/RecomendacionesArl";
import DashboardHacer from "@/pages/DashboardHacer";
import DashboardVerificar from "@/pages/DashboardVerificar";
import DashboardActuar from "@/pages/DashboardActuar";
import TerminosServicio from "@/pages/TerminosServicio";
import PoliticaPrivacidad from "@/pages/PoliticaPrivacidad";
import AcuerdoProcesamientoDatos from "@/pages/AcuerdoProcesamientoDatos";
import SolicitudesArco from "@/pages/SolicitudesArco";
import PlanesSuscripcion from "@/pages/PlanesSuscripcion";
import Checkout from "@/pages/Checkout";
import DashboardFacturacion from "@/pages/DashboardFacturacion";
import MiCuenta from "@/pages/MiCuenta";
import MiSuscripcion from "@/pages/MiSuscripcion";
import Pricing from "@/pages/Pricing";
import PricingPluginCalculator from "@/pages/PricingPluginCalculator";
import PricingCalculatorV2 from "@/pages/PricingCalculatorV2";
import PricingPluginAdmin from "@/pages/PricingPluginAdmin";
import Welcome from "@/pages/Welcome";
import PoliticaPrivacidadProveedor from "@/pages/PoliticaPrivacidadProveedor";
import DocumentosLegalesPdf from "@/pages/DocumentosLegalesPdf";
import RegistroAccesosProveedor from "@/pages/RegistroAccesosProveedor";
import CrearEmpresa from "@/pages/CrearEmpresa";
import CrearEmpresaCiiuFirst from "@/pages/CrearEmpresaCiiuFirst";
import TicketsSoporte from "@/pages/TicketsSoporte";
import AdminTicketsSoporte from "@/pages/AdminTicketsSoporte";
import AdminUsuariosSoporte from "@/pages/AdminUsuariosSoporte";
import AdminPromociones from "@/pages/AdminPromociones";
import Recomendar from "@/pages/Recomendar";
import RecuperarContrasena from "@/pages/RecuperarContrasena";
import RestablecerContrasena from "@/pages/RestablecerContrasena";
import LoginEmpresa from "@/pages/LoginEmpresa";
import LoginSoporte from "@/pages/LoginSoporte";
import SoporteLayout from "@/components/SoporteLayout";
import MensajesInternos from "@/pages/MensajesInternos";
import InduccionVirtualPublica from "@/pages/InduccionVirtualPublica";
import ConfiguracionInduccion from "@/pages/ConfiguracionInduccion";
import ConfiguracionNotificaciones from "@/pages/ConfiguracionNotificaciones";
import AccesosSoporte from "@/pages/AccesosSoporte";
import IndicadoresAccidentalidad from "@/pages/IndicadoresAccidentalidad";
import IndiceSeveridadILI from "@/pages/IndiceSeveridadILI";
import IndiceFrequenciaSeveridad from "@/pages/IndiceFrequenciaSeveridad";
import IndicadorMortalidad from "@/pages/IndicadorMortalidad";
import PrevalenciaEnfermedadLaboral from "@/pages/PrevalenciaEnfermedadLaboral";
import IncidenciaAccidentesEL from "@/pages/IncidenciaAccidentesEL";
import EstilosVidaSaludable from "@/pages/EstilosVidaSaludable";
import InvestigacionAccidentes from "@/pages/InvestigacionAccidentes";
import ArbolCausas from "@/pages/ArbolCausas";
import AusentismoLaboral from "@/pages/AusentismoLaboral";
import EntregaEpp from "@/pages/EntregaEpp";
import PartesInteresadas from "@/pages/PartesInteresadas";
import AnalisisContexto from "@/pages/AnalisisContexto";
import PlanMejoramientoContexto from "@/pages/PlanMejoramientoContexto";
import { ChapterGate } from "@/components/ChapterGate";
import { TrialAlert } from "@/components/TrialAlert";
import { SubscriptionBlockedModal } from "@/components/SubscriptionBlockedModal";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";

// Componente que decide si mostrar Welcome o Dashboard según autenticación
function HomeGateway() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Si está logueado -> siempre al Dashboard
  if (user) {
    return <Dashboard />;
  }
  
  // Si no está logueado, muestra la página de bienvenida
  return <Welcome />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeGateway} />
      <ProtectedRoute path="/crear-empresa" component={CrearEmpresaCiiuFirst} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/empresas/:id" component={CompanyDetail} />
      <ProtectedRoute path="/empresas" component={CompanyManagement} />
      <ProtectedRoute path="/usuarios" component={GestionUsuarios} />
      <ProtectedRoute path="/profesionales-licenciados" component={ProfesionalesLicenciados} />
      <ProtectedRoute path="/portal-licenciado/investigacion/:id" component={DetalleInvestigacionLSO} />
      <ProtectedRoute path="/portal-licenciado" component={PortalLicenciado} />
      <ProtectedRoute path="/trabajadores" component={Trabajadores} />
      <ProtectedRoute path="/perfiles-cargo" component={PerfilesCargo} />
      <ProtectedRoute path="/asignacion-recursos" component={ResourceAllocation} />
      <ProtectedRoute path="/designacion-responsable" component={ResponsibleDesignation} />
      <ProtectedRoute path="/asignar-lso-externo" component={AsignarLsoExterno} />
      <SubscriptionProtectedRoute path="/examenes-medicos" component={ExamenesMedicos} feature="hasExamenesMedicos" featureName="Exámenes Médicos Ocupacionales" />
      <ProtectedRoute path="/afiliaciones-ssss" component={AfiliacionesSsss} />
      <ProtectedRoute path="/trabajadores-alto-riesgo" component={TrabajadoresAltoRiesgo} />
      <ProtectedRoute path="/copasst" component={CopasstGestion} />
      <ProtectedRoute path="/copasst-gestion" component={CopasstGestion} />
      <ProtectedRoute path="/capacitacion-copasst" component={CapacitacionCopasst} />
      <ProtectedRoute path="/copasst-cms" component={CopasstCms} />
      <ProtectedRoute path="/copasst-evaluaciones" component={CopasstEvaluaciones} />
      <ProtectedRoute path="/comite-convivencia-actas" component={ComiteConvivenciaActas} />
      <ProtectedRoute path="/programa-capacitacion-anual" component={ProgramaCapacitacionAnual} />
      <ProtectedRoute path="/curso-50-horas" component={Curso50Horas} />
      <ProtectedRoute path="/registros-induccion" component={RegistrosInduccion} />
      <ProtectedRoute path="/configuracion-induccion" component={ConfiguracionInduccion} />
      <ProtectedRoute path="/configuracion-notificaciones" component={ConfiguracionNotificaciones} />
      <SubscriptionProtectedRoute path="/mediciones-ambientales" component={MedicionesAmbientales} feature="hasMedicionesAmbientales" featureName="Mediciones Ambientales" />
      <ProtectedRoute path="/conservacion-auditiva" component={ConservacionAuditiva} />
      <SubscriptionProtectedRoute path="/sustancias-quimicas" component={SustanciasQuimicas} feature="hasSustanciasQuimicas" featureName="Sustancias Químicas" />
      <ProtectedRoute path="/vigilancia-epidemiologica" component={VigilanciaEpidemiologica} />
      <ProtectedRoute path="/perfil-sociodemografico" component={PerfilSociodemografico} />
      <ProtectedRoute path="/actividades-promocion-prevencion" component={ActividadesPromocionPrevencion} />
      <ProtectedRoute path="/estilos-vida-saludable" component={EstilosVidaSaludable} />
      <ProtectedRoute path="/politicas-sst" component={PoliticasSst} />
      <ProtectedRoute path="/politica-sst" component={PoliticasSst} />
      <ProtectedRoute path="/accidentes" component={Accidentes} />
      <ProtectedRoute path="/investigacion-accidentes/:id" component={InvestigacionAccidentes} />
      <ProtectedRoute path="/investigacion-accidentes" component={InvestigacionAccidentes} />
      <ProtectedRoute path="/arbol-causas" component={ArbolCausas} />
      <ProtectedRoute path="/ausentismo-laboral" component={AusentismoLaboral} />
      <ProtectedRoute path="/entrega-epp" component={EntregaEpp} />
      <ProtectedRoute path="/capacitaciones" component={Capacitaciones} />
      <ProtectedRoute path="/inspecciones" component={Inspecciones} />
      <ProtectedRoute path="/medidas" component={MedidasPreventivas} />
      <ProtectedRoute path="/salud" component={SaludOcupacional} />
      <ProtectedRoute path="/estandares-sst/:id" component={DetalleEstandarSst} />
      <ProtectedRoute path="/estandares-sst" component={EstandaresSst} />
      <ProtectedRoute path="/evaluaciones-sst/:id" component={DetalleEvaluacionSst} />
      <ProtectedRoute path="/evaluaciones-sst" component={EvaluacionesSst} />
      <ProtectedRoute path="/indicadores-accidentalidad" component={IndicadoresAccidentalidad} />
      <ProtectedRoute path="/indicador-ili-incidentes" component={IndiceSeveridadILI} />
      <ProtectedRoute path="/indicador-frecuencia-severidad" component={IndiceFrequenciaSeveridad} />
      <ProtectedRoute path="/indicador-mortalidad" component={IndicadorMortalidad} />
      <ProtectedRoute path="/indicador-prevalencia" component={PrevalenciaEnfermedadLaboral} />
      <ProtectedRoute path="/indicador-incidencia" component={IncidenciaAccidentesEL} />
      <ProtectedRoute path="/indicador-ausentismo" component={AusentismoLaboral} />
      <ProtectedRoute path="/planes-trabajo-anual/:id" component={DetallePlanTrabajo} />
      <ProtectedRoute path="/planes-trabajo-anual" component={PlanesTrabajoAnual} />
      <ProtectedRoute path="/iperc" component={Iperc} />
      <ProtectedRoute path="/plan-emergencias" component={PlanEmergencias} />
      <SubscriptionProtectedRoute path="/auditorias-internas" component={AuditoriasInternas} feature="hasAuditorias" featureName="Auditorías Internas SST" />
      <SubscriptionProtectedRoute path="/revisiones-direccion" component={RevisionesDireccion} feature="hasRevisionDireccion" featureName="Revisión por la Dirección" />
      <ProtectedRoute path="/recomendaciones-arl" component={RecomendacionesArl} />
      <ProtectedRoute path="/dashboard-hacer" component={DashboardHacer} />
      <ProtectedRoute path="/dashboard-verificar" component={DashboardVerificar} />
      <ProtectedRoute path="/dashboard-actuar" component={DashboardActuar} />
      <SubscriptionProtectedRoute path="/matriz-legal" component={MatrizLegal} feature="hasMatrizLegal" featureName="Matriz Legal" />
      <ProtectedRoute path="/conservacion-documentos" component={ConservacionDocumentos} />
      <SubscriptionProtectedRoute path="/objetivos-sst" component={ObjetivosSst} feature="hasObjetivosIndicadores" featureName="Objetivos e Indicadores SST" />
      <SubscriptionProtectedRoute path="/evaluacion-proveedores" component={EvaluacionProveedores} feature="hasEvaluacionProveedores" featureName="Evaluación de Proveedores" />
      <SubscriptionProtectedRoute path="/gestion-cambios" component={GestionCambios} feature="hasGestionCambios" featureName="Gestión de Cambios" />
      <SubscriptionProtectedRoute path="/adquisiciones-sst" component={AdquisicionesSst} feature="hasAdquisicionesSST" featureName="Adquisiciones SST" />
      <SubscriptionProtectedRoute path="/comunicacion-sst" component={ComunicacionSst} feature="hasComunicacionSST" featureName="Comunicación SST" />
      <ProtectedRoute path="/partes-interesadas" component={PartesInteresadas} />
      <ProtectedRoute path="/analisis-contexto" component={AnalisisContexto} />
      <ProtectedRoute path="/plan-mejoramiento-contexto" component={PlanMejoramientoContexto} />
      <ProtectedRoute path="/portal-empleados" component={PortalEmpleados} />
      <ProtectedRoute path="/informes" component={Informes} />
      <ProtectedRoute path="/solicitudes-arco" component={SolicitudesArco} />
      <ProtectedRoute path="/mi-cuenta" component={MiCuenta} />
      <ProtectedRoute path="/tickets-soporte" component={TicketsSoporte} />
      <ProtectedRoute path="/admin-tickets" component={AdminTicketsSoporte} />
      <ProtectedRoute path="/admin-usuarios-soporte" component={AdminUsuariosSoporte} />
      <ProtectedRoute path="/admin-promociones" component={AdminPromociones} />
      <ProtectedRoute path="/mensajes-internos" component={MensajesInternos} />
      <ProtectedRoute path="/accesos-soporte" component={AccesosSoporte} />
      <ProtectedRoute path="/planes-suscripcion" component={PlanesSuscripcion} />
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/dashboard-facturacion" component={DashboardFacturacion} />
      <ProtectedRoute path="/mi-suscripcion" component={MiSuscripcion} />
      <SubscriptionProtectedRoute path="/pesv" component={Pesv} feature="hasPESV" featureName="Módulo PESV - Seguridad Vial" />
      <SubscriptionProtectedRoute path="/pesv/vehiculos" component={PesvVehiculos} feature="hasPESV" featureName="Módulo PESV - Vehículos" />
      <SubscriptionProtectedRoute path="/pesv/conductores" component={PesvConductores} feature="hasPESV" featureName="Módulo PESV - Conductores" />
      <SubscriptionProtectedRoute path="/pesv/inspecciones" component={PesvInspecciones} feature="hasPESV" featureName="Módulo PESV - Inspecciones" />
      <SubscriptionProtectedRoute path="/pesv/siniestros" component={PesvSiniestros} feature="hasPESV" featureName="Módulo PESV - Siniestros" />
      <SubscriptionProtectedRoute path="/pesv/capacitaciones" component={PesvCapacitaciones} feature="hasPESV" featureName="Módulo PESV - Capacitaciones" />
      <SubscriptionProtectedRoute path="/pesv/auditorias" component={PesvAuditorias} feature="hasPESV" featureName="Módulo PESV - Auditorías" />
      <SubscriptionProtectedRoute path="/pesv/evaluaciones" component={EvaluacionesPesv} feature="hasPESV" featureName="Módulo PESV - Evaluaciones" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:id" component={DetalleEvaluacionPesv} feature="hasPESV" featureName="Módulo PESV - Evaluación" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/vehiculos" component={PesvVehiculos} feature="hasPESV" featureName="Módulo PESV - Vehículos" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/conductores" component={PesvConductores} feature="hasPESV" featureName="Módulo PESV - Conductores" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/inspecciones" component={PesvInspeccionesEvaluacion} feature="hasPESV" featureName="Módulo PESV - Inspecciones" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/siniestros" component={PesvSiniestrosEvaluacion} feature="hasPESV" featureName="Módulo PESV - Siniestros" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/capacitaciones" component={PesvCapacitacionesEvaluacion} feature="hasPESV" featureName="Módulo PESV - Capacitaciones" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/auditorias" component={PesvAuditorias} feature="hasPESV" featureName="Módulo PESV - Auditorías" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/comite" component={PesvComite} feature="hasPESV" featureName="Módulo PESV - Comité" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/matriz-riesgos" component={MatrizRiesgosViales} feature="hasPESV" featureName="Módulo PESV - Matriz de Riesgos" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/mantenimiento" component={PesvMantenimientoVehicular} feature="hasPESV" featureName="Módulo PESV - Mantenimiento" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/monitoreo-gps" component={PesvMonitoreoGps} feature="hasPESV" featureName="Módulo PESV - Monitoreo GPS" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/rutas-seguras" component={PesvRutasSeguras} feature="hasPESV" featureName="Módulo PESV - Rutas Seguras" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/indicadores" component={IndicadoresPesv} feature="hasPESV" featureName="Módulo PESV - Indicadores" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/liderazgo" component={PesvLiderazgo} feature="hasPESV" featureName="Módulo PESV - Liderazgo" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/contexto-organizacional" component={ContextoOrganizacionalPesv} feature="hasPESV" featureName="Módulo PESV - Contexto Organizacional" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/factores-desempeno" component={FactoresDesempenoPesv} feature="hasPESV" featureName="Módulo PESV - Factores de Desempeño" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/mejora-continua" component={PesvMejoraContinua} feature="hasPESV" featureName="Módulo PESV - Mejora Continua" />
      <SubscriptionProtectedRoute path="/pesv/evaluacion/:evaluacionId/revision-direccion" component={PesvRevisionDireccion} feature="hasPESV" featureName="Módulo PESV - Revisión Dirección" />
      <SubscriptionProtectedRoute path="/pesv/mantenimiento" component={PesvMantenimientoVehicular} feature="hasPESV" featureName="Módulo PESV - Mantenimiento" />
      <SubscriptionProtectedRoute path="/pesv/monitoreo-gps" component={PesvMonitoreoGps} feature="hasPESV" featureName="Módulo PESV - Monitoreo GPS" />
      <SubscriptionProtectedRoute path="/pesv/rutas-seguras" component={PesvRutasSeguras} feature="hasPESV" featureName="Módulo PESV - Rutas Seguras" />
      <SubscriptionProtectedRoute path="/pesv/matriz-riesgos" component={MatrizRiesgosViales} feature="hasPESV" featureName="Módulo PESV - Matriz de Riesgos" />
      <SubscriptionProtectedRoute path="/pesv/contexto-organizacional" component={ContextoOrganizacionalPesv} feature="hasPESV" featureName="Módulo PESV - Contexto" />
      <SubscriptionProtectedRoute path="/pesv/indicadores" component={IndicadoresPesv} feature="hasPESV" featureName="Módulo PESV - Indicadores" />
      <SubscriptionProtectedRoute path="/pesv/factores-desempeno" component={FactoresDesempenoPesv} feature="hasPESV" featureName="Módulo PESV - Factores" />
      <SubscriptionProtectedRoute path="/pesv/comite" component={PesvComite} feature="hasPESV" featureName="Módulo PESV - Comité" />
      <SubscriptionProtectedRoute path="/pesv/liderazgo" component={PesvLiderazgo} feature="hasPESV" featureName="Módulo PESV - Liderazgo" />
      <Route path="/pricing" component={Pricing} />
      <Route path="/pricing-plugin/calculator" component={PricingPluginCalculator} />
      <Route path="/calculadora-precios" component={PricingCalculatorV2} />
      <ProtectedRoute path="/pricing-plugin/admin/pricing" component={PricingPluginAdmin} />
      <ProtectedRoute path="/registro-accesos-proveedor" component={RegistroAccesosProveedor} />
      <Route path="/terminos-servicio" component={TerminosServicio} />
      <Route path="/politica-privacidad" component={PoliticaPrivacidad} />
      <Route path="/politica-privacidad-proveedor" component={PoliticaPrivacidadProveedor} />
      <Route path="/acuerdo-procesamiento-datos" component={AcuerdoProcesamientoDatos} />
      <ProtectedRoute path="/documentos-legales" component={DocumentosLegalesPdf} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginEmpresa} />
      <Route path="/soporte/login" component={LoginSoporte} />
      <Route path="/recuperar-contrasena" component={RecuperarContrasena} />
      <Route path="/induccion-virtual/:token" component={InduccionVirtualPublica} />
      <Route path="/restablecer-contrasena" component={RestablecerContrasena} />
      <Route path="/recomendar" component={Recomendar} />
      <Route component={NotFound} />
    </Switch>
  );
}

function WorkerLayout() {
  const { logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Portal de Empleados SST</h1>
            <p className="text-sm opacity-90">Sistema de Salud y Seguridad en el Trabajo</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto px-6 py-6">
          <Router />
        </div>
      </main>
      <FooterMinimal />
    </div>
  );
}

function AdminLayout() {
  return (
    <CompanyProvider>
      <div className="flex flex-col h-screen w-full">
        <PHVANavigation />
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto px-6 py-6">
            <TrialAlert />
            <ChapterGate>
              <Router />
            </ChapterGate>
          </div>
        </main>
        <Footer />
      </div>
    </CompanyProvider>
  );
}

function SupportRouter() {
  return (
    <Switch>
      <Route path="/soporte/tickets" component={AdminTicketsSoporte} />
      <Route path="/soporte/login" component={LoginSoporte} />
      <Route>
        <Redirect to="/soporte/tickets" />
      </Route>
    </Switch>
  );
}

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { shouldBlock, subscriptionStatus, isLoading } = useSubscriptionCheck();
  const [, navigate] = useLocation();

  if (isLoading) {
    return null;
  }

  if (shouldBlock && subscriptionStatus) {
    return (
      <>
        {children}
        <SubscriptionBlockedModal
          subscriptionStatus={subscriptionStatus.subscriptionStatus}
          blockedReason={subscriptionStatus.blockedReason || "Su acceso está bloqueado"}
          trialEndsAt={subscriptionStatus.trialEndsAt}
          onActivateSubscription={() => navigate("/mi-suscripcion")}
          onContactSupport={() => window.open("mailto:soporte@sst-colombia.com", "_blank")}
        />
      </>
    );
  }

  return <>{children}</>;
}

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  useWebSocketNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Router />;
  }

  if (user.role === "soporte") {
    return (
      <SoporteLayout>
        <SupportRouter />
      </SoporteLayout>
    );
  }

  if (user.role === "superadmin" && location.startsWith("/soporte")) {
    return (
      <SoporteLayout>
        <SupportRouter />
      </SoporteLayout>
    );
  }

  if (user.role === "trabajador") {
    return (
      <SubscriptionGate>
        <WorkerLayout />
      </SubscriptionGate>
    );
  }

  return (
    <SubscriptionGate>
      <AdminLayout />
    </SubscriptionGate>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedLayout />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
