export interface DownloadReportOptions {
  url: string;
  filename: string;
  companyId?: string | null;
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  const filenameMatch = header.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? null;
}

/**
 * Downloads a protected report while preserving the active tenant context.
 * The companyId query parameter is only sent for users allowed to select a
 * company; the server remains the source of truth for authorization.
 */
export async function downloadAuthenticatedReport({
  url,
  filename,
  companyId,
}: DownloadReportOptions): Promise<string> {
  const requestUrl = new URL(url, window.location.origin);
  if (companyId) requestUrl.searchParams.set("companyId", companyId);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `No fue posible descargar el informe (${response.status}).`;
      if (response.headers.get("content-type")?.includes("application/json")) {
        const body = await response.json().catch(() => null);
        message = body?.message || body?.error || message;
      }
      throw new Error(message);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/pdf")) {
      throw new Error("El servidor no devolvió un archivo PDF válido.");
    }

    const blob = await response.blob();
    const signature = await blob.slice(0, 5).text();
    const trailer = await blob.slice(Math.max(0, blob.size - 1024)).text();
    if (blob.size === 0 || signature !== "%PDF-" || !trailer.includes("%%EOF")) {
      throw new Error("El informe quedó incompleto y no se descargó. Intente nuevamente.");
    }

    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const resolvedFilename = filenameFromDisposition(response.headers.get("content-disposition")) || filename;
    link.href = objectUrl;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
    return resolvedFilename;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La generación tardó más de 60 segundos y fue cancelada. Intente nuevamente.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}