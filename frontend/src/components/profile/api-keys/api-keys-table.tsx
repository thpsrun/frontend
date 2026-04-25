import { useMemo } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScopeSummary } from "./scope-summary"
import { relativeTimeFrom } from "./relative-time"
import type { ApiKeyResponse } from "@/types/api-keys"

function formatExpiry(iso: string | null): {
    text: string
    nearExpiry: boolean
} {
    if (!iso) return { text: "Never", nearExpiry: false }
    const then = new Date(iso)
    const now = new Date()
    const diffDays = Math.round(
        (then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (diffDays < 0) return { text: "Expired", nearExpiry: false }
    if (diffDays <= 30) return { text: `${diffDays} days`, nearExpiry: true }
    return { text: then.toLocaleDateString(), nearExpiry: false }
}

type ApiKeysTableProps = {
    keys: ApiKeyResponse[]
    onEdit: (apiKey: ApiKeyResponse) => void
    onRevoke: (apiKey: ApiKeyResponse) => void
}

export function ApiKeysTable({ keys, onEdit, onRevoke }: ApiKeysTableProps) {
    const sorted = useMemo(
        () =>
            [...keys].sort(
                (a, b) =>
                    new Date(b.created).getTime() - new Date(a.created).getTime(),
            ),
        [keys],
    )

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Prefix</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-12" />
                </TableRow>
            </TableHeader>
            <TableBody>
                {sorted.map((k) => {
                    const expiry = formatExpiry(k.expiry_date)
                    return (
                        <TableRow key={k.id}>
                            <TableCell className="max-w-xs whitespace-normal">
                                <div className="font-medium">{k.label}</div>
                                <ScopeSummary
                                    scopeCapabilities={k.scope_capabilities}
                                    scopeGames={k.scope_games}
                                />
                            </TableCell>
                            <TableCell>
                                <code className="text-xs text-muted-foreground">
                                    {k.prefix}…
                                </code>
                            </TableCell>
                            <TableCell>
                                {k.last_used ? (
                                    <>
                                        <div>{relativeTimeFrom(k.last_used)}</div>
                                        {k.last_used_ip && (
                                            <code className="text-[10px] text-muted-foreground">
                                                from {k.last_used_ip}
                                            </code>
                                        )}
                                    </>
                                ) : (
                                    <span className="italic text-muted-foreground">
                                        Never Used
                                    </span>
                                )}
                            </TableCell>
                            <TableCell
                                className={cn(
                                    expiry.nearExpiry && "text-amber-500",
                                )}
                            >
                                {expiry.text}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" aria-label="Key actions">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(k)}>
                                            <Pencil className="h-3.5 w-3.5 mr-2" />
                                            Edit Label & Description
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onRevoke(k)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                            Revoke Key
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
