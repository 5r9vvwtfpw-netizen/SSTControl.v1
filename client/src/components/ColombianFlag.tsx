/**
 * Componente de Bandera de Colombia
 * Conforme a Ley 12 de 1984 y Decreto 1967 de 1991
 * 
 * Artículo 2, Ley 12/1984: La bandera tiene tres franjas horizontales:
 * - Amarillo (superior): 50% del alto total
 * - Azul (centro): 25% del alto total  
 * - Rojo (inferior): 25% del alto total
 * 
 * Colores oficiales según normativa colombiana
 */

interface ColombianFlagProps {
  className?: string;
  width?: number;
  height?: number;
  showBorder?: boolean;
}

export function ColombianFlag({ 
  className = "", 
  width = 48, 
  height = 32,
  showBorder = true 
}: ColombianFlagProps) {
  return (
    <svg 
      viewBox="0 0 6 4" 
      width={width} 
      height={height}
      className={className}
      role="img"
      aria-label="Bandera de Colombia"
      data-testid="icon-colombian-flag"
    >
      <title>Bandera de la República de Colombia - Ley 12/1984</title>
      <desc>
        Bandera nacional de Colombia con tres franjas horizontales: 
        amarillo (50% superior), azul (25% centro), rojo (25% inferior).
        Conforme a Ley 12 de 1984 y Decreto 1967 de 1991.
      </desc>
      
      {/* Franja amarilla - 50% del alto (0 a 2 de 4 unidades) */}
      <rect 
        x="0" 
        y="0" 
        width="6" 
        height="2" 
        fill="#FCD116"
        data-testid="flag-stripe-yellow"
      />
      
      {/* Franja azul - 25% del alto (2 a 3 de 4 unidades) */}
      <rect 
        x="0" 
        y="2" 
        width="6" 
        height="1" 
        fill="#003893"
        data-testid="flag-stripe-blue"
      />
      
      {/* Franja roja - 25% del alto (3 a 4 de 4 unidades) */}
      <rect 
        x="0" 
        y="3" 
        width="6" 
        height="1" 
        fill="#CE1126"
        data-testid="flag-stripe-red"
      />
      
      {/* Borde opcional para mejor visualización en fondos claros */}
      {showBorder && (
        <rect 
          x="0" 
          y="0" 
          width="6" 
          height="4" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.05"
          strokeOpacity="0.2"
        />
      )}
    </svg>
  );
}

export function ColombianFlagBadge({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md ${className}`}
      data-testid="badge-colombian-flag"
    >
      <ColombianFlag width={24} height={16} showBorder={false} />
      <span className="text-sm font-medium text-muted-foreground">Colombia</span>
    </div>
  );
}

export default ColombianFlag;
