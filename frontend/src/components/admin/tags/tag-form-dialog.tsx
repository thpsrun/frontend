import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertBanner } from "@/components/ui/alert-banner"
import {
    validateTagName,
    validateTagDescription,
} from "@/lib/validation"
import { ApiError } from "@/lib/api-client"
import { useCreateTag } from "@/hooks/guides/useCreateTag"
import { useUpdateTag } from "@/hooks/guides/useUpdateTag"
import type { Tag } from "@/types/guides"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    mode: "create" | "edit"
    tag: Tag | null
}

export function TagFormDialog({ open, onOpenChange, mode, tag }: Props) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [errors, setErrors] = useState<{ name?: string; description?: string; top?: string }>({})

    const create = useCreateTag()
    const update = useUpdateTag()

    useEffect(() => {
        if (open) {
            setName(tag?.name ?? "")
            setDescription(tag?.description ?? "")
            setErrors({})
        }
    }, [open, tag])

    async function onSubmit() {
        const nameErr = validateTagName(name)
        const descErr = validateTagDescription(description)
        if (nameErr || descErr) {
            setErrors({ name: nameErr ?? undefined, description: descErr ?? undefined })
            return
        }
        setErrors({})
        try {
            if (mode === "create") {
                await create.mutateAsync({ name: name.trim(), description: description.trim() })
                toast.success("Tag created.")
            } else if (tag) {
                await update.mutateAsync({
                    slug: tag.slug,
                    data: { name: name.trim(), description: description.trim() },
                })
                toast.success("Tag updated.")
            }
            onOpenChange(false)
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Save failed."
            setErrors({ top: msg })
        }
    }

    const isPending = create.isPending || update.isPending

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "New tag" : "Edit tag"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {errors.top && <AlertBanner variant="error">{errors.top}</AlertBanner>}
                    <div className="space-y-1.5">
                        <Label htmlFor="tag-name">Name</Label>
                        <Input
                            id="tag-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    {mode === "edit" && tag && (
                        <div className="space-y-1.5">
                            <Label>Slug</Label>
                            <Input value={tag.slug} disabled className="font-mono" />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="tag-description">Description</Label>
                        <Textarea
                            id="tag-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
