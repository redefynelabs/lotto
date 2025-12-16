"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TimePickerProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string
}

export function TimePicker({ className, label, ...props }: TimePickerProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (inputRef.current) {
      setHasValue(!!inputRef.current.value)
    }
  }, [props.value, props.defaultValue])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    props.onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value)
    props.onChange?.(e)
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="time"
        data-slot="timepicker"
        className={cn(
          "selection:bg-primary selection:text-primary-foreground border-input h-14 w-full min-w-0 rounded-[4px] border bg-transparent px-4 py-2 text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          label
            ? "placeholder:text-[14px] placeholder:text-muted-foreground/60"
            : "placeholder:text-muted-foreground",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />

      {label && (
        <label
          className={cn(
            "text-muted-foreground pointer-events-none absolute left-2 top-0.5 -translate-y-1/2 px-1 text-lg font-regular transition-colors bg-background"
          )}
        >
          {label}
        </label>
      )}
    </div>
  )
}
