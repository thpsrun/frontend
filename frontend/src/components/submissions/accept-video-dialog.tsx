import { useState } from "react"

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    isVideoConfirmed,
    VIDEO_CONFIRM_WORD,
} from "@/components/submissions/import-issues"

interface AcceptVideoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    videoUrl: string
    onConfirm: () => void
}

export function AcceptVideoDialog({
    open, onOpenChange, videoUrl, onConfirm,
}: AcceptVideoDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl uppercase tracking-tight">
                        Save with a non-YouTube video?
                    </DialogTitle>
                    <DialogDescription>
                        This run's video isn't a YouTube link. To save it anyway,
                        type {VIDEO_CONFIRM_WORD} below.
                    </DialogDescription>
                </DialogHeader>
                <AcceptVideoForm
                    videoUrl={videoUrl}
                    onConfirm={onConfirm}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

interface AcceptVideoFormProps {
    videoUrl: string
    onConfirm: () => void
    onCancel: () => void
}

function AcceptVideoForm({
    videoUrl, onConfirm, onCancel,
}: AcceptVideoFormProps) {
    const [text, setText] = useState("")
    const confirmed = isVideoConfirmed(text)

    return (
        <>
            <div className="space-y-1">
                {videoUrl && (
                    <p className="text-xs text-muted-foreground break-all">
                        {videoUrl}
                    </p>
                )}
                <Label className="text-xs" htmlFor="accept-video-confirm">
                    Type{" "}
                    <span className="font-semibold">{VIDEO_CONFIRM_WORD}</span>
                    {" "}to confirm
                </Label>
                <Input
                    id="accept-video-confirm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && confirmed) onConfirm()
                    }}
                    placeholder={VIDEO_CONFIRM_WORD}
                    autoComplete="off"
                    autoFocus
                />
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} disabled={!confirmed}>
                    Save Anyway
                </Button>
            </DialogFooter>
        </>
    )
}
