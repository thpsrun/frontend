import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface UnsavedChangesDialogProps {
    open: boolean
    onSave: () => void
    onDiscard: () => void
    onCancel: () => void
    isSaving?: boolean
}

export function UnsavedChangesDialog({
    open,
    onSave,
    onDiscard,
    onCancel,
    isSaving,
}: UnsavedChangesDialogProps) {
    return (
        // Dismissing the dialog by any means (escape, outside click) counts as Cancel, which
        // resets the router blocker so the user stays on the page with edits intact.
        <AlertDialog open={open} onOpenChange={(o) => {
            if (!o) onCancel()
        }}>
            <AlertDialogContent
                className="duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Unsaved Changes
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes. What would
                        you like to do?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="outline"
                        onClick={onDiscard}
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
