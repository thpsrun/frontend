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

// Renders the unsaved-changes prompt for a dirty form. useUnsavedChangesGuard blocks in-app
// route changes via the router blocker (and warns on tab close); the dialog opens whenever a
// navigation gets intercepted, and Save/Discard let it proceed.
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
