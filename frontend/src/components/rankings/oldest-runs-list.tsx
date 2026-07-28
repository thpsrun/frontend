import { Trophy } from "lucide-react"

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Panel } from "@/components/ui/panel"
import { EmptyState } from "@/components/common/empty-state"

import { cn } from "@/lib/utils"
import {
    formatLongDate,
    RunPlayers,
} from "@/lib/leaderboard-helpers"

import type { OldestRun } from "@/types/api"


interface OldestRunsListProps {
    runs: OldestRun[]
}

export const OldestRunsList = ({ runs }: OldestRunsListProps) => {
    if (runs.length === 0) {
        return (
            <EmptyState
                icon={Trophy}
                title="No oldest IL world records available."
            />
        )
    }

    return (
        <Panel className="p-0 overflow-hidden">
            <div className={cn(
                "px-4 py-3 border-b border-border/40",
                "text-sm font-semibold",
            )}>
                Oldest Standing IL WRs
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/20">
                        <TableHead className="w-12 pl-4">
                            #
                        </TableHead>
                        <TableHead>
                            Player
                        </TableHead>
                        <TableHead>
                            Level
                        </TableHead>
                        <TableHead className="text-center">
                            Time
                        </TableHead>
                        <TableHead className="text-center">
                            Days
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {runs.map((r, idx) => (
                        <OldestRunRow
                            key={`${r.player.name}-${r.category_name}-${r.level_name ?? ""}`}
                            run={r}
                            idx={idx}
                        />
                    ))}
                </TableBody>
            </Table>
        </Panel>
    )
}


const OldestRunRow = (
    { run, idx }: { run: OldestRun; idx: number },
) => {
    const dateLabel = run.date
        ? formatLongDate(run.date)
        : "Date unknown"
    const daysLabel = run.days_held >= 0
        ? run.days_held.toLocaleString()
        : "?"

    return (
        <TableRow className={cn(
            "transition hover:bg-muted/30",
            idx % 2 === 1 ? "bg-muted/10" : "",
        )}>
            <TableCell className={cn(
                "pl-4 text-xs text-muted-foreground",
                "font-mono tabular-nums",
            )}>
                {idx + 1}
            </TableCell>
            <TableCell className="text-sm">
                <RunPlayers players={[run.player]} />
            </TableCell>
            <TableCell className="text-xs">
                <div className="text-foreground">
                    {run.level_name}
                </div>
                <div className="text-muted-foreground">
                    {run.category_name}
                </div>
            </TableCell>
            <TableCell className={cn(
                "text-center font-mono",
                "tabular-nums tracking-tight text-sm",
            )}>
                {run.time}
            </TableCell>
            <TableCell
                title={dateLabel}
                className={cn(
                    "text-center font-mono",
                    "tabular-nums text-sm font-semibold",
                    "cursor-help",
                )}
            >
                {daysLabel}
            </TableCell>
        </TableRow>
    )
}
