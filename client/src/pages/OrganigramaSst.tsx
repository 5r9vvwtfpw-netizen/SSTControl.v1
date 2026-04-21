import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  User,
  Users,
  Shield,
  FlameKindling,
  Info,
  Printer,
  ExternalLink,
  ChevronDown,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { Link } from "wouter";

interface CopasstPeriodo {
  id: string;
  anio: number;
  estado: string;
  fechaConstitucion?: string;
}

interface CopasstMiembro {
  id: string;
  nombre: string;
  cargo: string;
  rol: string;
  tipo: string; // 'empleador' | 'trabajadores'
  workerId?: string;
}

interface BrigadaEmergencia {
  id: string;
  nombre: string;
  tipo: string;
  lider?: string;
  miembros?: number;
}

interface CompanyInfo {
  id: string;
  name: string;
  nit: string;
  representanteLegal?: string;
  responsableSst?: string;
  numTrabajadores?: number;
  nivelRiesgoArl?: string;
  tieneCopasst?: boolean;
  tieneVigiaSst?: boolean;
}

function OrgNode({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeVariant = "secondary",
  children,
  linkTo,
  linkLabel,
  color = "default",
  "data-testid": testId,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  children?: React.ReactNode;
  linkTo?: string;
  linkLabel?: string;
  color?: "default" | "primary" | "blue" | "green" | "orange" | "red";
  "data-testid"?: string;
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
            {linkTo && (
              <Link href={linkTo}>
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1 cursor-pointer">
                  {linkLabel ?? "Gestionar"}
                  <ExternalLink className="h-3 w-3" />
                </span>
              </Link>
            )}
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

function HorizontalGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-center my-1">
        <div className="w-px h-6 bg-border" />
      </div>
      <div className="flex flex-wrap gap-4 justify-center w-full">{children}</div>
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
          <span className="truncate">{m.nombre}</span>
          <Badge variant="outline" className="text-xs shrink-0 capitalize">
            {m.rol}
          </Badge>
        </li>
      ))}
      {members.length > 6 && (
        <li className="text-xs text-muted-foreground">+{members.length - 6} más</li>
      )}
    </ul>
  );
}

