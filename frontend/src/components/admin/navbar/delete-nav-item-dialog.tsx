import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { useDeleteNavItem } from "@/hooks/admin/useNavbarAdmin"
import type { NavbarAdminItem } from "@/types/admin-navbar"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    item: NavbarAdminItem | null
}

export function DeleteNavItemDialog({ open, onOpenChange, item }: Props) {
    const del = useDeleteNavItem()

    if (!item) return null

    const handleConfirm = async () => {
        await del.mutateAsync(item.id)
    }

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete nav item"
            description={(
                <>
                    Type <strong>{item.name}</strong> to confirm.
                    This removes the item from the navbar.
                </>
            )}
            confirmPhrase={item.name}
            confirmLabel="Delete item"
            inputLabel="Type the item name"
            isPending={del.isPending}
            onConfirm={handleConfirm}
        />
    )
}
