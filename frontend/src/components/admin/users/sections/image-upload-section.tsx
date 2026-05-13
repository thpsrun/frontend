import { useRef, type ComponentType } from "react"
import { Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

interface ImageUploadSectionProps {
    title: string
    placeholderIcon: ComponentType<{ className?: string }>
    currentUrl: string | null
    imageAlt: string
    thumbnailClassName: string
    uploadLabel: string
    uploadPendingLabel: string
    removeLabel: string
    removePendingLabel: string
    onUpload: (file: File) => void
    onRemove: () => void
    uploadPending: boolean
    removePending: boolean
}

export function ImageUploadSection({
    title,
    placeholderIcon: PlaceholderIcon,
    currentUrl,
    imageAlt,
    thumbnailClassName,
    uploadLabel,
    uploadPendingLabel,
    removeLabel,
    removePendingLabel,
    onUpload,
    onRemove,
    uploadPending,
    removePending,
}: ImageUploadSectionProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const onFile = (file: File | null) => {
        if (!file) return
        onUpload(file)
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <Panel className="p-5 w-full">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>

            <div className="flex items-center gap-4">
                {currentUrl ? (
                    <img
                        src={currentUrl}
                        alt={imageAlt}
                        className={cn(
                            thumbnailClassName,
                            "rounded-md object-cover shrink-0",
                            "border border-border/40",
                        )}
                    />
                ) : (
                    <div
                        className={cn(
                            thumbnailClassName,
                            "rounded-md border border-dashed shrink-0",
                            "border-border/60 flex items-center justify-center",
                            "text-muted-foreground",
                        )}
                    >
                        <PlaceholderIcon className="size-8" />
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />

                <div className="flex flex-col gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled={uploadPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="size-4" />
                        {uploadPending ? uploadPendingLabel : uploadLabel}
                    </Button>

                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled={removePending || !currentUrl}
                        onClick={onRemove}
                    >
                        <Trash2 className="size-4" />
                        {removePending ? removePendingLabel : removeLabel}
                    </Button>
                </div>
            </div>
        </Panel>
    )
}
