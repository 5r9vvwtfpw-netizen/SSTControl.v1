import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HelpVideo } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlay, Search, X, Clock, Video, Play } from "lucide-react";

const MODULE_LIST = [
  { route: "/", name: "Inicio", group: "SST" },
  { route: "/dashboard", name: "Dashboard", group: "SST" },
  { route: "/trabajadores", name: "Trabajadores", group: "SST" },
  { route: "/perfiles-cargo", name: "Perfiles de Cargo", group: "SST" },
  { route: "/asignacion-recursos", name: "Asignacion de Recursos", group: "SST" },
  { route: "/designacion-responsable", name: "Designacion del Responsable", group: "SST" },
  { route: "/asignar-lso-externo", name: "Asignar LSO Externo", group: "SST" },
  { route: "/capacitaciones", name: "Capacitaciones", group: "SST" },
  { route: "/programa-capacitacion-anual", name: "Programa de Capacitacion Anual", group: "SST" },
  { route: "/curso-50-horas", name: "Curso 50 Horas SST", group: "SST" },
  { route: "/configuracion-induccion", name: "Configuracion de Induccion", group: "SST" },
  { route: "/inspecciones", name: "Inspecciones", group: "SST" },
  { route: "/accidentes", name: "Accidentes e Incidentes", group: "SST" },
  { route: "/investigacion-accidentes", name: "Investigacion de Accidentes", group: "SST" },
  { route: "/arbol-causas", name: "Arbol de Causas", group: "SST" },
  { route: "/examenes-medicos", name: "Examenes Medicos", group: "SST" },
  { route: "/afiliaciones-ssss", name: "Afiliaciones SSSS", group: "SST" },
  { route: "/trabajadores-alto-riesgo", name: "Trabajadores de Alto Riesgo", group: "SST" },
  { route: "/entrega-epp", name: "Entrega de EPP", group: "SST" },
  { route: "/medidas", name: "Medidas Preventivas", group: "SST" },
  { route: "/salud", name: "Salud Ocupacional", group: "SST" },
  { route: "/vigilancia-epidemiologica", name: "Vigilancia Epidemiologica", group: "SST" },
  { route: "/perfil-sociodemografico", name: "Perfil Sociodemografico", group: "SST" },
  { route: "/actividades-promocion-prevencion", name: "Actividades de Promocion y Prevencion", group: "SST" },
  { route: "/estilos-vida-saludable", name: "Estilos de Vida Saludable", group: "SST" },
  { route: "/conservacion-auditiva", name: "Conservacion Auditiva", group: "SST" },
  { route: "/mediciones-ambientales", name: "Mediciones Ambientales", group: "SST" },
  { route: "/sustancias-quimicas", name: "Sustancias Quimicas", group: "SST" },
  { route: "/ausentismo-laboral", name: "Ausentismo Laboral", group: "SST" },
  { route: "/estandares-sst", name: "Estandares SST", group: "SST" },
  { route: "/evaluaciones-sst", name: "Evaluaciones SST", group: "SST" },
  { route: "/iperc", name: "IPERC - Matriz de Riesgos", group: "SST" },
  { route: "/politicas-sst", name: "Politicas SST", group: "SST" },
  { route: "/plan-emergencias", name: "Plan de Emergencias", group: "SST" },
  { route: "/planes-trabajo-anual", name: "Planes de Trabajo Anual", group: "SST" },
  { route: "/objetivos-sst", name: "Objetivos SST", group: "SST" },
  { route: "/indicadores-accidentalidad", name: "Indicadores de Accidentalidad", group: "SST" },
  { route: "/matriz-legal", name: "Matriz Legal", group: "SST" },
  { route: "/auditorias-internas", name: "Auditorias Internas", group: "SST" },
  { route: "/revisiones-direccion", name: "Revision por la Direccion", group: "SST" },
  { route: "/recomendaciones-arl", name: "Recomendaciones ARL", group: "SST" },
  { route: "/evaluacion-proveedores", name: "Evaluacion de Proveedores", group: "SST" },
  { route: "/gestion-cambios", name: "Gestion de Cambios", group: "SST" },
  { route: "/adquisiciones-sst", name: "Adquisiciones SST", group: "SST" },
  { route: "/comunicacion-sst", name: "Comunicacion SST", group: "SST" },
  { route: "/copasst-gestion", name: "COPASST - Gestion", group: "SST" },
  { route: "/capacitacion-copasst", name: "Capacitacion COPASST", group: "SST" },
  { route: "/copasst-cms", name: "COPASST - CMS", group: "SST" },
  { route: "/copasst-evaluaciones", name: "Evaluaciones 360 COPASST", group: "SST" },
  { route: "/comite-convivencia-actas", name: "Comite de Convivencia - Actas", group: "SST" },
  { route: "/partes-interesadas", name: "Partes Interesadas", group: "SST" },
  { route: "/analisis-contexto", name: "Analisis de Contexto", group: "SST" },
  { route: "/plan-mejoramiento-contexto", name: "Plan de Mejoramiento (Contexto)", group: "SST" },
  { route: "/conservacion-documentos", name: "Conservacion de Documentos", group: "SST" },
  { route: "/informes", name: "Informes", group: "SST" },
  { route: "/portal-empleados", name: "Portal del Empleado", group: "SST" },
  { route: "/mensajes-internos", name: "Mensajes Internos", group: "SST" },
  { route: "/tickets-soporte", name: "Tickets de Soporte", group: "SST" },
  { route: "/mi-suscripcion", name: "Mi Suscripcion", group: "SST" },
  { route: "/mi-cuenta", name: "Mi Cuenta", group: "SST" },
  { route: "/empresas", name: "Gestion de Empresas", group: "Administracion" },
  { route: "/usuarios", name: "Gestion de Usuarios", group: "Administracion" },
  { route: "/profesionales-licenciados", name: "Profesionales Licenciados", group: "Administracion" },
  { route: "/portal-licenciado", name: "Portal del Licenciado", group: "Administracion" },
  { route: "/pesv", name: "PESV - Panel Principal", group: "PESV" },
  { route: "/pesv/vehiculos", name: "PESV - Vehiculos", group: "PESV" },
  { route: "/pesv/conductores", name: "PESV - Conductores", group: "PESV" },
  { route: "/pesv/inspecciones", name: "PESV - Inspecciones Vehiculares", group: "PESV" },
  { route: "/pesv/siniestros", name: "PESV - Siniestros Viales", group: "PESV" },
  { route: "/pesv/capacitaciones", name: "PESV - Capacitaciones Viales", group: "PESV" },
  { route: "/pesv/auditorias", name: "PESV - Auditorias", group: "PESV" },
  { route: "/pesv/evaluaciones", name: "PESV - Evaluaciones", group: "PESV" },
  { route: "/pesv/mantenimiento", name: "PESV - Mantenimiento Vehicular", group: "PESV" },
  { route: "/pesv/monitoreo-gps", name: "PESV - Monitoreo GPS", group: "PESV" },
  { route: "/pesv/rutas-seguras", name: "PESV - Rutas Seguras", group: "PESV" },
  { route: "/pesv/matriz-riesgos", name: "PESV - Matriz de Riesgos Viales", group: "PESV" },
  { route: "/pesv/contexto-organizacional", name: "PESV - Contexto Organizacional", group: "PESV" },
  { route: "/pesv/indicadores", name: "PESV - Indicadores", group: "PESV" },
  { route: "/pesv/factores-desempeno", name: "PESV - Factores de Desempeno", group: "PESV" },
  { route: "/pesv/comite", name: "PESV - Comite de Seguridad Vial", group: "PESV" },
  { route: "/pesv/liderazgo", name: "PESV - Liderazgo y Compromiso", group: "PESV" },
  { route: "/pesv/mejora-continua", name: "PESV - Mejora Continua", group: "PESV" },
  { route: "/pesv/revision-direccion", name: "PESV - Revision por la Direccion", group: "PESV" },
];

