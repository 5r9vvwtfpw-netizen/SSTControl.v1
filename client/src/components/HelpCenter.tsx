import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  HelpCircle, X, Search, BookOpen, Video, Lightbulb,
  ChevronRight, ExternalLink, Zap, Shield, Users,
  ClipboardList, BarChart3, AlertTriangle, CheckSquare,
  Star, ArrowRight, MapPin, Rocket
} from "lucide-react";

const MODULE_TIPS: Record<string, { title: string; description: string; tips: string[]; icon: any; color: string }> = {
  "/dashboard": {
    title: "Panel Principal",
    description: "Tu centro de comando SST. Aquí ves el estado de todo el sistema de un vistazo.",
    tips: ["El semáforo de colores indica el nivel de cumplimiento PHVA", "Haz clic en cada tarjeta para ir directamente al módulo", "Los indicadores se actualizan en tiempo real"],
    icon: BarChart3, color: "from-green-600 to-emerald-700"
  },
  "/trabajadores": {
    title: "Trabajadores",
    description: "Gestiona el talento humano de tu empresa con todos los requisitos legales.",
    tips: ["Puedes importar trabajadores masivamente desde Excel", "Asigna cargos para activar el perfil sociodemográfico", "El semáforo de documentos te avisa vencimientos"],
    icon: Users, color: "from-blue-600 to-blue-700"
  },
  "/capacitaciones": {
    title: "Capacitaciones SST",
    description: "Programa y registra todas las capacitaciones exigidas por Resolución 0312/2019.",
    tips: ["Invita trabajadores directamente desde el formulario", "Los trabajadores confirman desde su portal", "Descarga la lista de asistencia en PDF con firmas"],
    icon: BookOpen, color: "from-green-600 to-teal-700"
  },
  "/pesv": {
    title: "Plan Estratégico de Seguridad Vial",
    description: "Gestiona el PESV conforme a Resolución 40595/2022 con sus 24 pasos.",
    tips: ["Navega por las fases P-H-V-A en orden", "Cada paso tiene criterios de evidencia descargables", "El puntaje se calcula automáticamente al completar"],
    icon: Shield, color: "from-orange-600 to-amber-700"
  },
  "/accidentes": {
    title: "Accidentes e Incidentes",
    description: "Registra y analiza eventos de trabajo para cumplir con el reporte obligatorio.",
    tips: ["El FURAT se genera automáticamente en PDF", "Vincula con investigación de accidentes", "Los indicadores de accidentalidad se actualizan solos"],
    icon: AlertTriangle, color: "from-red-600 to-rose-700"
  },
  "/evaluaciones-sst": {
    title: "Evaluaciones SST",
    description: "Evalúa el cumplimiento de los 62 estándares mínimos de Resolución 0312/2019.",
    tips: ["Comienza con la evaluación inicial del año", "Cada estándar tiene documentos de evidencia adjuntables", "El informe al Ministerio del Trabajo se genera con un clic"],
    icon: CheckSquare, color: "from-violet-600 to-purple-700"
  },
  "/iperc": {
    title: "Matriz IPERC",
    description: "Identifica, valora y controla los riesgos laborales según GTC-45.",
    tips: ["Clasifica por proceso y actividad", "El nivel de riesgo se calcula por fórmula automática", "Vincula controles con el plan de trabajo anual"],
    icon: ClipboardList, color: "from-yellow-600 to-amber-700"
  },
};

const QUICK_ACTIONS: Record<string, { label: string; path: string; icon: any }[]> = {
  admin: [
    { label: "Agregar trabajador", path: "/trabajadores", icon: Users },
    { label: "Nueva capacitación", path: "/capacitaciones", icon: BookOpen },
    { label: "Evaluación SST", path: "/evaluaciones-sst", icon: CheckSquare },
    { label: "Registrar accidente", path: "/accidentes", icon: AlertTriangle },
  ],
  trabajador: [
    { label: "Mis capacitaciones", path: "/portal/capacitaciones", icon: BookOpen },
    { label: "Mi perfil", path: "/portal/perfil", icon: Users },
  ],
  lso: [
    { label: "Mis empresas", path: "/lso/empresas", icon: Shield },
    { label: "Evaluaciones", path: "/lso/evaluaciones", icon: CheckSquare },
  ],
};

const DAILY_TIPS = [
  "Resolución 0312/2019 exige al menos 20 horas de capacitación SST por año por trabajador.",
  "Los accidentes de trabajo deben reportarse a la ARL dentro de los 2 días hábiles siguientes.",
  "El COPASST debe reunirse al menos una vez al mes en empresas con 10 o más trabajadores.",
  "La evaluación inicial del SG-SST debe realizarse anualmente antes del 31 de enero.",
  "Los exámenes médicos periódicos son obligatorios según el perfil de riesgo del cargo.",
  "El plan de trabajo anual SST debe estar aprobado por la alta dirección.",
  "Los EPP deben registrarse con firma del trabajador como evidencia de entrega.",
  "El PESV es obligatorio para empresas con flota de 10 o más vehículos.",
];

