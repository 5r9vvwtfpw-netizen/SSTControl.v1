import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: number | string | undefined | null;
  onChange: (value: number | undefined) => void;
  prefix?: string;
}

function formatWithThousandSeparators(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  if (!cleanValue) return "";
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseFormattedValue(formattedValue: string): number | undefined {
  const cleanValue = formattedValue.replace(/\./g, "");
  const num = parseInt(cleanValue, 10);
  return isNaN(num) ? undefined : num;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, prefix = "$", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(() => {
      if (value === undefined || value === null || value === "") return "";
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (isNaN(numValue)) return "";
      return formatWithThousandSeparators(numValue.toString());
    });

    React.useEffect(() => {
      if (value === undefined || value === null || value === "") {
        setDisplayValue("");
        return;
      }
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (isNaN(numValue)) {
        setDisplayValue("");
        return;
      }
      const formatted = formatWithThousandSeparators(numValue.toString());
      if (parseFormattedValue(displayValue) !== numValue) {
        setDisplayValue(formatted);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(prefix, "").trim();
      
      const onlyNumbers = rawValue.replace(/\D/g, "");
      
      if (onlyNumbers === "") {
        setDisplayValue("");
        onChange(undefined);
        return;
      }

      const formatted = formatWithThousandSeparators(onlyNumbers);
      setDisplayValue(formatted);
      
      const numericValue = parseFormattedValue(formatted);
      onChange(numericValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Home",
        "End",
      ];
      
      if (allowedKeys.includes(e.key)) return;
      
      if (e.ctrlKey || e.metaKey) return;
      
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {prefix}
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn("pl-7", className)}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
