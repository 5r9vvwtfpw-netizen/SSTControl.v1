import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { 
  Shield, 
  ChevronDown, 
  LogOut, 
  Settings,
  ClipboardList,
  Hammer,
  CheckSquare,
  RefreshCw,
  BookOpen,
  FileText,
  Clock,
  XCircle,
  User,
  Building2,
  Car,
  LayoutDashboard,
  Users,
  FileCheck,
  Award,
  MessageSquare,
  Mail
} from "lucide-react";
import safetyHelmetAvatar from "@assets/generated_images/safety_helmet_avatar_icon.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useCompanyContext } from "@/hooks/use-company-context";
import { roleLabels, getRolePermissions } from "@shared/permissions";
import { canAccessRoute } from "@shared/route-permissions";
import { filterMenuItemsByChapter } from "@shared/chapter-modules";
import type { Company } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ProviderAccessDialog } from "@/components/ProviderAccessDialog";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/NotificationBell";

type PHVASection = "configuracion" | "planear" | "hacer" | "verificar" | "actuar";

interface MenuItem {
  label: string;
  path: string;
  hidden?: boolean;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const phvaMenus: Record<PHVASection, MenuGroup[]> = {
  configuracion: [
    {
      items: [
        { label: "Panel de Control", path: "/", hidden: true },
        { label: "Empresas", path: "/empresas" },
        { label: "Usuarios", path: "/usuarios" },
        { label: "Portal de Empleados", path: "/portal-empleados" },
      ],
    },
    {
      title: "Administración Proveedor",
      items: [
        { label: "Panel de Facturación", path: "/dashboard-facturacion" },
        { label: "Promociones", path: "/admin-promociones" },
        { label: "Mi Cuenta", path: "/mi-cuenta" },
        { label: "Tickets de Soporte", path: "/tickets-soporte" },
        { label: "Gestión de Tickets (Admin)", path: "/admin-tickets" },
        { label: "Usuarios de Soporte", path: "/admin-usuarios-soporte" },
        { label: "Profesionales Licenciados", path: "/profesionales-licenciados" },
        { label: "Documentos Legales", path: "/documentos-legales" },
        { label: "Videos de Ayuda", path: "/admin-videos-ayuda" },
      ],
    },
    {
      title: "Comunicación Interna",
      items: [
        { label: "Mensajes Internos", path: "/mensajes-internos" },
        { label: "Notificaciones", path: "/configuracion-notificaciones" },
      ],
    },
    {
      title: "Ayuda",
      items: [
        { label: "Videos de Ayuda", path: "/videos-ayuda" },
      ],
    },
  ],
  planear: [
    {
      title: "Personal",
      items: [
        { label: "Trabajadores", path: "/trabajadores" },
        { label: "Perfiles de Cargo", path: "/perfiles-cargo" },
        { label: "Afiliaciones SSSS", path: "/afiliaciones-ssss" },
      ],
    },
    {
      title: "Gestión Integral",
      items: [
        { label: "Evaluación Inicial", path: "/evaluaciones-sst" },
      ],
    },
  ],
  hacer: [
    {
      title: "Paneles Ejecutivos",
      items: [
        { label: "Panel HACER - Controles", path: "/dashboard-hacer" },
      ],
    },
  ],
  verificar: [
    {
      title: "Paneles Ejecutivos",
      items: [
        { label: "Panel VERIFICAR - Indicadores", path: "/dashboard-verificar" },
      ],
    },
  ],
  actuar: [
    {
      title: "Paneles Ejecutivos",
      items: [
        { label: "Panel ACTUAR - Eficacia", path: "/dashboard-actuar" },
      ],
    },
  ],
};

const phvaTabs: { key: PHVASection; label: string; icon?: typeof Settings }[] = [
  { key: "configuracion", label: "Administración Global" },
  { key: "planear", label: "Planear", icon: ClipboardList },
  { key: "hacer", label: "Hacer", icon: Hammer },
  { key: "verificar", label: "Verificar", icon: CheckSquare },
  { key: "actuar", label: "Actuar", icon: RefreshCw },
];

const pesvNavMenuItems: { label: string; path: string }[] = [
  { label: "Panel de Control", path: "/pesv" },
  { label: "Evaluaciones PESV", path: "/pesv/evaluaciones" },
];

export function PHVANavigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<PHVASection | null>(null);
  const [pesvDropdownOpen, setPesvDropdownOpen] = useState(false);
  const [selectKey, setSelectKey] = useState(0);
  const { 
    canSelectCompany, 
    companies, 
    selectedCompanyId, 
    setSelectedCompanyId, 
    selectedCompany,
    isLoading: companiesLoading,
    startAccessSession,
    endAccessSession,
    currentAccessSession,
    pendingCompanySelection,
    setPendingCompanySelection,
    companyChapter,
  } = useCompanyContext();

