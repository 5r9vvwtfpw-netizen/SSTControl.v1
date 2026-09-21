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