export default function OrganigramaSst() {
  const { user } = useAuth();
  const companyId = user?.companyId;

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

  const isLoading = loadingCompany || loadingPeriodo || loadingMiembros || loadingBrigadas;

  const handlePrint = () => window.print();

  const miembrosEmpleador = miembros.filter((m) => m.tipo === "empleador");
  const miembrosTrabajadores = miembros.filter((m) => m.tipo === "trabajadores");
  const tieneVigia = company?.tieneVigiaSst || (company?.numTrabajadores ?? 0) < 10;
  const tieneCopasst = !tieneVigia;

  return (
    <div className="space-y-6 p-6 print:p-4 max-w-5xl mx-auto">
      {/* Header */}
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
          onClick={handlePrint}
          className="print:hidden"
          data-testid="button-print-organigrama"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Legal basis alert */}
      <Alert className="print:hidden">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Base legal:</strong> Decreto 1072/2015 Art. 2.2.4.6.8 — El empleador debe definir
          y comunicar la estructura organizativa del SG-SST, incluyendo roles, responsabilidades y
          autoridades en materia de SST.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full max-w-xs mx-auto" />
          <Skeleton className="h-24 w-full max-w-xs mx-auto" />
          <Skeleton className="h-24 w-full max-w-xs mx-auto" />
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
            linkTo="/ajustes-empresa"
            linkLabel="Actualizar datos"
            data-testid="org-node-representante-legal"
          />

          <ConnectorLine />

          {/* Nivel 2 — Responsable SST */}
          <OrgNode
            icon={UserCheck}
            title="Responsable / Coordinador SST"
            subtitle={
              company?.responsableSst
                ? company.responsableSst
                : "Sin asignar — definir en Designación de Responsable"
            }
            badge="Obligatorio"
            badgeVariant={company?.responsableSst ? "secondary" : "destructive"}
            color="blue"
            linkTo="/designacion-responsable"
            linkLabel="Ver designación"
            data-testid="org-node-responsable-sst"
          />

          <ConnectorLine />

          {/* Nivel 3 — COPASST o Vigía + Comité de Convivencia */}
          <div className="flex flex-col items-center w-full">
            {/* Horizontal branch line */}
            <div className="flex justify-center">
              <div className="w-px h-4 bg-border" />
            </div>
            <div className="flex flex-wrap gap-6 justify-center w-full">
              {/* COPASST o Vigía SST */}
              {tieneCopasst ? (
                <div className="flex flex-col items-center" data-testid="org-node-copasst">
                  <OrgNode
                    icon={Shield}
                    title="COPASST"
                    subtitle={
                      periodoActivo
                        ? `Período ${periodoActivo.anio} — ${periodoActivo.estado}`
                        : "Sin período activo"
                    }
                    badge={miembros.length > 0 ? `${miembros.length} miembros` : "Sin miembros"}
                    badgeVariant={miembros.length > 0 ? "secondary" : "destructive"}
                    color="green"
                    linkTo="/copasst"
                    linkLabel="Gestionar COPASST"
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
                </div>
              ) : (
                <div className="flex flex-col items-center" data-testid="org-node-vigia-sst">
                  <OrgNode
                    icon={Shield}
                    title="Vigía SST"
                    subtitle="Empresas con menos de 10 trabajadores"
                    badge="Vigía"
                    color="green"
                    linkTo="/copasst"
                    linkLabel="Gestionar Vigía"
                  />
                </div>
              )}

              {/* Comité de Convivencia */}
              <div className="flex flex-col items-center" data-testid="org-node-comite-convivencia">
                <OrgNode
                  icon={Users}
                  title="Comité de Convivencia Laboral"
                  subtitle="Resolución 2646/2008 — Manejo de riesgo psicosocial"
                  badge="Obligatorio"
                  color="orange"
                  linkTo="/comite-convivencia-actas"
                  linkLabel="Ver actas"
                />
              </div>
            </div>
          </div>

          <ConnectorLine />

          {/* Nivel 4 — Brigadas de Emergencia */}
          {brigadas.length > 0 ? (
            <HorizontalGroup>
              {brigadas.map((brigada) => (
                <div key={brigada.id} data-testid={`org-node-brigada-${brigada.id}`}>
                  <OrgNode
                    icon={FlameKindling}
                    title={brigada.nombre}
                    subtitle={
                      brigada.lider
                        ? `Líder: ${brigada.lider}`
                        : `Tipo: ${brigada.tipo}`
                    }
                    badge={brigada.miembros ? `${brigada.miembros} integrantes` : "Brigada"}
                    color="red"
                    linkTo="/plan-emergencias"
                    linkLabel="Ver plan"
                  />
                </div>
              ))}
            </HorizontalGroup>
          ) : (
            <OrgNode
              icon={FlameKindling}
              title="Brigadas de Emergencia"
              subtitle="Sin brigadas registradas — configurar en Plan de Emergencias"
              badge="Pendiente"
              badgeVariant="destructive"
              color="red"
              linkTo="/plan-emergencias"
              linkLabel="Configurar brigadas"
              data-testid="org-node-brigadas"
            />
          )}

          <ConnectorLine />

          {/* Nivel 5 — Trabajadores */}
          <OrgNode
            icon={Users}
            title="Trabajadores"
            subtitle={
              company?.numTrabajadores != null
                ? `${company.numTrabajadores} trabajador(es) registrado(s)`
                : "Todos los colaboradores de la empresa"
            }
            badge="Todos"
            color="default"
            linkTo="/trabajadores"
            linkLabel="Ver trabajadores"
            data-testid="org-node-trabajadores"
          />
        </div>
      )}

      {/* Footer — información complementaria */}
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
              • <strong>Representante Legal / Empresa:</strong> en Configuración de Empresa
            </p>
            <p>
              • <strong>Responsable SST:</strong> en Designación de Responsable
            </p>
            <p>
              • <strong>COPASST / Vigía:</strong> en el módulo COPASST
            </p>
            <p>
              • <strong>Comité de Convivencia:</strong> en Actas de Convivencia
            </p>
            <p>
              • <strong>Brigadas:</strong> en el Plan de Emergencias
            </p>
            <p>
              • <strong>Trabajadores:</strong> en el módulo Trabajadores
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
