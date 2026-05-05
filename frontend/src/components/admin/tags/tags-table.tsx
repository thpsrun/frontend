import { useState } from "react"
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"
import type { Tag } from "@/types/guides"

interface Props {
    tags: Tag[]
    onEdit: (tag: Tag) => void
    onDelete: (tag: Tag) => void
}

export function TagsTable({ tags, onEdit, onDelete }: Props) {
    const [asc, setAsc] = useState(true)
    const sorted = [...tags].sort((a, b) =>
        asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    )

    return (
        <Panel className="overflow-hidden p-0">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/20">
                        <TableHead>
                            <button
                                type="button"
                                onClick={() => setAsc((v) => !v)}
                                className="flex items-center gap-1 hover:text-foreground"
                            >
                                Tag
                                {asc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                            </button>
                        </TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map((t, idx) => (
                        <TableRow
                            key={t.slug}
                            className={cn(
                                "transition hover:bg-muted/30",
                                idx % 2 === 1 ? "bg-muted/10" : "",
                            )}
                        >
                            <TableCell>
                                <div className="font-semibold">{t.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {t.description}
                                </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{t.slug}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onEdit(t)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(t)}
                                            className="text-destructive"
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Panel>
    )
}
