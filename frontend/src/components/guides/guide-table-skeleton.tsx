import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Props {
    rows?: number
    showGameColumn?: boolean
}

export function GuideTableSkeleton({ rows = 5, showGameColumn = true }: Props) {
    return (
        <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <div className="space-y-2">
                            <Bar className="h-4 w-3/4" />
                            <Bar className="h-3 w-1/2" />
                            <div className="flex gap-1.5 pt-1">
                                <Bar className="h-4 w-12 rounded-full" />
                                <Bar className="h-4 w-16 rounded-full" />
                            </div>
                        </div>
                    </TableCell>
                    {showGameColumn && (
                        <TableCell>
                            <Bar className="h-5 w-24 rounded-full" />
                        </TableCell>
                    )}
                    <TableCell>
                        <Bar className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                        <Bar className="h-4 w-16" />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    )
}

function Bar({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse rounded bg-muted/40", className)} />
    )
}
