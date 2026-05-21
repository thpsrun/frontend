import {
    ConfirmDeleteDialog,
} from "@/components/common/confirm-delete-dialog"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    guideTitle: string
    onConfirm: () => Promise<void>
    isPending: boolean
}

export function DeleteGuideDialog({
    open,
    onOpenChange,
    guideTitle,
    onConfirm,
    isPending,
}: Props) {
    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete guide"
            description="This permanently deletes the guide from the database. To confirm, type the guide's title below."
            confirmPhrase={guideTitle}
            confirmLabel="Delete guide"
            isPending={isPending}
            onConfirm={onConfirm}
        />
    )
}
