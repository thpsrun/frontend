import { useEffect, useMemo, useState } from "react"
import type { SyntheticEvent } from "react"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertBanner } from "@/components/common/alert-banner"
import {
    validateNavItemName,
    validateNavUrl,
} from "@/lib/validation"
import { getErrorMessage } from "@/lib/utils"
import {
    useCreateNavItem,
    useUpdateNavItem,
} from "@/hooks/admin/useNavbarAdmin"
import type { NavbarAdminItem } from "@/types/admin-navbar"

import { MAX_NAV_DEPTH } from "./nav-tree-row"

const ROOT_VALUE = "__root"

interface ParentOption {
    id: number
    label: string
    depth: number
}

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    mode: "create" | "edit"
    item: NavbarAdminItem | null
    defaultParentId: number | null
    items: NavbarAdminItem[]
}

interface DepthEntry {
    item: NavbarAdminItem
    depth: number
}

function flattenWithDepth(
    items: NavbarAdminItem[],
    depth = 0,
): DepthEntry[] {
    return items.flatMap((item) => [
        { item, depth },
        ...flattenWithDepth(item.children, depth + 1),
    ])
}

function getDescendantIds(item: NavbarAdminItem): Set<number> {
    const ids = new Set<number>([item.id])
    for (const c of item.children) {
        for (const id of getDescendantIds(c)) ids.add(id)
    }
    return ids
}

export function NavItemFormDialog({
    open,
    onOpenChange,
    mode,
    item,
    defaultParentId,
    items,
}: Props) {
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [parentId, setParentId] = useState<number | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [errors, setErrors] = useState<{
        name?: string
        url?: string
        top?: string
    }>({})

    const create = useCreateNavItem()
    const update = useUpdateNavItem()

    useEffect(() => {
        if (open) {
            setErrors({})
            if (mode === "edit" && item) {
                setName(item.name)
                setUrl(item.url ?? "")
                setParentId(item.parent_id)
                setIsVisible(item.is_visible)
            } else {
                setName("")
                setUrl("")
                setParentId(defaultParentId)
                setIsVisible(true)
            }
        }
    }, [open, mode, item, defaultParentId])

    const parentOptions: ParentOption[] = useMemo(() => {
        const flat = flattenWithDepth(items)
        const excluded = mode === "edit" && item
            ? getDescendantIds(item)
            : new Set<number>()
        return flat
            .filter(({ item: i, depth }) => {
                if (excluded.has(i.id)) return false
                return depth < MAX_NAV_DEPTH
            })
            .map(({ item: i, depth }) => ({
                id: i.id,
                depth,
                label: `${"  ".repeat(depth)}${i.name}`,
            }))
    }, [items, item, mode])

    async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        const nameErr = validateNavItemName(name)
        const urlErr = validateNavUrl(url)
        if (nameErr || urlErr) {
            setErrors({
                name: nameErr ?? undefined,
                url: urlErr ?? undefined,
            })
            return
        }
        setErrors({})

        const trimmedUrl = url.trim()
        const urlValue = trimmedUrl.length === 0 ? null : trimmedUrl

        try {
            if (mode === "create") {
                await create.mutateAsync({
                    name: name.trim(),
                    url: urlValue,
                    parent_id: parentId,
                    is_visible: isVisible,
                })
            } else if (item) {
                await update.mutateAsync({
                    itemId: item.id,
                    body: {
                        name: name.trim(),
                        url: urlValue,
                        parent_id: parentId,
                        is_visible: isVisible,
                    },
                })
            }
            onOpenChange(false)
        } catch (err) {
            setErrors({ top: getErrorMessage(err, "Save Failed...") })
        }
    }

    const isPending = create.isPending || update.isPending

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!isPending) onOpenChange(v)
            }}
        >
            <DialogContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create" ? "New Nav Item" : "Edit Nav Item"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        {errors.top && (
                            <AlertBanner variant="error">{errors.top}</AlertBanner>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="nav-name">Name</Label>
                            <Input
                                id="nav-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                autoFocus
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nav-url">
                                URL{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="nav-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="/games or https://example.com"
                                maxLength={500}
                                className="font-mono"
                            />
                            {errors.url ? (
                                <p className="text-sm text-destructive">
                                    {errors.url}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for a parent-only menu (groups children without linking).
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nav-parent">Parent</Label>
                            <Select
                                value={
                                    parentId === null
                                        ? ROOT_VALUE
                                        : String(parentId)
                                }
                                onValueChange={(v) =>
                                    setParentId(v === ROOT_VALUE ? null : Number(v))
                                }
                            >
                                <SelectTrigger
                                    id="nav-parent"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ROOT_VALUE}>
                                        (Top level)
                                    </SelectItem>
                                    {parentOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.id}
                                            value={String(opt.id)}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Items can nest up to 3 levels deep.
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2">
                            <div>
                                <Label
                                    htmlFor="nav-visible"
                                    className="cursor-pointer"
                                >
                                    Visible on Navbar
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Hidden items stay configured but do not render for visitors.
                                </p>
                            </div>
                            <Switch
                                id="nav-visible"
                                checked={isVisible}
                                onCheckedChange={setIsVisible}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !name.trim()}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
