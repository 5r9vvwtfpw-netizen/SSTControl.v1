import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildHeaders } from "@/lib/queryClient";

export function EvidenceFileInput({
  companyId,
  value,
  label,
  onUploaded,
}: {
  companyId?: string | null;
  value?: string | null;
  label: string;
  onUploaded: (objectPath: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    if (!companyId) {
      setError("Selecciona una empresa activa antes de adjuntar el soporte.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("category", "evidencias");
      form.append("companyId", companyId);
      const response = await fetch("/api/upload-proxy", {
        method: "POST",
        credentials: "include",
        headers: buildHeaders(),
        body: form,
      });
      const data = await response.json();
      if (!response.ok || typeof data.objectPath !== "string") {
        throw new Error(data.error || "No se pudo cargar el soporte.");
      }
      onUploaded(data.objectPath);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el soporte.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
      {uploading && <p className="text-xs text-muted-foreground">Cargando archivo…</p>}
      {value?.startsWith("uploads/") ? <Button asChild size="sm" variant="outline" className="h-auto p-1"><a href={`/objects/${value}`} target="_blank" rel="noreferrer">Abrir soporte adjunto</a></Button> : value && <p className="text-xs text-muted-foreground">Referencia: {value}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
