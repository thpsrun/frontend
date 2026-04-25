import {
    useUnsavedChangesGuard,
} from "@/hooks/useUnsavedChangesGuard"
import {
    UnsavedChangesDialog,
} from "@/components/profile/unsaved-changes-dialog"

interface UnsavedChangesGuardProps {
    isDirty: boolean
    onSave: () => Promise<void>
    onDiscard: () => void
    isSaving?: boolean
}

export function UnsavedChangesGuard({
    isDirty,
    onSave,
    onDiscard,
    isSaving,
}: UnsavedChangesGuardProps) {
    const {
        isBlocked,
        handleSave,
        handleDiscard,
        handleCancel,
    } = useUnsavedChangesGuard({
        isDirty,
        onSave,
        onDiscard,
    })

    return (
        <UnsavedChangesDialog
            open={isBlocked}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onCancel={handleCancel}
            isSaving={isSaving}
        />
    )
}