  const { data: userCompanyData } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !!user && user.role !== 'superadmin' && !!user.companyId,
    staleTime: 60000,
  });

  const effectiveCompany = user?.role === 'superadmin' ? selectedCompany : userCompanyData;
  const companyHasVehicles = (effectiveCompany?.numberOfVehicles ?? 0) > 0;

  const handleCompanySelect = (value: string) => {
    if (!value || value === selectedCompanyId) return;
    setSelectKey(prev => prev + 1);
    setSelectedCompanyId(value);
  };

  const handleAccessConfirm = async (reason: string, description: string, ticketNumber?: string) => {
    if (!pendingCompanySelection) return;
    await startAccessSession(pendingCompanySelection.id, reason, description, ticketNumber);
    setPendingCompanySelection(null);
  };

  const handleAccessCancel = () => {
    setPendingCompanySelection(null);
    setSelectKey(prev => prev + 1);
  };

  // Obtener permisos del usuario actual
  const userPermissions = useMemo(() => {
    if (!user?.role) return [];
    return getRolePermissions(user.role);
  }, [user?.role]);

  // Filtrar menús según permisos del usuario Y capítulo de la empresa (Resolución 0312/2019)
  const filteredPhvaMenus = useMemo(() => {
    const filtered: Record<PHVASection, MenuGroup[]> = {
      configuracion: [],
      planear: [],
      hacer: [],
      verificar: [],
      actuar: [],
    };

    for (const [section, groups] of Object.entries(phvaMenus)) {
      const filteredGroups: MenuGroup[] = [];
      
      for (const group of groups) {
        // Primero filtrar por permisos de usuario
        let filteredItems = group.items.filter(item => 
          canAccessRoute(userPermissions, item.path)
        );
        
        filteredItems = filterMenuItemsByChapter(filteredItems, companyChapter);
        
        if (companyHasVehicles && companyChapter !== null) {
          const pesvItemsFromOriginal = group.items.filter(item =>
            canAccessRoute(userPermissions, item.path) &&
            (item.path === "/pesv" || item.path.startsWith("/pesv/"))
          );
          for (const pesvItem of pesvItemsFromOriginal) {
            if (!filteredItems.some(fi => fi.path === pesvItem.path)) {
              filteredItems.push(pesvItem);
            }
          }
        }
        
        // Solo incluir el grupo si tiene items visibles
        if (filteredItems.length > 0) {
          filteredGroups.push({
            ...group,
            items: filteredItems,
          });
        }
      }
      
      filtered[section as PHVASection] = filteredGroups;
    }

    return filtered;
  }, [userPermissions, companyChapter, companyHasVehicles]);

  // Filtrar tabs PHVA (no mostrar tabs sin items)
  const visiblePhvaTabs = useMemo(() => {
    return phvaTabs.filter(tab => 
      filteredPhvaMenus[tab.key].length > 0
    );
  }, [filteredPhvaMenus]);

  const showPesvTab = useMemo(() => {
    if (!user) return false;
    const globalRoles = ["superadmin", "admin", "soporte"];
    if (globalRoles.includes(user.role)) return true;
    return companyHasVehicles && canAccessRoute(userPermissions, "/pesv");
  }, [user, companyHasVehicles, userPermissions]);

  const filteredPesvNavItems = useMemo(() => {
    return pesvNavMenuItems.filter(item => canAccessRoute(userPermissions, item.path));
  }, [userPermissions]);

  const isPesvActive = location === "/pesv" || location.startsWith("/pesv/");

  const getActiveSection = (): PHVASection => {
    for (const [section, groups] of Object.entries(filteredPhvaMenus)) {
      for (const group of groups) {
        if (group.items.some(item => location === item.path || location.startsWith(item.path + "/"))) {
          return section as PHVASection;
        }
      }
    }

    const routeSectionMap: Record<string, PHVASection> = {
      "/trabajadores": "planear",
      "/perfiles-cargo": "planear",
      "/afiliaciones-ssss": "planear",
      "/evaluaciones-sst": "planear",
      "/estandares-sst": "planear",
      "/politicas-sst": "planear",
      "/politica-sst": "planear",
      "/asignacion-recursos": "planear",
      "/designacion-responsable": "planear",
      "/asignar-lso-externo": "planear",
      "/programa-capacitacion-anual": "planear",
      "/planes-trabajo-anual": "planear",
      "/iperc": "planear",
      "/plan-emergencias": "planear",
      "/matriz-legal": "planear",
      "/objetivos-sst": "planear",
      "/partes-interesadas": "planear",
      "/analisis-contexto": "planear",
      "/plan-mejoramiento-contexto": "planear",
      "/copasst": "planear",
      "/copasst-gestion": "planear",
      "/copasst-cms": "planear",
      "/comite-convivencia-actas": "planear",
      "/conservacion-documentos": "planear",
      "/comunicacion-sst": "planear",
      "/perfil-sociodemografico": "planear",

      "/dashboard-hacer": "hacer",
      "/capacitaciones": "hacer",
      "/capacitacion-copasst": "hacer",
      "/registros-induccion": "hacer",
      "/configuracion-induccion": "hacer",
      "/curso-50-horas": "hacer",
      "/inspecciones": "hacer",
      "/entrega-epp": "hacer",
      "/examenes-medicos": "hacer",
      "/mediciones-ambientales": "hacer",
      "/conservacion-auditiva": "hacer",
      "/sustancias-quimicas": "hacer",
      "/vigilancia-epidemiologica": "hacer",
      "/actividades-promocion-prevencion": "hacer",
      "/estilos-vida-saludable": "hacer",
      "/medidas": "hacer",
      "/salud": "hacer",
      "/accidentes": "hacer",
      "/investigacion-accidentes": "hacer",
      "/arbol-causas": "hacer",
      "/ausentismo-laboral": "hacer",
      "/evaluacion-proveedores": "hacer",
      "/gestion-cambios": "hacer",
      "/adquisiciones-sst": "hacer",
      "/contratos": "hacer",
      "/trabajadores-alto-riesgo": "hacer",

      "/dashboard-verificar": "verificar",
      "/indicadores-accidentalidad": "verificar",
      "/indicador-ili-incidentes": "verificar",
      "/indicador-frecuencia-severidad": "verificar",
      "/indicador-mortalidad": "verificar",
      "/indicador-prevalencia": "verificar",
      "/indicador-incidencia": "verificar",
      "/indicador-ausentismo": "verificar",
      "/copasst-evaluaciones": "verificar",
      "/auditorias-internas": "verificar",
      "/informes": "verificar",

      "/dashboard-actuar": "actuar",
      "/revisiones-direccion": "actuar",
      "/recomendaciones-arl": "actuar",
    };

    for (const [routePrefix, section] of Object.entries(routeSectionMap)) {
      if (location === routePrefix || location.startsWith(routePrefix + "/")) {
        return section;
      }
    }

    return "configuracion";
  };

  const activeSection = getActiveSection();

  const currentDate = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ===== NAVEGACIÓN EXCLUSIVA PARA ROL LSO (Licenciado en Salud Ocupacional) =====
  // El rol LSO solo debe ver su portal específico, no el menú PHVA completo
  if (user?.role === 'lso') {
    const lsoNavItems = [
      { label: "Panel", href: "/portal-licenciado?tab=dashboard", icon: LayoutDashboard, tab: "dashboard" },
      { label: "Empresas", href: "/portal-licenciado?tab=empresas", icon: Building2, tab: "empresas" },
      { label: "Documentos", href: "/portal-licenciado?tab=documentos", icon: FileCheck, tab: "documentos" },
      { label: "PESV", href: "/portal-licenciado?tab=pesv", icon: Car, tab: "pesv" },
      { label: "Mi Licencia", href: "/portal-licenciado?tab=licencia", icon: Award, tab: "licencia" },
    ];

    const isOnPortal = location.startsWith("/portal-licenciado");
    const isOnMessages = location.startsWith("/mensajes-internos");
    const currentTab = isOnPortal ? new URLSearchParams(window.location.search).get("tab") || "dashboard" : null;

    return (
      <header className="sticky top-0 z-50 phva-navigation-header">
        <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between py-3">
              <Link href="/portal-licenciado">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold leading-tight">SG-SST</h1>
                    <p className="text-[10px] opacity-80">Portal del Licenciado</p>
                  </div>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1" data-testid="nav-lso-menu">
                {lsoNavItems.map((item) => {
                  const isActive = isOnPortal && currentTab === item.tab;
                  return (
                    <Link key={item.tab} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={isActive ? "font-semibold text-primary" : "text-white/90 hover:text-white"}
                        data-testid={`nav-lso-${item.tab}`}
                      >
                        <item.icon className="mr-1.5 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <div className="w-px h-6 bg-white/20 mx-1" />
                <Link href="/mensajes-internos">
                  <Button
                    variant={isOnMessages ? "secondary" : "ghost"}
                    size="sm"
                    className={isOnMessages ? "font-semibold text-primary" : "text-white/90 hover:text-white"}
                    data-testid="nav-lso-mensajes"
                  >
                    <Mail className="mr-1.5 h-4 w-4" />
                    Mensajes
                  </Button>
                </Link>
              </nav>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white" data-testid="button-lso-mobile-menu">
                      <ClipboardList className="h-5 w-5 mr-1" />
                      Menú
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-52">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Portal LSO</DropdownMenuLabel>
                    {lsoNavItems.map((item) => (
                      <Link key={item.tab} href={item.href}>
                        <DropdownMenuItem className="cursor-pointer" data-testid={`mobile-nav-lso-${item.tab}`}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                    <DropdownMenuSeparator />
                    <Link href="/mensajes-internos">
                      <DropdownMenuItem className="cursor-pointer" data-testid="mobile-nav-lso-mensajes">
                        <Mail className="mr-2 h-4 w-4" />
                        Mensajes Internos
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3">
                <NotificationBell />
                
                <div className="text-right text-xs hidden lg:block">
                  <p className="font-medium">{user?.fullName || user?.username}</p>
                  <p className="opacity-75 capitalize">{roleLabels[user?.role || 'lso']}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      data-testid="button-user-menu"
                    >
                      <img
                        src={safetyHelmetAvatar}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full border-2 border-white/30"
                      />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user?.fullName || user?.username}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {roleLabels[user?.role || 'lso']}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      className="text-destructive cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border-b">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground capitalize text-xs">{currentDate}</span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30" data-testid="badge-lso-role">
                <User className="mr-1 h-3 w-3" />
                Licenciado en Salud Ocupacional
              </Badge>
            </div>
          </div>
        </div>
      </header>
    );
  }
  // ===== FIN NAVEGACIÓN EXCLUSIVA LSO =====

  return (
    <header className="sticky top-0 z-50 phva-navigation-header">
      {/* Header principal con degradado verde */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SG-SST</h1>
                <p className="text-xs opacity-90">Sistema de Gestión</p>
              </div>
            </div>

            {/* Navegación PHVA - Tabs horizontales (filtrados por permisos) */}
            <nav className="flex items-center gap-1">
              {visiblePhvaTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <DropdownMenu
                    key={tab.key}
                    open={openDropdown === tab.key}
                    onOpenChange={(open) => setOpenDropdown(open ? tab.key : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={activeSection === tab.key ? "secondary" : "ghost"}
                        size="default"
                        className={activeSection === tab.key ? "font-semibold text-primary" : "text-white"}
                        data-testid={`tab-${tab.key}`}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {tab.label}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[240px]" data-testid={`menu-${tab.key}`}>
                      {filteredPhvaMenus[tab.key].map((group, groupIdx) => (
                        <div key={groupIdx}>
                          {group.title && (
                            <DropdownMenuLabel className="text-base font-black text-foreground">{group.title}</DropdownMenuLabel>
                          )}
                          {group.items.filter(item => !item.hidden).map((item) => (
                            <DropdownMenuItem key={item.path} asChild>
                              <Link 
                                href={item.path}
                                data-testid={`link${item.path.replace(/\//g, "-")}`}
                                className={`w-full cursor-pointer ${
                                  location === item.path || location.startsWith(item.path + "/")
                                    ? "font-semibold text-primary" 
                                    : ""
                                }`}
                              >
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          {groupIdx < filteredPhvaMenus[tab.key].length - 1 && <DropdownMenuSeparator />}
                        </div>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}

              {/* Tab PESV separado - Resolución 40595/2022 */}
              {showPesvTab && filteredPesvNavItems.length > 0 && (
                <DropdownMenu
                  open={pesvDropdownOpen}
                  onOpenChange={(open) => setPesvDropdownOpen(open)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isPesvActive ? "secondary" : "ghost"}
                      size="default"
                      className={isPesvActive ? "font-semibold text-primary" : "text-white"}
                      data-testid="tab-pesv"
                    >
                      <Car className="mr-2 h-4 w-4" />
                      PESV
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[240px]" data-testid="menu-pesv">
                    <DropdownMenuLabel className="text-base font-black text-foreground">Plan Estratégico de Seguridad Vial</DropdownMenuLabel>
                    {filteredPesvNavItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          href={item.path}
                          data-testid={`link${item.path.replace(/\//g, "-")}`}
                          className={`w-full cursor-pointer ${
                            location === item.path || location.startsWith(item.path + "/")
                              ? "font-semibold text-primary"
                              : ""
                          }`}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Usuario y controles */}
            <div className="flex items-center gap-4">
              {/* Campana de notificaciones de mensajes internos */}
              <NotificationBell />
              
              
              <div className="text-right text-xs hidden lg:block">
                <p className="font-medium">{user?.username}</p>
                <p className="opacity-80 text-[10px]">{roleLabels[user?.role || "trabajador"]}</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="text-white"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de información - Fecha */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-6 py-2">
          <p className="text-xs text-muted-foreground capitalize" data-testid="text-welcome-info">
            <span className="font-medium">Bienvenido:</span> {user?.username} • {currentDate}
          </p>
        </div>
      </div>

      {/* Diálogo de acceso del proveedor */}
      <ProviderAccessDialog
        open={!!pendingCompanySelection}
        company={pendingCompanySelection}
        onConfirm={handleAccessConfirm}
        onCancel={handleAccessCancel}
      />

    </header>
  );
}
