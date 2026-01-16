import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface ArrayInputProps {
  label: string;
  value: string[];
  onChange: (newArray: string[]) => void;
  placeholder: string;
  testId: string;
}

export function ArrayInput({ label, value, onChange, placeholder, testId }: ArrayInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.some(item => item.localeCompare(trimmedValue, 'es', { sensitivity: 'accent' }) === 0)) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          data-testid={`input-${testId}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          data-testid={`button-add-${testId}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => removeItem(index)}
            data-testid={`button-remove-${testId}-${index}`}
          >
            {item} ×
          </Badge>
        ))}
      </div>
    </div>
  );
}
