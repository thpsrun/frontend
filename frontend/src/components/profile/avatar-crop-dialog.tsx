import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface CropArea {
    x: number
    y: number
    width: number
    height: number
}

interface AvatarCropDialogProps {
    imageUrl: string | null
    open: boolean
    onCrop: (blob: Blob) => void
    onCancel: () => void
}

// Avatars are exported at a fixed 256x256 PNG no matter the source image's resolution.
const OUTPUT_SIZE = 256

async function getCroppedImage(
    imageSrc: string,
    cropPixels: CropArea,
): Promise<Blob> {
    const image = new Image()
    image.src = imageSrc

    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = reject
    })

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context unavailable")

    // drawImage(src, sx, sy, sW, sH, dx, dy, dW, dH) - extract crop region, scale to output
    ctx.drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
    )

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob)
                else reject(new Error("Canvas toBlob failed"))
            },
            "image/png",
        )
    })
}

export function AvatarCropDialog({
    imageUrl,
    open,
    onCrop,
    onCancel,
}: AvatarCropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<CropArea | null>(null)

    const onCropComplete = useCallback(
        (_croppedArea: CropArea, pixels: CropArea) => {
            setCroppedAreaPixels(pixels)
        },
        [],
    )

    const handleConfirm = async () => {
        if (!imageUrl || !croppedAreaPixels) return

        try {
            const blob = await getCroppedImage(imageUrl, croppedAreaPixels)
            onCrop(blob)
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setCroppedAreaPixels(null)
        } catch {
            toast.error("Could not crop the image. Please try a different file.")
        }
    }

    const handleCancel = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        onCancel()
    }

    if (!imageUrl) return null

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) handleCancel()
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crop Avatar</DialogTitle>
                    <DialogDescription>
                        Pan and zoom to frame your profile picture.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative h-64 w-full overflow-hidden rounded-md bg-muted">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="flex items-center gap-3 px-1">
                    <span className="text-xs text-muted-foreground">
                        Zoom
                    </span>
                    <Slider
                        min={1}
                        max={3}
                        step={0.05}
                        value={[zoom]}
                        onValueChange={([val]) => setZoom(val)}
                        className="flex-1"
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>
                        Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
