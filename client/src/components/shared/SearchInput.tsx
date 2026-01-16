import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

/**
 * Componente reutilizable para barra de búsqueda
 * Mantiene consistencia en la interfaz de búsqueda
 */
export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  testId = "input-search"
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        data-testid={testId}
      />
    </div>
  );
}
