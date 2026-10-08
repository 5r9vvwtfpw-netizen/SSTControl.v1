import { getSelectedCompanyId } from "./queryClient";

/**
 * Adds the selected company context to a document URL opened in a new tab.
 *
 * New-tab navigations cannot carry the X-Company-Id header used by fetch/apiRequest,
 * so LSO document routes must receive the context as a query parameter. The server
 * validates that the current professional is actively assigned to that company.
 */
export function withCompanyContext(path: string, companyId: string): string {
  if (!companyId) {
    throw new Error("companyId es requerido para abrir un documento contextual");
  }

  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(query);

  params.set("companyId", companyId);
  return `${pathname}?${params.toString()}${hash}`;
}

/**
 * Adds the active company context to a document URL when one is selected.
 * Regular company users can omit it because the server resolves their own company
 * from the authenticated account.
 */
export function withActiveCompanyContext(path: string, companyId?: string | null): string {
  if (!path.startsWith("/api/")) return path;
  const activeCompanyId = companyId || getSelectedCompanyId();
  return activeCompanyId ? withCompanyContext(path, activeCompanyId) : path;
}

/** Open a company-scoped document in a new tab without dropping tenant context. */
export function openCompanyDocument(path: string, companyId?: string | null): Window | null {
  if (typeof window === "undefined") return null;
  return window.open(withActiveCompanyContext(path, companyId), "_blank", "noopener,noreferrer");
}