import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertBanner } from "@/components/ui/alert-banner"
import { useDeleteTag } from "@/hooks/guides/useDeleteTag"
import { ApiError } from "@/lib/api-client"
import type { Tag } from "@/types/guides"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    tag: Tag | null
}

export function DeleteTagDialog({ open, onOpenChange, tag }: Props) {
    const del = useDeleteTag()
    const [phrase, setPhrase] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setPhrase("")
            setError(null)
        }
    }, [open])

    if (!tag) return null

    const matches = phrase.trim() === tag.name.trim()

    async function onConfirm() {
        setError(null)
        try {
            await del.mutateAsync(tag!.slug)
            toast.success("Tag deleted.")
            onOpenChange(false)
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "Delete failed.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!del.isPending) onOpenChange(v) }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete tag</DialogTitle>
                    <DialogDescription>
                        Type <strong>{tag.name}</strong> to confirm. This will remove the tag
                        from any guides using it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <Label htmlFor="delete-tag-input">Type the tag name</Label>
                    <Input
                        id="delete-tag-input"
                        value={phrase}
                        onChange={(e) => setPhrase(e.target.value)}
                        autoComplete="off"
                    />
                    {error && <AlertBanner variant="error">{error}</AlertBanner>}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={del.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={!matches || del.isPending}
                    >
                        {del.isPending ? "Deleting..." : "Delete tag"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
