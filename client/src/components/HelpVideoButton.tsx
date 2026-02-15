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
];

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

export default function HelpVideoButton() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const isExcluded = EXCLUDED_ROUTES.some(
    (route) => location === route || location.startsWith(route + "/")
  );

  const encodedRoute = encodeURIComponent(location);
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

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        data-testid="button-help-video"
        title={hasVideo ? "Ver video de ayuda" : "Video de ayuda próximamente"}
        className="gap-2 bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700"
      >
        <CirclePlay className="h-4 w-4" />
        Video de Ayuda
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
                  <iframe
                    src={toYouTubeEmbedUrl(video.videoUrl)}
                    className="w-full h-full rounded-md border"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.videoTitle}
                    data-testid="iframe-help-video"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
                  <Clock className="h-16 w-16 text-emerald-500/50" />
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
