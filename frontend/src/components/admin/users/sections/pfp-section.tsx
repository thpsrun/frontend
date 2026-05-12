import { useRef } from "react"
import { Trash2, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { BACKEND_URL } from "@/constants"
import { usePlayerProfile } from "@/hooks/player/usePlayerProfile"
import {
    useDeletePfp,
    useUploadPfp,
} from "@/hooks/admin/useAdminUsers"
import { cn } from "@/lib/utils"

interface PfpSectionProps {
    ident: string
}

export function PfpSection({ ident }: PfpSectionProps) {
    const profile = usePlayerProfile(ident)
    const upload = useUploadPfp(ident)
    const del = useDeletePfp(ident)
    const inputRef = useRef<HTMLInputElement>(null)

    const pfp = profile.data?.player.pfp
    const currentPfp = pfp ? `${BACKEND_URL}${pfp}` : null

    const onFile = (file: File | null) => {
        if (!file) return
        upload.mutate(file)
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <Panel className="p-5 w-full">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">Profile Picture</h3>
            </div>

            <div className="flex items-center gap-4">
                {currentPfp ? (
                    <img
                        src={currentPfp}
                        alt={`${ident} profile picture`}
                        className={cn(
                            "size-20 rounded-md object-cover",
                            "border border-border/40",
                        )}
                    />
                ) : (
                    <div
                        className={cn(
                            "size-20 rounded-md border border-dashed",
                            "border-border/60 flex items-center justify-center",
                            "text-muted-foreground",
                        )}
                    >
                        <User className="size-8" />
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled={upload.isPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="size-4" />
                        {upload.isPending ? "Uploading..." : "Upload picture"}
                    </Button>

                    <Button
                        variant="outline"
                        className="gap-2"
                        disabled={del.isPending || !currentPfp}
                        onClick={() => del.mutate()}
                    >
                        <Trash2 className="size-4" />
                        {del.isPending ? "Removing..." : "Remove picture"}
                    </Button>
                </div>
            </div>
        </Panel>
    )
}
