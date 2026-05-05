import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

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
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <div className="flex gap-1.5 pt-1">
                                <Skeleton className="h-4 w-12 rounded-full" />
                                <Skeleton className="h-4 w-16 rounded-full" />
                            </div>
                        </div>
                    </TableCell>
                    {showGameColumn && (
                        <TableCell>
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </TableCell>
                    )}
                    <TableCell>
                        <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    )
}
