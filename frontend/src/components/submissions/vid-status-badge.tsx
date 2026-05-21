import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VidStatus } from "@/types/submissions"

interface Props {
    status: VidStatus
    className?: string
}

const STATUS_CONFIG: Record<VidStatus, { label: string; classes: string }> = {
    new: {
        label: "Pending",
        classes: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    },
    review: {
        label: "Needs Changes",
        classes: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },
    verified: {
        label: "Verified",
        classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    },
    rejected: {
        label: "Rejected",
        classes: "bg-red-500/10 text-red-300 border-red-500/30",
    },
}

export function VidStatusBadge({ status, className }: Props) {
    const config = STATUS_CONFIG[status]
    if (!config) return null
    return (
        <Badge
            variant="outline"
            className={cn(config.classes, className)}
        >
            {config.label}
        </Badge>
    )
}