const ADMIN_ROUTES = ["/empresas", "/usuarios", "/profesionales-licenciados", "/portal-licenciado"];

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

function getModuleGroup(route: string): string {
  if (ADMIN_ROUTES.includes(route)) return "Administracion";
  if (route.startsWith("/pesv")) return "PESV";
  return "SST";
}

interface VideoCardItem {
  moduleName: string;
  moduleRoute: string;
  video: HelpVideo | null;
}

export default function BibliotecaVideos() {
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: videos = [], isLoading } = useQuery<HelpVideo[]>({
    queryKey: ["/api/help-videos"],
  });

  const activeVideos = videos.filter((v) => v.isActive);

  const videoMap = new Map<string, HelpVideo>();
  for (const v of activeVideos) {
    videoMap.set(v.moduleRoute, v);
  }

  const allCards: VideoCardItem[] = MODULE_LIST.map((mod) => ({
    moduleName: mod.name,
    moduleRoute: mod.route,
    video: videoMap.get(mod.route) || null,
  }));

  const filteredCards = search.trim()
    ? allCards.filter((card) => {
        const term = search.toLowerCase();
        return (
          card.moduleName.toLowerCase().includes(term) ||
          (card.video?.videoTitle?.toLowerCase().includes(term) ?? false)
        );
      })
    : allCards;

  const groups = ["SST", "PESV", "Administracion"] as const;

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
      <div className="space-y-6 p-6" data-testid="loading-biblioteca">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (activeVideos.length === 0 && videos.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Biblioteca de Videos de Ayuda
          </h1>
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">
          Biblioteca de Videos de Ayuda
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          Explore todos los tutoriales disponibles para cada modulo del sistema
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por modulo o titulo del video..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
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

      {groups.map((group) => {
        const groupCards = filteredCards.filter(
          (card) => getModuleGroup(card.moduleRoute) === group
        );
        if (groupCards.length === 0) return null;

        const videosInGroup = groupCards.filter((c) => c.video !== null).length;
        const groupLabel =
          group === "SST"
            ? "Modulos SST"
            : group === "PESV"
              ? "Modulos PESV"
              : "Modulos Administracion";

        return (
          <div key={group} className="space-y-4" data-testid={`section-group-${group}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold" data-testid={`text-group-title-${group}`}>
                {groupLabel}
              </h2>
              <Badge variant="secondary" data-testid={`badge-count-${group}`}>
                {videosInGroup} / {groupCards.length} videos
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupCards.map((card) => {
                const hasVideo = card.video !== null;
                return (
                  <Card
                    key={card.moduleRoute}
                    className="hover-elevate cursor-pointer"
                    onClick={() => hasVideo && card.video && openVideoModal(card.video)}
                    data-testid={`card-module-${card.moduleRoute}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                      <CardTitle className="text-base" data-testid={`text-card-title-${card.moduleRoute}`}>
                        {card.moduleName}
                      </CardTitle>
                      {hasVideo ? (
                        <CirclePlay className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                      )}
                    </CardHeader>
                    <CardContent>
                      {hasVideo && card.video ? (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground" data-testid={`text-card-description-${card.moduleRoute}`}>
                            {card.video.videoTitle}
                          </p>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(card.video!);
                            }}
                            data-testid={`button-play-${card.moduleRoute}`}
                          >
                            <Play className="h-4 w-4" />
                            Ver video
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground" data-testid={`text-proximamente-${card.moduleRoute}`}>
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Proximamente</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredCards.length === 0 && search.trim() && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground" data-testid="empty-search-results">
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
          onClick={closeModal}
          data-testid="modal-video-overlay"
        >
          <div
            className="bg-background rounded-md shadow-xl w-[90vw] max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <h2 className="text-lg font-semibold truncate" data-testid="text-modal-video-title">
                {selectedVideo.videoTitle}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={closeModal}
                data-testid="button-close-modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="aspect-video w-full">
                {isDirectVideoUrl(selectedVideo.videoUrl) ? (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full rounded-md border bg-black"
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
                    className="w-full h-full rounded-md border"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.videoTitle}
                    data-testid="iframe-video-player"
                  />
                ) : isVimeoUrl(selectedVideo.videoUrl) ? (
                  <iframe
                    src={toVimeoEmbedUrl(selectedVideo.videoUrl)}
                    className="w-full h-full rounded-md border"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.videoTitle}
                    data-testid="iframe-video-player"
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full rounded-md border bg-black"
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
