"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  options: DropdownOption[]
  label?: string
}

export function Dropdown({
  value,
  onChange,
  placeholder = "Select an option",
  options,
  label,
  className,
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  const hasValue = !!selectedOption

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative w-full" {...props}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={cn(
          "file:text-foreground selection:bg-primary selection:text-primary-foreground border-input h-14 w-full min-w-0 rounded-[4px] border bg-transparent px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-normal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex items-center justify-between",
          label ? "placeholder:text-[14px] placeholder:text-muted-foreground/60" : "placeholder:text-muted-foreground",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      >
        <span className={cn(
          "text-base",
          hasValue ? "text-foreground" : "text-muted-foreground"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {label && (
        <label
          className={cn(
            "text-muted-foreground pointer-events-none absolute left-2 top-0.5 -translate-y-1/2 px-1 text-lg font-regular transition-colors bg-background"
          )}
        >
          {label}
        </label>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-[4px] shadow-md z-50">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full text-left px-4 py-2 text-base transition-colors hover:bg-primary/10",
                  value === option.value && "bg-primary/20 text-primary font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
