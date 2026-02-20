import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HelpVideo } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, X, Video, Play, BookOpen, MonitorPlay,
  ClipboardList, Hammer, CheckSquare, RefreshCw, Settings, Car
} from "lucide-react";

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "youtu.be" || parsed.hostname.includes("youtube.com");
  } catch {
    return false;
  }
}

function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    return videoExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

function isVimeoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("vimeo.com");
  } catch {
    return false;
  }
}

function toYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) return url;
      if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.replace("/shorts/", "");
      }
      videoId = videoId || parsed.searchParams.get("v");
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } catch {}
  return url;
}

function toVimeoEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  } catch {}
  return url;
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.replace("/shorts/", "");
      }
      return parsed.searchParams.get("v");
    }
  } catch {}
  return null;
}

function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  return null;
}

type CycleKey = "planear" | "hacer" | "verificar" | "actuar" | "administracion" | "pesv" | "general";

const ROUTE_TO_CYCLE: Record<string, CycleKey> = {
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
  "/copasst-evaluaciones": "verificar",
  "/auditorias-internas": "verificar",
  "/informes": "verificar",

  "/dashboard-actuar": "actuar",
  "/revisiones-direccion": "actuar",
  "/recomendaciones-arl": "actuar",

  "/empresas": "administracion",
  "/usuarios": "administracion",
  "/profesionales-licenciados": "administracion",
  "/portal-licenciado": "administracion",
  "/portal-empleados": "administracion",
  "/mi-cuenta": "administracion",
  "/tickets-soporte": "administracion",
  "/mensajes-internos": "administracion",
  "/mi-suscripcion": "administracion",
  "/documentos-legales": "administracion",
  "/directorio-profesionales": "administracion",
};

function getVideoCycle(route: string): CycleKey {
  const cleanRoute = route.split("?")[0].replace(/\/:[\w]+/g, "");
  if (ROUTE_TO_CYCLE[cleanRoute]) return ROUTE_TO_CYCLE[cleanRoute];
  if (route.startsWith("/pesv")) return "pesv";
  if (route.startsWith("/admin-")) return "administracion";
  return "general";
}

const CYCLE_CONFIG: Record<CycleKey, {
  label: string;
  description: string;
  icon: typeof ClipboardList;
  gradient: string;
  iconColor: string;
  badgeClass: string;
  accentBorder: string;
}> = {
  planear: {
    label: "Planear (P)",
    description: "Organizacion, evaluacion y planificacion del SG-SST",
    icon: ClipboardList,
    gradient: "from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    accentBorder: "border-l-blue-500",
  },
  hacer: {
    label: "Hacer (H)",
    description: "Implementacion y ejecucion de controles y actividades",
    icon: Hammer,
    gradient: "from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    accentBorder: "border-l-amber-500",
  },
  verificar: {
    label: "Verificar (V)",
    description: "Seguimiento, medicion, analisis y evaluacion",
    icon: CheckSquare,
    gradient: "from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    accentBorder: "border-l-emerald-500",
  },
  actuar: {
    label: "Actuar (A)",
    description: "Acciones de mejora continua y revision por la direccion",
    icon: RefreshCw,
    gradient: "from-rose-500/10 to-rose-600/5 dark:from-rose-500/20 dark:to-rose-600/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    accentBorder: "border-l-rose-500",
  },
  pesv: {
    label: "PESV - Seguridad Vial",
    description: "Plan Estrategico de Seguridad Vial",
    icon: Car,
    gradient: "from-violet-500/10 to-violet-600/5 dark:from-violet-500/20 dark:to-violet-600/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    accentBorder: "border-l-violet-500",
  },
  administracion: {
    label: "Administracion",
    description: "Configuracion del sistema, usuarios y gestion general",
    icon: Settings,
    gradient: "from-slate-500/10 to-slate-600/5 dark:from-slate-500/20 dark:to-slate-600/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
    accentBorder: "border-l-slate-500",
  },
  general: {
    label: "General",
    description: "Tutoriales generales del sistema",
    icon: BookOpen,
    gradient: "from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10",
    iconColor: "text-primary",
    badgeClass: "bg-primary/10 text-primary dark:bg-primary/20",
    accentBorder: "border-l-primary",
  },
};

const CYCLE_ORDER: CycleKey[] = ["general", "planear", "hacer", "verificar", "actuar", "pesv", "administracion"];

