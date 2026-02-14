import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CirclePlay, X } from "lucide-react";
import type { HelpVideo } from "@shared/schema";

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

  const encodedRoute = encodeURIComponent(location);
  const { data } = useQuery<{ video: HelpVideo | null }>({
    queryKey: ["/api/help-videos/by-route", encodedRoute],
    queryFn: async () => {
      const res = await fetch(`/api/help-videos/by-route?route=${encodedRoute}`);
      if (!res.ok) throw new Error("Failed to fetch help video");
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  const video = data?.video;

  if (!user || !video) return null;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setModalOpen(true)}
        data-testid="button-help-video"
        title="Ver video de ayuda"
        className="gap-2"
      >
        <CirclePlay className="h-4 w-4 text-red-500" />
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
                {video.videoTitle}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
