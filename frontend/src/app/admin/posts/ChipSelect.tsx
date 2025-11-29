"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";

type Item = { id: string; name: string };

export default function ChipSelect({
  title,
  items,
  selectedIds,
  onChange,
  buttonLabel,
  variant = "outline",
}: {
  title: string;
  items: Item[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  buttonLabel: string;
  variant?: "outline" | "secondary";
}) {
  return (
    <div className="space-y-2">
      <div className="font-medium">{title}</div>
      <div className="flex flex-wrap gap-2">
        {selectedIds.map((id) => {
          const it = items.find((x) => x.id === id);
          if (!it) return null;
          return (
            <Badge key={id} variant={variant} className="flex items-center gap-1">
              {it.name}
              <button type="button" onClick={() => onChange(selectedIds.filter((x) => x !== id))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">{buttonLabel}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            {items.map((it) => {
              const checked = selectedIds.includes(it.id);
              return (
                <button
                  key={it.id}
                  className={`w-full text-left px-2 py-1 rounded ${checked ? "bg-accent" : "hover:bg-muted"}`}
                  onClick={() => onChange(checked ? selectedIds.filter((x) => x !== it.id) : [...selectedIds, it.id])}
                >
                  {it.name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}