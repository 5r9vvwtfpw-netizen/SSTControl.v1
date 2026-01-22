import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { CIE10_OPTIONS, CIE10_CATALOG } from "@/data/cie10-colombia";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

interface Cie10AutocompleteFieldProps<T extends FieldValues = any> {
  codeField: ControllerRenderProps<T, any>;
  diagnosisField: ControllerRenderProps<T, any>;
}

export function Cie10AutocompleteField<T extends FieldValues = any>({
  codeField,
  diagnosisField,
}: Cie10AutocompleteFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedCode = (codeField.value || "") as string;
  const selectedDiagnosis = (diagnosisField.value || "") as string;

  const filteredOptions = CIE10_OPTIONS.filter((option) =>
    option.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    option.diagnosis.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (code: string) => {
    const diagnosis = CIE10_CATALOG[code] || "";
    codeField.onChange(code);
    diagnosisField.onChange(diagnosis);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    codeField.onChange("");
    diagnosisField.onChange("");
    setSearchValue("");
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            data-testid="button-cie10-selector"
          >
            {selectedCode
              ? `${selectedCode} - ${selectedDiagnosis.substring(0, 35)}${
                  selectedDiagnosis.length > 35 ? "..." : ""
                }`
              : "Seleccionar código CIE-10"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar código o diagnóstico..."
              value={searchValue}
              onValueChange={setSearchValue}
              data-testid="input-cie10-search"
            />
            <CommandEmpty>No se encontró ningún código CIE-10.</CommandEmpty>
            <CommandList className="max-h-[300px]">
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.code}
                    value={option.code}
                    onSelect={() => handleSelect(option.code)}
                    data-testid={`item-cie10-${option.code.replace(".", "-")}`}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 flex-shrink-0 ${
                        selectedCode === option.code ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-semibold text-sm">{option.code}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {option.diagnosis}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCode && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-mono">
            {selectedCode}
          </Badge>
          <Badge variant="outline" className="text-xs max-w-sm truncate">
            {selectedDiagnosis}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 hover:bg-destructive/10"
            data-testid="button-clear-cie10"
            title="Limpiar selección"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
