"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
}

export function Input({ className, type, label, placeholder, ...props }: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const isBidPage = pathname.startsWith("/bid")

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

  const showPlaceholder = !hasValue

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type={type}
        data-slot="input"
        className={cn(
          "  border-input  h-14 w-full min-w-0 rounded-[4px] border bg-transparent px-4 py-2 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:text-sm file:font-normal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  isBidPage
    ? "autofill:bg-transparent autofill:shadow-[inset_0_0_0px_1000px_white] autofill:text-black"
    : "autofill:bg-transparent autofill:shadow-[inset_0_0_0px_1000px_#FFFAF4] autofill:text-black",

          label
            ? "placeholder:text-[14px] placeholder:text-muted-foreground/60"
            : "placeholder:text-muted-foreground",
          "aria-invalid:ring-destructive/20 ",
          className
        )}
        placeholder={showPlaceholder ? placeholder : ""}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />

      {label && (
        <label
          className={cn(
            "text-muted-foreground pointer-events-none absolute left-2 top-0.5 -translate-y-1/2 px-1 text-lg font-regular transition-colors",
            isBidPage ? "bg-white" : "bg-background" 
          )}
        >
          {label}
        </label>
      )}
    </div>
  )
}
