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

  const response = await fetch(requestUrl.toString(), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = `No fue posible descargar el informe (${response.status}).`;
    if (response.headers.get("content-type")?.includes("application/json")) {
      const body = await response.json().catch(() => null);
      message = body?.message || body?.error || message;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
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
}