export default function BibliotecaVideos() {
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: videos = [], isLoading } = useQuery<HelpVideo[]>({
    queryKey: ["/api/help-videos"],
  });

  const activeVideos = videos.filter((v) => v.isActive);

  const filteredVideos = search.trim()
    ? activeVideos.filter((video) => {
        const term = search.toLowerCase();
        return (
          video.moduleName.toLowerCase().includes(term) ||
          video.videoTitle.toLowerCase().includes(term)
        );
      })
    : activeVideos;

  function openVideoModal(video: HelpVideo) {
    setSelectedVideo(video);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedVideo(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-6" data-testid="loading-biblioteca">
        <div className="space-y-2">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-full max-w-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (activeVideos.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              Biblioteca de Videos de Ayuda
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            Explore todos los tutoriales disponibles para cada modulo del sistema
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground" data-testid="empty-state-biblioteca">
          <Video className="h-16 w-16 opacity-40" />
          <p className="text-lg font-medium text-foreground">
            No hay videos disponibles aun
          </p>
          <p className="text-sm text-center max-w-md">
            Pronto se agregaran tutoriales para cada modulo del sistema. Vuelva mas tarde para explorar los videos de ayuda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-md bg-gradient-to-r from-primary/8 to-primary/3 dark:from-primary/15 dark:to-primary/5 border border-primary/10 p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              Biblioteca de Videos de Ayuda
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-page-subtitle">
              {activeVideos.length} {activeVideos.length === 1 ? "tutorial disponible" : "tutoriales disponibles"} organizados por ciclo PHVA
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <MonitorPlay className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{activeVideos.length} videos</span>
          </div>
        </div>

        <div className="relative max-w-lg mt-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por modulo o titulo del video..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
            data-testid="input-search-videos"
          />
          {search && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {CYCLE_ORDER.map((cycleKey) => {
        const cycleVideos = filteredVideos.filter(
          (video) => getVideoCycle(video.moduleRoute) === cycleKey
        );
        if (cycleVideos.length === 0) return null;

        const config = CYCLE_CONFIG[cycleKey];
        const CycleIcon = config.icon;

        return (
          <div key={cycleKey} className="space-y-4" data-testid={`section-cycle-${cycleKey}`}>
            <div className={`rounded-md bg-gradient-to-r ${config.gradient} border border-border/50 p-4`}>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`h-9 w-9 rounded-md bg-background flex items-center justify-center border`}>
                  <CycleIcon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold" data-testid={`text-cycle-title-${cycleKey}`}>
                    {config.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                <Badge className={`no-default-hover-elevate no-default-active-elevate ${config.badgeClass} border-0`} data-testid={`badge-count-${cycleKey}`}>
                  {cycleVideos.length} {cycleVideos.length === 1 ? "video" : "videos"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cycleVideos.map((video) => {
                const thumbnail = isYouTubeUrl(video.videoUrl)
                  ? getYouTubeThumbnail(video.videoUrl)
                  : null;

                return (
                  <Card
                    key={video.id}
                    className="hover-elevate cursor-pointer group overflow-visible"
                    onClick={() => openVideoModal(video)}
                    data-testid={`card-video-${video.id}`}
                  >
                    <div className="relative overflow-hidden rounded-t-md bg-muted">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.videoTitle}
                          className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                          <Video className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                          <Play className="h-7 w-7 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm leading-tight mb-1.5" data-testid={`text-card-title-${video.id}`}>
                        {video.moduleName}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-card-description-${video.id}`}>
                        {video.videoTitle}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredVideos.length === 0 && search.trim() && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground" data-testid="empty-search-results">
          <Search className="h-12 w-12 opacity-40" />
          <p className="text-lg font-medium text-foreground">
            Sin resultados
          </p>
          <p className="text-sm text-center max-w-md">
            No se encontraron modulos ni videos que coincidan con "{search}".
          </p>
        </div>
      )}

      {modalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
          data-testid="modal-video-overlay"
        >
          <div
            className="bg-background rounded-md shadow-2xl w-[92vw] max-w-4xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b bg-muted/30">
              <div className="min-w-0 flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Play className="h-4 w-4 text-primary ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate" data-testid="text-modal-video-title">
                    {selectedVideo.videoTitle}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedVideo.moduleName}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={closeModal}
                data-testid="button-close-modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-black">
              <div className="aspect-video w-full">
                {isDirectVideoUrl(selectedVideo.videoUrl) ? (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full rounded-md"
                    controls
                    autoPlay
                    playsInline
                    title={selectedVideo.videoTitle}
                    data-testid="video-player"
                  >
                    Tu navegador no soporta la reproduccion de video.
                  </video>
                ) : isYouTubeUrl(selectedVideo.videoUrl) ? (
                  <iframe
                    src={toYouTubeEmbedUrl(selectedVideo.videoUrl)}
                    className="w-full h-full rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.videoTitle}
                    data-testid="iframe-video-player"
                  />
                ) : isVimeoUrl(selectedVideo.videoUrl) ? (
                  <iframe
                    src={toVimeoEmbedUrl(selectedVideo.videoUrl)}
                    className="w-full h-full rounded-md"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.videoTitle}
                    data-testid="iframe-video-player"
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full rounded-md"
                    controls
                    autoPlay
                    playsInline
                    title={selectedVideo.videoTitle}
                    data-testid="video-player"
                  >
                    Tu navegador no soporta la reproduccion de video.
                  </video>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
