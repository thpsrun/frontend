import { User } from "lucide-react"
import { BACKEND_URL } from "@/constants"
import { usePlayerProfile } from "@/hooks/player/usePlayerProfile"
import {
    useDeletePfp,
    useUploadPfp,
} from "@/hooks/admin/useAdminUsers"
import { ImageUploadSection } from "./image-upload-section"

interface PfpSectionProps {
    ident: string
}

export function PfpSection({ ident }: PfpSectionProps) {
    const profile = usePlayerProfile(ident)
    const upload = useUploadPfp(ident)
    const del = useDeletePfp(ident)

    const pfp = profile.data?.player.pfp
    const currentPfp = pfp ? `${BACKEND_URL}${pfp}` : null

    return (
        <ImageUploadSection
            title="Profile Picture"
            placeholderIcon={User}
            currentUrl={currentPfp}
            imageAlt={`${ident} profile picture`}
            thumbnailClassName="size-20"
            uploadLabel="Upload Picture"
            uploadPendingLabel="Uploading..."
            removeLabel="Remove Picture"
            removePendingLabel="Removing..."
            onUpload={(file) => upload.mutate(file)}
            onRemove={() => del.mutate()}
            uploadPending={upload.isPending}
            removePending={del.isPending}
        />
    )
}
