import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Panel } from "@/components/ui/panel"
import { ImageIcon, X } from "lucide-react"
import { BACKEND_URL } from "@/constants"
import { cn } from "@/lib/utils"

interface BgUploadProps {
    currentBg: string | null
    pendingFile: File | null
    previewUrl: string | null
    onFileSelect: (file: File, previewUrl: string) => void
    onFileClear: () => void
    onRemoveExisting: () => void
}

const MAX_SIZE = 10 * 1024 * 1024
const MIN_WIDTH = 1280
const MIN_HEIGHT = 720
const ACCEPTED_TYPES = ["image/jpeg", "image/png"]

function validateFile(file: File): Promise<string | null> {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return Promise.resolve("File must be a JPG or PNG.")
    }
    if (file.size > MAX_SIZE) {
        return Promise.resolve("File must be under 10 MB.")
    }
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            if (img.naturalWidth < MIN_WIDTH
                || img.naturalHeight < MIN_HEIGHT) {
                resolve(
                    `Image must be at least `
                    + `${MIN_WIDTH}x${MIN_HEIGHT}. `
                    + `Got ${img.naturalWidth}`
                    + `x${img.naturalHeight}.`,
                )
            } else {
                resolve(null)
            }
            URL.revokeObjectURL(img.src)
        }
        img.onerror = () => {
            resolve("Could not read image dimensions.")
            URL.revokeObjectURL(img.src)
        }
        img.src = URL.createObjectURL(file)
    })
}

export function BgUpload({
    currentBg,
    pendingFile,
    previewUrl,
    onFileSelect,
    onFileClear,
    onRemoveExisting,
}: BgUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFile = useCallback(async (file: File) => {
        setError(null)
        const err = await validateFile(file)
        if (err) {
            setError(err)
            return
        }
        const url = URL.createObjectURL(file)
        onFileSelect(file, url)
    }, [onFileSelect])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
        },
        [handleFile],
    )

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const showPreview = previewUrl || currentBg

    return (
        <div className="flex flex-col gap-3">
            {!showPreview && !pendingFile && (
                <div
                    onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    className={cn(
                        "border-2 border-dashed rounded-lg",
                        "p-8 text-center cursor-pointer",
                        "transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border/40",
                        !isDragging && "hover:border-border",
                    )}
                >
                    <ImageIcon className={cn(
                        "size-8 mx-auto mb-2",
                        "text-muted-foreground",
                    )} />
                    <p className={cn(
                        "text-sm text-muted-foreground",
                    )}>
                        Drag and drop or click to upload
                    </p>
                    <p className={cn(
                        "text-xs text-muted-foreground/60",
                        "mt-1",
                    )}>
                        JPG / PNG &middot; Min
                        1280&times;720 &middot; Under 10 MB
                    </p>
                </div>
            )}

            {showPreview && (
                <Panel className="p-3 flex items-center gap-3">
                    <img
                        src={previewUrl
                            ?? `${BACKEND_URL}${currentBg}`}
                        alt="Background preview"
                        className={cn(
                            "w-30 h-17 object-cover",
                            "rounded shrink-0",
                        )}
                    />
                    <div className="flex-1 min-w-0">
                        {pendingFile && (
                            <>
                                <p className="text-sm truncate">
                                    {pendingFile.name}
                                </p>
                                <p className={cn(
                                    "text-xs",
                                    "text-muted-foreground",
                                )}>
                                    {(pendingFile.size
                                        / 1024 / 1024)
                                        .toFixed(1)} MB
                                </p>
                            </>
                        )}
                        {!pendingFile && currentBg && (
                            <p className={cn(
                                "text-sm",
                                "text-muted-foreground",
                            )}>
                                Current background
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            Replace
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={pendingFile
                                ? onFileClear
                                : onRemoveExisting}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </Panel>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleInputChange}
                className="hidden"
            />

            {error && (
                <AlertBanner variant="error">
                    {error}
                </AlertBanner>
            )}
        </div>
    )
}
