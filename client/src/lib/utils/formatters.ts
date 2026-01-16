/**
 * Utilidades de formateo compartidas para todo el sistema SST Colombia
 * Centraliza operaciones comunes de formato para evitar duplicación
 */

/**
 * Formatea un número como moneda colombiana (COP)
 */
export const formatPrice = (price: number): string => 
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

/**
 * Formatea un número como moneda (alias de formatPrice)
 */
export const formatCurrency = formatPrice;

/**
 * Formatea una fecha a formato largo en español colombiano
 * Maneja correctamente fechas YYYY-MM-DD como fechas locales (sin offset UTC)
 */
export const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  
  let date: Date;
  
  // Si es string en formato YYYY-MM-DD (sin hora), tratarlo como fecha local
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number);
    date = new Date(year, month - 1, day); // month es 0-indexed
  } else {
    // Para ISO strings con timezone o objetos Date
    date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  }
  
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatea una fecha a formato corto (DD/MM/YYYY)
 * Maneja correctamente fechas YYYY-MM-DD como fechas locales (sin offset UTC)
 */
export const formatDateShort = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  
  let date: Date;
  
  // Si es string en formato YYYY-MM-DD (sin hora), tratarlo como fecha local
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number);
    date = new Date(year, month - 1, day); // month es 0-indexed
  } else {
    // Para ISO strings con timezone o objetos Date
    date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  }
  
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Formatea una fecha con hora
 * Maneja correctamente fechas YYYY-MM-DD como fechas locales (sin offset UTC)
 */
export const formatDateTime = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  
  let date: Date;
  
  // Si es string en formato YYYY-MM-DD (sin hora), tratarlo como fecha local
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number);
    date = new Date(year, month - 1, day); // month es 0-indexed
  } else {
    // Para ISO strings con timezone o objetos Date
    date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  }
  
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (num: number): string => 
  new Intl.NumberFormat('es-CO').format(num);

/**
 * Formatea un porcentaje
 */
export const formatPercentage = (value: number, decimals: number = 1): string => 
  `${value.toFixed(decimals)}%`;

/**
 * Formatea bytes a tamaño legible (KB, MB, GB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Obtiene la fecha actual en zona horaria de Colombia (America/Bogota) en formato YYYY-MM-DD
 * Resuelve el problema de desfase de un día cuando se usa new Date().toISOString() en horarios nocturnos
 * El formato 'en-CA' devuelve YYYY-MM-DD que es compatible con inputs type="date"
 */
export const getTodayDateString = (): string => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
};
