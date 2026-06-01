import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-4 select-none w-full", className)}
      classNames={{
        months:        "flex flex-col",
        month:         "w-full",
        month_caption: "flex items-center justify-between mb-4 px-1",
        caption_label: "text-sm font-semibold text-slate-700 capitalize",
        nav:           "flex items-center gap-1",
        button_previous: cn(
          "h-7 w-7 rounded-lg border border-slate-200 bg-white",
          "flex items-center justify-center text-slate-500",
          "hover:bg-slate-50 hover:text-slate-700 transition-all",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        ),
        button_next: cn(
          "h-7 w-7 rounded-lg border border-slate-200 bg-white",
          "flex items-center justify-center text-slate-500",
          "hover:bg-slate-50 hover:text-slate-700 transition-all",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        ),
        month_grid:  "w-full border-collapse",
        weekdays:    "flex w-full mb-1",
        weekday:     "flex-1 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide pb-2",
        week:        "flex w-full",
        day:         "flex-1 flex items-center justify-center p-0.5",
        day_button: cn(
          "w-8 h-8 rounded-lg text-xs font-medium text-slate-600 w-full",
          "flex items-center justify-center transition-all duration-150",
          "hover:bg-blue-50 hover:text-blue-600"
        ),
        selected:  "[&>button]:!bg-blue-600 [&>button]:!text-white [&>button]:shadow-sm [&>button]:font-semibold",
        today:     "[&>button]:font-bold [&>button]:text-blue-600",
        outside:   "[&>button]:text-slate-200 [&>button]:pointer-events-none",
        disabled:  "[&>button]:!text-slate-200 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
        hidden:    "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft  className="h-3.5 w-3.5" />
            : <ChevronRight className="h-3.5 w-3.5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
