import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

type AlertBannerVariant = "error" | "success"

interface AlertBannerProps {
    variant: AlertBannerVariant
    children: ReactNode
    className?: string
}

const variantStyles: Record<AlertBannerVariant, string> = {
    error: "bg-destructive/10 border-destructive/20 text-destructive",
    success: "bg-success/10 border-success/20 text-success",
}

export function AlertBanner({
    variant,
    children,
    className,
}: AlertBannerProps) {
    return (
        <div
            className={cn(
                "rounded-md border px-4 py-3 text-sm",
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </div>
    )
}
