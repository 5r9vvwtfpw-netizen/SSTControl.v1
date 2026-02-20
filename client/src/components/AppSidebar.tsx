import {
  Home,
  AlertTriangle,
  GraduationCap,
  ClipboardCheck,
  Shield,
  Heart,
  BarChart3,
  Settings,
  Users,
  ClipboardList,
  FileCheck,
  Car,
  Building2,
  Briefcase,
  FileText,
  Stethoscope,
  UserCircle,
  Vote,
  BookOpen,
  Star,
  Scale,
  Search,
  UserMinus,
  HardHat,
  UsersRound,
  Globe,
  Target,
  Gift,
  CirclePlay,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import sstLogoPath from "@assets/SST-Colombia-logo-3_1768408022586.png";
import { useQuery } from "@tanstack/react-query";
import { isPesvRequired } from "@shared/utils";
import { hasAnyPermission, type Permission } from "@shared/permissions";
import { useSubscriptionFeatures, type SubscriptionFeatures } from "@/hooks/use-subscription-features";

const SUBSCRIPTION_FEATURE_MAP: Record<string, keyof SubscriptionFeatures> = {
  "/pesv": "hasPESV",
  "/examenes-medicos": "hasExamenesMedicos",
  "/auditorias-internas": "hasAuditorias",
  "/revisiones-direccion": "hasRevisionDireccion",
  "/matriz-legal": "hasMatrizLegal",
  "/objetivos-sst": "hasObjetivosIndicadores",
  "/evaluacion-proveedores": "hasEvaluacionProveedores",
  "/gestion-cambios": "hasGestionCambios",
  "/comunicacion-sst": "hasComunicacionSST",
  "/adquisiciones-sst": "hasAdquisicionesSST",
  "/mediciones-ambientales": "hasMedicionesAmbientales",
  "/sustancias-quimicas": "hasSustanciasQuimicas",
};

const menuItems: Array<{
  title: string;
  url: string;
  icon: any;
  requiredPermissions?: Permission[];
  pesvOnly?: boolean;
  superadminOnly?: boolean;
}> = [
  { title: "Inicio", url: "/", icon: Home, requiredPermissions: ["dashboard:view"] },
  { title: "Mi Cuenta", url: "/mi-cuenta", icon: UserCircle },
  { title: "Empresas", url: "/empresas", icon: Building2, requiredPermissions: ["companies:view"] },
  { title: "Promociones", url: "/admin-promociones", icon: Gift, superadminOnly: true },
  { title: "Gestión Videos", url: "/admin-videos-ayuda", icon: CirclePlay, superadminOnly: true },
  { title: "Videos de Ayuda", url: "/videos-ayuda", icon: CirclePlay },
  { title: "Usuarios", url: "/usuarios", icon: Users, requiredPermissions: ["users:view"] },
  { title: "Perfiles de Cargo", url: "/perfiles-cargo", icon: Briefcase, requiredPermissions: ["job_profiles:view"] },
  { title: "Exámenes Médicos", url: "/examenes-medicos", icon: Stethoscope, requiredPermissions: ["medical_exams:view"] },
  { title: "Accidentes e Incidentes", url: "/accidentes", icon: AlertTriangle, requiredPermissions: ["accidents:view"] },
  { title: "Investigación Accidentes", url: "/investigacion-accidentes", icon: Search, requiredPermissions: ["accidents:view"] },
  { title: "Ausentismo Laboral", url: "/ausentismo-laboral", icon: UserMinus, requiredPermissions: ["accidents:view"] },
  { title: "Entrega de EPP", url: "/entrega-epp", icon: HardHat, requiredPermissions: ["accidents:view"] },
  { title: "Capacitaciones", url: "/capacitaciones", icon: GraduationCap, requiredPermissions: ["trainings:view"] },
  { title: "Inspecciones", url: "/inspecciones", icon: ClipboardCheck, requiredPermissions: ["inspections:view"] },
  { title: "Medidas Preventivas", url: "/medidas", icon: Shield, requiredPermissions: ["measures:view"] },
  { title: "Salud Ocupacional", url: "/salud", icon: Heart, requiredPermissions: ["diseases:view"] },
  { title: "Estándares SST", url: "/estandares-sst", icon: ClipboardList, requiredPermissions: ["sst_evaluations:view"] },
  { title: "Evaluaciones SST", url: "/evaluaciones-sst", icon: FileCheck, requiredPermissions: ["sst_evaluations:view"] },
  { title: "Conservación de Documentos", url: "/conservacion-documentos", icon: FileText, requiredPermissions: ["documents:view"] },
  { title: "COPASST", url: "/copasst-gestion", icon: Vote, requiredPermissions: ["companies:view"] },
  { title: "Capacitación COPASST", url: "/capacitacion-copasst", icon: GraduationCap, requiredPermissions: ["trainings:view"] },
  { title: "Cursos COPASST (Admin)", url: "/copasst-cms", icon: BookOpen, requiredPermissions: ["trainings:edit"] },
  { title: "Evaluaciones 360°", url: "/copasst-evaluaciones", icon: Star, requiredPermissions: ["trainings:view"] },
  { title: "PESV - Seguridad Vial", url: "/pesv", icon: Car, pesvOnly: true, requiredPermissions: ["vehicles:view", "drivers:view"] },
  { title: "Informes", url: "/informes", icon: BarChart3, requiredPermissions: ["reports:view"] },
  { title: "Documentos Legales", url: "/documentos-legales", icon: Scale, requiredPermissions: ["users:edit"] },
  { title: "Partes Interesadas", url: "/partes-interesadas", icon: UsersRound, requiredPermissions: ["companies:view"] },
  { title: "Análisis de Contexto", url: "/analisis-contexto", icon: Globe, requiredPermissions: ["companies:view"] },
  { title: "Plan Mejora (Contexto)", url: "/plan-mejoramiento-contexto", icon: Target, requiredPermissions: ["companies:view"] },
];

const GLOBAL_ACCESS_ROLES = ["superadmin", "admin", "soporte"];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch current company info with vehicle/driver counts
  const { data: companyData } = useQuery<{
    vehicleCount: number;
    driverCount: number;
  }>({
    queryKey: ["/api/company/current"],
    enabled: !!user && !!user.companyId,
  });

  // Fetch subscription features for the current company
  const { data: subscriptionFeatures } = useSubscriptionFeatures();

  // Determine if PESV module should be available based on Decreto 1252/2021
  const hasPesv = companyData 
    ? isPesvRequired(companyData.vehicleCount, companyData.driverCount)
    : false;

  const isGlobalRole = user?.role && GLOBAL_ACCESS_ROLES.includes(user.role);

  const visibleMenuItems = menuItems.filter(item => {
    // Filter superadmin-only items
    if (item.superadminOnly && user?.role !== "superadmin") return false;
    
    // Filter by permissions
    if (item.requiredPermissions && user) {
      const hasPermission = hasAnyPermission(user.role, item.requiredPermissions);
      if (!hasPermission) return false;
    }
    
    // Filter PESV items based on requirement (≥10 vehicles OR ≥2 drivers)
    if (item.pesvOnly && !hasPesv) return false;

    // Filter by subscription features (skip for global access roles)
    if (!isGlobalRole && subscriptionFeatures) {
      const requiredFeature = SUBSCRIPTION_FEATURE_MAP[item.url];
      if (requiredFeature && !subscriptionFeatures[requiredFeature]) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img 
            src={sstLogoPath} 
            alt="SST Colombia Logo" 
            className="h-10 w-10 rounded-md object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold">SST Colombia</h2>
            <p className="text-xs text-muted-foreground">Seguridad Laboral</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión SST</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
