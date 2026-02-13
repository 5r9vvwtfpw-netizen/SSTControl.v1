import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CirclePlay, X } from "lucide-react";
import type { HelpVideo } from "@shared/schema";

export default function HelpVideoButton() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const encodedRoute = encodeURIComponent(location);
  const { data } = useQuery<{ video: HelpVideo | null }>({
    queryKey: [`/api/help-videos/by-route?route=${encodedRoute}`],
    enabled: !!user,
    retry: false,
  });

  const video = data?.video;

  if (!user || !video) return null;

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-20 right-6 z-50 rounded-full shadow-lg"
        onClick={() => setModalOpen(true)}
        data-testid="button-help-video"
        title="Ver video de ayuda"
      >
        <CirclePlay className="h-5 w-5" />
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
                  src={video.videoUrl}
                  className="w-full h-full rounded-md border"
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
