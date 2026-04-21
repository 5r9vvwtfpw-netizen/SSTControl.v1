import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  User,
  Users,
  Shield,
  FlameKindling,
  Info,
  Download,
  Loader2,
  ExternalLink,
  ClipboardList,
  UserCheck,
} from "lucide-react";

interface CopasstPeriodo {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  tipoComite: string;
  estado: string;
}

interface CopasstMiembro {
  id: string;
  workerId: string;
  cargo: string | null;
  rolMiembro: string;
  tipoRepresentante: string;
}

interface BrigadaEmergencia {
  id: string;
  nombre: string;
  tipo: string;
  descripcion?: string | null;
}

interface ResponsibleDesignation {
  id: string;
  workerId: string | null;
  position: string;
  status: string;
  isExternalLso: boolean | null;
  externalLsoName: string | null;
  designationDate: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  nit: string;
  representanteLegal?: string;
  responsableSst?: string;
  numTrabajadores?: number;
}

// ─── Nav link button ──────────────────────────────────────────────────────────
function NavLink({
  to,
  label = "Gestionar",
}: {
  to: string;
  label?: string;
}) {
  const [, setLocation] = useLocation();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setLocation(to);
      }}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1 cursor-pointer bg-transparent border-0 p-0"
      data-testid={`link-nav-${to.replace(/\//g, "-")}`}
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </button>
  );
}

