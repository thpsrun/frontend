import { ImageIcon } from "lucide-react"
import { BACKEND_URL } from "@/constants"
import { usePlayerProfile } from "@/hooks/player/usePlayerProfile"
import {
    useDeleteProfileBg,
    useUploadProfileBg,
} from "@/hooks/admin/useAdminUsers"
import { ImageUploadSection } from "./image-upload-section"

interface ProfileBgSectionProps {
    ident: string
}

export function ProfileBgSection({ ident }: ProfileBgSectionProps) {
    const profile = usePlayerProfile(ident)
    const upload = useUploadProfileBg(ident)
    const del = useDeleteProfileBg(ident)

    const bg = profile.data?.customizations?.profile_bg
    const currentBg = bg ? `${BACKEND_URL}${bg}` : null

    return (
        <ImageUploadSection
            title="Profile Background"
            placeholderIcon={ImageIcon}
            currentUrl={currentBg}
            imageAlt={`${ident} profile background`}
            thumbnailClassName="w-32 h-20"
            uploadLabel="Upload Background"
            uploadPendingLabel="Uploading..."
            removeLabel="Remove Background"
            removePendingLabel="Removing..."
            onUpload={(file) => upload.mutate(file)}
            onRemove={() => del.mutate()}
            uploadPending={upload.isPending}
            removePending={del.isPending}
        />
    )
}
