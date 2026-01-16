import { useQuery } from "@tanstack/react-query";

interface DashboardPrintLayoutProps {
  title: string;
  documentCode: string;
  version?: string;
  children: React.ReactNode;
}

export function DashboardPrintLayout({ 
  title, 
  documentCode, 
  version = "1.0",
  children 
}: DashboardPrintLayoutProps) {
  const { data: company } = useQuery<{
    id: string;
    name: string;
    nit: string;
    address: string | null;
    logoUrl: string | null;
  }>({
    queryKey: ["/api/company/current"],
  });

  const currentDate = new Date().toLocaleDateString('es-CO');

  return (
    <div className="dashboard-print-wrapper">
      {/* Print Header - Only visible when printing */}
      <div className="print-header">
        <div className="print-header-content">
          {/* Logo and Company Info */}
          <div className="print-header-left">
            <div className="print-logo">
              {company?.logoUrl ? (
                <img 
                  src={company.logoUrl} 
                  alt="Logo empresa" 
                  className="print-logo-img"
                />
              ) : (
                <div className="print-logo-placeholder">LOGO</div>
              )}
            </div>
            <div className="print-company-info">
              <div className="print-company-name">{company?.name || 'Empresa'}</div>
              <div className="print-company-nit">NIT: {company?.nit || 'N/A'}</div>
              {company?.address && (
                <div className="print-company-address">{company.address}</div>
              )}
            </div>
          </div>

          {/* Document Info Table */}
          <div className="print-doc-info-table">
            <div className="print-doc-info-row">
              <div className="print-doc-info-label">Código:</div>
              <div className="print-doc-info-value">{documentCode}</div>
            </div>
            <div className="print-doc-info-row">
              <div className="print-doc-info-label">Versión:</div>
              <div className="print-doc-info-value">{version}</div>
            </div>
            <div className="print-doc-info-row">
              <div className="print-doc-info-label">Fecha:</div>
              <div className="print-doc-info-value">{currentDate}</div>
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="print-document-title">{title}</div>
      </div>

      {/* Dashboard Content */}
      <div className="print-content">
        {children}
      </div>

      {/* Print Footer - Only visible when printing */}
      <div className="print-footer">
        <div className="print-signatures-table">
          <div className="print-signature-col">
            <div className="print-signature-header">ELABORÓ</div>
            <div className="print-signature-name">Coordinador SST</div>
          </div>
          <div className="print-signature-col">
            <div className="print-signature-header">AUTORIZÓ</div>
            <div className="print-signature-name">Sistema SG-SST</div>
          </div>
          <div className="print-signature-col">
            <div className="print-signature-header">APROBÓ</div>
            <div className="print-signature-name">Gerencia</div>
          </div>
        </div>
      </div>
    </div>
  );
}
