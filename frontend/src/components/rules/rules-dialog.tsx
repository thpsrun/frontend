import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RulesContent } from "@/components/rules/rules-content"
import type { RulesView } from "@/lib/rules"

interface RulesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    view: RulesView
}

export function RulesDialog({
    open,
    onOpenChange,
    view,
}: RulesDialogProps) {
    const description = view.sections
        .map((s) => s.title)
        .join(" · ")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-3xl uppercase tracking-tight leading-none">
                        Rules
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <RulesContent view={view} />

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
