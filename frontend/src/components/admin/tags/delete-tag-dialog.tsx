import { toast } from "sonner"
import {
    ConfirmDeleteDialog,
} from "@/components/ui/confirm-delete-dialog"
import { useDeleteTag } from "@/hooks/guides/useDeleteTag"
import type { Tag } from "@/types/guides"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    tag: Tag | null
}

export function DeleteTagDialog({ open, onOpenChange, tag }: Props) {
    const del = useDeleteTag()

    if (!tag) return null

    const handleConfirm = async () => {
        await del.mutateAsync(tag.slug)
        toast.success("Tag deleted.")
    }

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete tag"
            description={(
                <>
                    Type <strong>{tag.name}</strong> to confirm.
                    This will remove the tag from any guides using it.
                </>
            )}
            confirmPhrase={tag.name}
            confirmLabel="Delete tag"
            inputLabel="Type the tag name"
            isPending={del.isPending}
            onConfirm={handleConfirm}
        />
    )
}
