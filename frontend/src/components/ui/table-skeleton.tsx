import { Skeleton } from "@/components/ui/skeleton"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TableSkeletonProps {
    columns: number
    rows?: number
    headers?: string[]
    className?: string
}

export function TableSkeleton({
    columns,
    rows = 6,
    headers,
    className,
}: TableSkeletonProps) {
    const headerLabels = headers ?? Array(columns).fill("")
    return (
        <div className={cn(
            "rounded-md border border-border/40 overflow-hidden",
            className,
        )}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/20">
                        {headerLabels.map((label, i) => (
                            <TableHead
                                key={i}
                                className="text-center"
                            >
                                {label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <TableRow
                            key={rowIdx}
                            className={rowIdx % 2 === 1 ? "bg-muted/10" : ""}
                        >
                            {Array.from({ length: columns }).map((__, colIdx) => (
                                <TableCell key={colIdx}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
