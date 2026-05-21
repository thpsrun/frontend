import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { useDeleteSocial } from "@/hooks/admin/useNavbarAdmin"
import type { NavbarAdminSocial } from "@/types/admin-navbar"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    link: NavbarAdminSocial | null
}

export function DeleteSocialDialog({ open, onOpenChange, link }: Props) {
    const del = useDeleteSocial()

    if (!link) return null

    const handleConfirm = async () => {
        await del.mutateAsync(link.id)
    }

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete social link"
            description={(
                <>
                    Type <strong>{link.platform}</strong> to confirm.
                    This removes the social link from the navbar.
                </>
            )}
            confirmPhrase={link.platform}
            confirmLabel="Delete link"
            inputLabel="Type the platform name"
            isPending={del.isPending}
            onConfirm={handleConfirm}
        />
    )
}
