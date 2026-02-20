import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HelpVideo } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlay, Search, X, Video, Play } from "lucide-react";

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

function getVideoGroup(route: string): string {
  if (route.startsWith("/pesv")) return "PESV";
  const adminRoutes = ["/empresas", "/usuarios", "/profesionales-licenciados", "/portal-licenciado", "/admin-"];
  if (adminRoutes.some(r => route.startsWith(r))) return "Administracion";
  return "SST";
}

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

  if (activeVideos.length === 0) {
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
          {activeVideos.length} {activeVideos.length === 1 ? "tutorial disponible" : "tutoriales disponibles"} para los modulos del sistema
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
        const groupVideos = filteredVideos.filter(
          (video) => getVideoGroup(video.moduleRoute) === group
        );
        if (groupVideos.length === 0) return null;

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
                {groupVideos.length} {groupVideos.length === 1 ? "video" : "videos"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupVideos.map((video) => (
                <Card
                  key={video.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => openVideoModal(video)}
                  data-testid={`card-video-${video.id}`}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <CardTitle className="text-base" data-testid={`text-card-title-${video.id}`}>
                      {video.moduleName}
                    </CardTitle>
                    <CirclePlay className="h-5 w-5 text-primary shrink-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground" data-testid={`text-card-description-${video.id}`}>
                        {video.videoTitle}
                      </p>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideoModal(video);
                        }}
                        data-testid={`button-play-${video.id}`}
                      >
                        <Play className="h-4 w-4" />
                        Ver video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {filteredVideos.length === 0 && search.trim() && (
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
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate" data-testid="text-modal-video-title">
                  {selectedVideo.videoTitle}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedVideo.moduleName}
                </p>
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
