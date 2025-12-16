import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

interface DatePickerProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    label?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function DatePicker({
    label,
    placeholder,
    value,
    onChange,
    name,
    className,
    disabled,
    type,
    ...props
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(
        value && typeof value === "string" && value !== "" ? new Date(value) : undefined
    )

    React.useEffect(() => {
        if (value && typeof value === "string" && value !== "") {
            setDate(new Date(value))
        } else if (!value || value === "") {
            setDate(undefined)
        }
    }, [value])

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        setOpen(false)

        // Trigger onChange event to work with existing form handling
        if (onChange) {
            const syntheticEvent = {
                target: {
                    name: name || "",
                    value: selectedDate ? selectedDate.toISOString().split('T')[0] : ""
                }
            } as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
        }
    }

    const hasValue = !!date

    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "border-input h-14 w-full min-w-0 rounded-[4px] border bg-transparent px-4 py-2 text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm justify-between font-normal hover:bg-transparent hover:border-input",
                            !hasValue && "text-muted-foreground/60",
                            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                            className
                        )}
                    >
                        <span className={cn(!hasValue && label && "text-[14px]")}>
                            {date ? date.toLocaleDateString() : placeholder || "Select date"}
                        </span>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0 rounded-md border border-input"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        disabled={disabled}
                    />
                </PopoverContent>
            </Popover>

            {label && (
                <label
                    className={cn(
                        "text-muted-foreground pointer-events-none absolute left-2 top-1 -translate-y-1/2 bg-background px-1 text-lg font-regular"
                    )}
                >
                    {label}
                </label>
            )}
        </div>
    )
}

export { DatePicker }