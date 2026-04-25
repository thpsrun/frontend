import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"
import { RevokedReasonCell } from "./revoked-reason-cell"
import type { ApiKeyResponse } from "@/types/api-keys"

type RevokedKeysAccordionProps = {
    keys: ApiKeyResponse[]
}

export function RevokedKeysAccordion({ keys }: RevokedKeysAccordionProps) {
    const [open, setOpen] = useState(false)

    if (keys.length === 0) return null

    return (
        <Panel className="p-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex w-full items-center justify-between px-4 py-3",
                    "text-sm text-left hover:bg-muted/30 transition-colors",
                )}
                aria-expanded={open}
            >
                <span className="flex items-center gap-2">
                    {open
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span>Revoked keys</span>
                    <span className={cn(
                        "rounded-full bg-muted px-2 py-0.5 text-xs",
                        "text-muted-foreground",
                    )}>
                        {keys.length}
                    </span>
                </span>
                <span className="text-xs text-muted-foreground">
                    History only · no actions
                </span>
            </button>

            {open && (
                <div className="border-t border-border/40 opacity-75">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Label</TableHead>
                                <TableHead>Prefix</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Revoked</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.map((k) => (
                                <TableRow key={k.id}>
                                    <TableCell>
                                        <span className="line-through text-muted-foreground">
                                            {k.label}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs text-muted-foreground">
                                            {k.prefix}…
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <RevokedReasonCell reason={k.revoked_reason} />
                                    </TableCell>
                                    <TableCell>
                                        {k.revoked_at
                                            ? new Date(k.revoked_at).toLocaleDateString()
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Panel>
    )
}
