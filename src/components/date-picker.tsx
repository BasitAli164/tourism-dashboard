import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type DatePickerSingleProps = {
  mode: "single";
  selected: Date | undefined;
  onChange: (date: Date | undefined) => void;
};

type DatePickerMultipleProps = {
  mode: "multiple";
  selected: Date[];
  onChange: (dates: Date[]) => void;
};

type DatePickerProps = DatePickerSingleProps | DatePickerMultipleProps;

export const DatePicker = ({ selected, onChange, mode }: DatePickerProps) => {
  // ✅ Define handleSelect with correct type based on mode
  const handleSelect = (date: Date | undefined | Date[]) => {
    if (mode === "multiple") {
      onChange(Array.isArray(date) ? date : []);
    } else {
      onChange(!Array.isArray(date) ? date : undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {mode === "multiple" ? (
            selected.length > 0 ? selected.map((date) => format(date, "PPP")).join(", ") : "Pick dates"
          ) : (
            selected ? format(selected, "PPP") : "Pick a date"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {mode === "multiple" ? (
          <Calendar
            mode="multiple" // ✅ Explicitly set mode
            selected={selected as Date[]}
            onSelect={handleSelect}
            initialFocus
          />
        ) : (
          <Calendar
            mode="single" // ✅ Explicitly set mode
            selected={selected as Date | undefined}
            onSelect={handleSelect}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
