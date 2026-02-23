import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CirclePlay, X, Clock } from "lucide-react";
import type { HelpVideo } from "@shared/schema";

const EXCLUDED_ROUTES = [
  "/auth",
  "/login",
  "/registro",
  "/recuperar-contrasena",
  "/restablecer-contrasena",
  "/checkout",
  "/demo/verify",
  "/demo-verify",
  "/induccion-virtual",
  "/politica-privacidad",
  "/terminos-servicio",
  "/acuerdo-procesamiento-datos",
  "/pricing",
  "/planes",
  "/welcome",
  "/soporte",
  "/documentos-legales",
  "/dashboard-hacer",
  "/dashboard-verificar",
  "/dashboard-actuar",
  "/pesv",
  "/aviso-privacidad",
  "/politica-cookies",
  "/contrato-saas",
];

const EXCLUDED_ROUTE_PATTERNS: RegExp[] = [];

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
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.replace("/shorts/", "");
      }
      videoId = videoId || parsed.searchParams.get("v");
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {}
  return url;
}

function toVimeoEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch {}
  return url;
}

interface HelpVideoButtonProps {
  customRoute?: string;
  label?: string;
  testId?: string;
}

export default function HelpVideoButton({ customRoute, label, testId }: HelpVideoButtonProps = {}) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const isExcluded = !customRoute && (EXCLUDED_ROUTES.some(
    (route) => location === route || location.startsWith(route + "/")
  ) || EXCLUDED_ROUTE_PATTERNS.some((pattern) => pattern.test(location)));

  const routeForLookup = customRoute || location;
  const encodedRoute = encodeURIComponent(routeForLookup);
  const { data } = useQuery<{ video: HelpVideo | null }>({
    queryKey: ["/api/help-videos/by-route", encodedRoute],
    queryFn: async () => {
      const res = await fetch(`/api/help-videos/by-route?route=${encodedRoute}`);
      if (!res.ok) throw new Error("Failed to fetch help video");
      return res.json();
    },
    enabled: !!user && !isExcluded,
    retry: false,
  });

  const video = data?.video;

  if (!user || isExcluded) return null;

  const hasVideo = !!video;
  const buttonLabel = label || "Video de Ayuda";
  const buttonTestId = testId || "button-help-video";

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        data-testid={buttonTestId}
        title={hasVideo ? `Ver ${buttonLabel.toLowerCase()}` : `${buttonLabel} próximamente`}
        className="gap-2 bg-orange-500 text-gray-800 border-orange-500 dark:bg-orange-600 dark:border-orange-600 dark:text-gray-800"
      >
        <CirclePlay className="h-4 w-4" />
        {buttonLabel}
      </Button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
          onClick={() => setModalOpen(false)}
          data-testid="modal-help-video-overlay"
        >
          <div
            className="bg-background rounded-md shadow-xl w-[90vw] max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <h2 className="text-lg font-semibold truncate" data-testid="text-help-video-title">
                {hasVideo ? video.videoTitle : "Video de Ayuda"}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                data-testid="button-close-help-video"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {hasVideo ? (
                <div className="aspect-video w-full">
                  {isDirectVideoUrl(video.videoUrl) ? (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full rounded-md border bg-black"
                      controls
                      autoPlay
                      playsInline
                      title={video.videoTitle}
                      data-testid="video-help-video"
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  ) : isYouTubeUrl(video.videoUrl) ? (
                    <iframe
                      src={toYouTubeEmbedUrl(video.videoUrl)}
                      className="w-full h-full rounded-md border"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.videoTitle}
                      data-testid="iframe-help-video"
                    />
                  ) : isVimeoUrl(video.videoUrl) ? (
                    <iframe
                      src={toVimeoEmbedUrl(video.videoUrl)}
                      className="w-full h-full rounded-md border"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={video.videoTitle}
                      data-testid="iframe-help-video"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full rounded-md border bg-black"
                      controls
                      autoPlay
                      playsInline
                      title={video.videoTitle}
                      data-testid="video-help-video"
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
                  <Clock className="h-16 w-16 text-amber-500/50" />
                  <p className="text-lg font-medium text-foreground">
                    Video próximamente
                  </p>
                  <p className="text-sm text-center max-w-md">
                    Estamos preparando el video tutorial para este módulo. Pronto estará disponible para ayudarte paso a paso.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
