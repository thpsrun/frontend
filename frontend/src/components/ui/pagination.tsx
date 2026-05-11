import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalLabel?: ReactNode
    className?: string
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalLabel,
    className,
}: Props) {
    if (totalPages <= 1) return null

    return (
        <div className={cn(
            "flex items-center justify-between pt-4 text-sm",
            className,
        )}>
            <span className="text-muted-foreground">
                {totalLabel}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    aria-label="Previous page"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    size="sm"
                    variant="outline"
                    aria-label="Next page"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}
