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
        <AlertDialog open={open} onOpenChange={(o) => {
            if (!o) onCancel()
        }}>
            <AlertDialogContent>
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