// ─── Single org chart node ────────────────────────────────────────────────────
function OrgNode({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeVariant = "secondary",
  children,
  navTo,
  navLabel,
  color = "default",
  testId,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  children?: React.ReactNode;
  navTo?: string;
  navLabel?: string;
  color?: "default" | "primary" | "blue" | "green" | "orange" | "red";
  testId?: string;
}) {
  const colorMap: Record<string, string> = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/30",
    blue: "bg-blue-500/5 border-blue-500/30",
    green: "bg-green-500/5 border-green-500/30",
    orange: "bg-orange-500/5 border-orange-500/30",
    red: "bg-red-500/5 border-red-500/30",
  };
  const iconColorMap: Record<string, string> = {
    default: "text-muted-foreground",
    primary: "text-primary",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    orange: "text-orange-600 dark:text-orange-400",
    red: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex flex-col items-center" data-testid={testId}>
      <div className={`rounded-md border p-4 w-full max-w-xs shadow-sm ${colorMap[color]}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 ${iconColorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm leading-tight">{title}</span>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs shrink-0">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
            )}
            {navTo && <NavLink to={navTo} label={navLabel} />}
          </div>
        </div>
        {children && <div className="mt-3 pt-3 border-t border-border/50">{children}</div>}
      </div>
    </div>
  );
}

function ConnectorLine() {
  return (
    <div className="flex justify-center my-1">
      <div className="w-px h-6 bg-border" />
    </div>
  );
}

function MemberList({ members }: { members: CopasstMiembro[] }) {
  if (!members.length)
    return <p className="text-xs text-muted-foreground italic">Sin miembros registrados</p>;
  return (
    <ul className="space-y-1">
      {members.slice(0, 6).map((m) => (
        <li key={m.id} className="flex items-center gap-2 text-xs">
          <User className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="truncate text-muted-foreground">{m.cargo ?? m.rolMiembro}</span>
          <Badge variant="outline" className="text-xs shrink-0 capitalize">
            {m.rolMiembro}
          </Badge>
        </li>
      ))}
      {members.length > 6 && (
        <li className="text-xs text-muted-foreground">+{members.length - 6} más</li>
      )}
    </ul>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrganigramaSst() {
  const { user } = useAuth();
  const { toast } = useToast();
  const companyId = user?.companyId;
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      const res = await fetch("/api/organigrama-sst/pdf", { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || "No se pudo generar el PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "organigrama-sst.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF generado", description: "El Organigrama SG-SST fue descargado." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDownloadingPdf(false);
    }
  }

  const { data: company, isLoading: loadingCompany } = useQuery<CompanyInfo>({
    queryKey: ["/api/company/current"],
    enabled: !!companyId,
  });

  const { data: periodoActivo, isLoading: loadingPeriodo } = useQuery<CopasstPeriodo>({
    queryKey: ["/api/copasst-periodos/activo"],
    enabled: !!companyId,
  });

  const { data: miembros = [], isLoading: loadingMiembros } = useQuery<CopasstMiembro[]>({
    queryKey: ["/api/copasst-miembros", periodoActivo?.id],
    enabled: !!periodoActivo?.id,
  });

  const { data: brigadas = [], isLoading: loadingBrigadas } = useQuery<BrigadaEmergencia[]>({
    queryKey: ["/api/brigadas-emergencia"],
    enabled: !!companyId,
  });

  const { data: designaciones = [], isLoading: loadingDesignaciones } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
    enabled: !!companyId,
  });

  const isLoading = loadingCompany || loadingPeriodo || loadingMiembros || loadingBrigadas || loadingDesignaciones;

  const miembrosEmpleador = miembros.filter((m) => m.tipoRepresentante === "empleador");
  const miembrosTrabajadores = miembros.filter((m) => m.tipoRepresentante === "trabajador");

  // Responsable principal SST: primera designación activa
  const designacionesActivas = designaciones.filter((d) => d.status === "activo");
  const responsablePrincipal = designacionesActivas[0] ?? null;
  const responsableNombre = responsablePrincipal?.isExternalLso
    ? (responsablePrincipal.externalLsoName ?? "LSO Externo")
    : responsablePrincipal
    ? responsablePrincipal.position
    : null;

  // Vigía SST aplica para empresas < 10 trabajadores o si el período dice 'vigia'
  const numWorkers = company?.numTrabajadores ?? 0;
  const tieneVigia =
    periodoActivo?.tipoComite === "vigia" || (numWorkers > 0 && numWorkers < 10);

  // Año del período activo derivado de fechaInicio
  const periodoAnio = periodoActivo?.fechaInicio
    ? new Date(periodoActivo.fechaInicio).getFullYear()
    : null;

  return (
    <div className="space-y-6 p-6 print:p-4 max-w-5xl mx-auto">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Organigrama del SG-SST
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Estructura organizativa del Sistema de Gestión de Seguridad y Salud en el Trabajo
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          data-testid="button-download-pdf-organigrama"
        >
          {downloadingPdf ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {downloadingPdf ? "Generando..." : "Descargar PDF"}
        </Button>
      </div>

      {/* ── Legal basis ───────────────────────────────────────────────────── */}
      <Alert className="print:hidden">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Base legal:</strong> Decreto 1072/2015 Art. 2.2.4.6.8 — El empleador debe definir
          y comunicar la estructura organizativa del SG-SST con roles, responsabilidades y
          autoridades en materia de SST.
        </AlertDescription>
      </Alert>

      {/* ── Org chart ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full max-w-xs mx-auto" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          {/* Nivel 1 — Representante Legal */}
          <OrgNode
            icon={Building2}
            title="Representante Legal"
            subtitle={
              company?.representanteLegal
                ? company.representanteLegal
                : company?.name ?? "Empresa"
            }
            badge="Alta Dirección"
            color="primary"
            testId="org-node-representante-legal"
          />

          <ConnectorLine />

          {/* Nivel 2 — Responsable SST */}
          <OrgNode
            icon={UserCheck}
            title="Responsable / Coordinador SST"
            subtitle={
              responsablePrincipal
                ? responsablePrincipal.isExternalLso
                  ? `${responsablePrincipal.externalLsoName ?? "LSO Externo"} — ${responsablePrincipal.position}`
                  : responsablePrincipal.position
                : "Sin asignar — definir en Designación de Responsable"
            }
            badge={
              designacionesActivas.length > 0
                ? `${designacionesActivas.length} designación${designacionesActivas.length > 1 ? "es" : ""}`
                : "Pendiente"
            }
            badgeVariant={designacionesActivas.length > 0 ? "secondary" : "destructive"}
            color="blue"
            navTo="/designacion-responsable"
            navLabel="Ver designación"
            testId="org-node-responsable-sst"
          />

          <ConnectorLine />

          {/* Nivel 3 — COPASST o Vigía + Comité de Convivencia */}
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-center">
              <div className="w-px h-4 bg-border" />
            </div>
            <div className="flex flex-wrap gap-6 justify-center w-full">
              {/* COPASST o Vigía SST */}
              {tieneVigia ? (
                <OrgNode
                  icon={Shield}
                  title="Vigía SST"
                  subtitle="Empresas con menos de 10 trabajadores — Decreto 1295/1994"
                  badge="Vigía"
                  color="green"
                  navTo="/copasst"
                  navLabel="Gestionar Vigía"
                  testId="org-node-vigia-sst"
                />
              ) : (
                <OrgNode
                  icon={Shield}
                  title="COPASST"
                  subtitle={
                    periodoActivo
                      ? `Período ${periodoAnio ?? ""} — ${periodoActivo.estado}`
                      : "Sin período activo — crear en el módulo COPASST"
                  }
                  badge={
                    miembros.length > 0 ? `${miembros.length} miembros` : "Sin miembros"
                  }
                  badgeVariant={miembros.length > 0 ? "secondary" : "destructive"}
                  color="green"
                  navTo="/copasst"
                  navLabel="Gestionar COPASST"
                  testId="org-node-copasst"
                >
                  {miembros.length > 0 && (
                    <div className="space-y-2">
                      {miembrosEmpleador.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Representantes empleador
                          </p>
                          <MemberList members={miembrosEmpleador} />
                        </div>
                      )}
                      {miembrosTrabajadores.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Representantes trabajadores
                          </p>
                          <MemberList members={miembrosTrabajadores} />
                        </div>
                      )}
                    </div>
                  )}
                </OrgNode>
              )}

              {/* Comité de Convivencia */}
              <OrgNode
                icon={Users}
                title="Comité de Convivencia Laboral"
                subtitle="Res. 2646/2008 — Gestión de riesgo psicosocial"
                badge="Obligatorio"
                color="orange"
                navTo="/comite-convivencia-actas"
                navLabel="Ver actas"
                testId="org-node-comite-convivencia"
              />
            </div>
          </div>

          <ConnectorLine />

          {/* Nivel 4 — Brigadas de Emergencia */}
          {brigadas.length > 0 ? (
            <div className="flex flex-col items-center w-full">
              <div className="flex flex-wrap gap-4 justify-center w-full">
                {brigadas.map((brigada) => (
                  <OrgNode
                    key={brigada.id}
                    icon={FlameKindling}
                    title={brigada.nombre}
                    subtitle={brigada.descripcion ?? `Tipo: ${brigada.tipo}`}
                    badge="Brigada"
                    color="red"
                    navTo="/plan-emergencias"
                    navLabel="Ver plan"
                    testId={`org-node-brigada-${brigada.id}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <OrgNode
              icon={FlameKindling}
              title="Brigadas de Emergencia"
              subtitle="Sin brigadas registradas — configurar en Plan de Emergencias"
              badge="Pendiente"
              badgeVariant="destructive"
              color="red"
              navTo="/plan-emergencias"
              navLabel="Configurar brigadas"
              testId="org-node-brigadas"
            />
          )}

          <ConnectorLine />

          {/* Nivel 5 — Trabajadores */}
          <OrgNode
            icon={Users}
            title="Trabajadores"
            subtitle={
              numWorkers > 0
                ? `${numWorkers} trabajador(es) registrado(s)`
                : "Todos los colaboradores de la empresa"
            }
            badge="Todos"
            color="default"
            navTo="/trabajadores"
            navLabel="Ver trabajadores"
            testId="org-node-trabajadores"
          />
        </div>
      )}

      {/* ── Info footer ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 print:hidden">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              ¿Cómo actualizar el organigrama?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Representante Legal / Empresa:</strong> se toma del registro de empresa
            </p>
            <p>
              <strong>Responsable SST:</strong> en{" "}
              <NavLink to="/designacion-responsable" label="Designación de Responsable" />
            </p>
            <p>
              <strong>COPASST / Vigía:</strong> en{" "}
              <NavLink to="/copasst" label="el módulo COPASST" />
            </p>
            <p>
              <strong>Comité de Convivencia:</strong> en{" "}
              <NavLink to="/comite-convivencia-actas" label="Actas de Convivencia" />
            </p>
            <p>
              <strong>Brigadas:</strong> en{" "}
              <NavLink to="/plan-emergencias" label="el Plan de Emergencias" />
            </p>
            <p>
              <strong>Trabajadores:</strong> en{" "}
              <NavLink to="/trabajadores" label="el módulo Trabajadores" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Marco normativo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Decreto 1072/2015 Art. 2.2.4.6.8</strong> — Obligaciones del empleador
            </p>
            <p>
              <strong>Resolución 0312/2019</strong> — Estándares Mínimos SG-SST
            </p>
            <p>
              <strong>Ley 1562/2012</strong> — Sistema General de Riesgos Laborales
            </p>
            <p>
              <strong>ISO 45001:2018</strong> — Cl. 5.3: Roles, responsabilidades y autoridades
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