function getModuleInfo(path: string) {
  const exact = MODULE_TIPS[path];
  if (exact) return exact;
  for (const key of Object.keys(MODULE_TIPS)) {
    if (path.startsWith(key) && key !== "/") return MODULE_TIPS[key];
  }
  return null;
}

function getTodayTip() {
  const day = new Date().getDay();
  return DAILY_TIPS[day % DAILY_TIPS.length];
}

export function HelpCenter() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pulse, setPulse] = useState(true);

  const moduleInfo = getModuleInfo(location);
  const tipOfDay = getTodayTip();

  const { data: helpVideos = [] } = useQuery<any[]>({
    queryKey: ["/api/help-videos"],
    enabled: !!user && open,
  });

  const { data: contextVideo } = useQuery<any>({
    queryKey: ["/api/help-videos/by-route", location],
    queryFn: () =>
      fetch(`/api/help-videos/by-route?route=${encodeURIComponent(location)}`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null),
    enabled: !!user && open,
  });

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  if (!user) return null;

  const role = user.role as string;
  const quickActions = QUICK_ACTIONS[role] || QUICK_ACTIONS["admin"] || [];

  const allModules = Object.entries(MODULE_TIPS).map(([path, info]) => ({
    path,
    name: info.title,
    description: info.description,
  }));

  const filtered = search.trim()
    ? allModules.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-24 right-5 z-[9998] flex flex-col items-end gap-2">
        {!open && pulse && (
          <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 animate-bounce whitespace-nowrap">
            Centro de Ayuda
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          data-testid="button-help-center-open"
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          aria-label="Abrir Centro de Ayuda"
        >
          {pulse && (
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
          )}
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Centro de Ayuda</p>
              <p className="text-green-100 text-xs">SG-SST Colombia</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            data-testid="button-help-center-close"
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar módulo o función..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
              data-testid="input-help-search"
            />
          </div>
          {/* Resultados de búsqueda */}
          {filtered.length > 0 && (
            <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg">
              {filtered.map(m => (
                <button
                  key={m.path}
                  onClick={() => { navigate(m.path); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{m.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {search.trim() && filtered.length === 0 && (
            <p className="mt-2 text-xs text-slate-500 text-center py-2">Sin resultados para "{search}"</p>
          )}
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">

          {/* Módulo actual */}
          {moduleInfo && !search && (
            <div className={`rounded-xl bg-gradient-to-br ${moduleInfo.color} p-4 text-white`}>
              <div className="flex items-center gap-2 mb-1">
                <moduleInfo.icon className="w-4 h-4" />
                <Badge className="bg-white/20 text-white border-0 text-xs">Estás aquí</Badge>
              </div>
              <p className="font-bold text-sm mb-1">{moduleInfo.title}</p>
              <p className="text-xs text-white/80 mb-3">{moduleInfo.description}</p>
              <div className="space-y-1.5">
                {moduleInfo.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Zap className="w-3 h-3 mt-0.5 shrink-0 text-yellow-300" />
                    <p className="text-xs text-white/90">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video contextual */}
          {contextVideo && !search && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Video tutorial</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-2">{contextVideo.videoTitle}</p>
                <a
                  href={contextVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-medium hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver video
                </a>
              </div>
            </div>
          )}

          {/* Tip del día */}
          {!search && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">Sabías que...</p>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">{tipOfDay}</p>
            </div>
          )}

          {/* Accesos rápidos */}
          {!search && quickActions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Acciones rápidas</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(a.path); setOpen(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-center"
                    data-testid={`button-quick-action-${i}`}
                  >
                    <a.icon className="w-4 h-4 text-green-700 dark:text-green-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explorar módulos */}
          {!search && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Explorar módulos</p>
              <div className="space-y-1.5">
                {Object.entries(MODULE_TIPS).map(([path, info]) => (
                  <button
                    key={path}
                    onClick={() => { navigate(path); setOpen(false); }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group"
                    data-testid={`button-module-${path.replace(/\//g, "-")}`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center shrink-0`}>
                      <info.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{info.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{info.description.slice(0, 50)}...</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-green-600 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Normativa de referencia */}
          {!search && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Marco normativo</p>
              </div>
              <div className="space-y-1">
                {[
                  "Resolución 0312/2019 — Estándares Mínimos SG-SST",
                  "Decreto 1072/2015 — Reglamento del Sector Trabajo",
                  "ISO 45001:2018 — Seguridad y Salud en el Trabajo",
                  "Resolución 40595/2022 — PESV",
                ].map((norm, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 mt-0.5 text-green-600 shrink-0" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">{norm}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            SG-SST Colombia v4.0 — SAGDI S.A.S.
          </p>
        </div>
      </div>
    </>
  );
}
