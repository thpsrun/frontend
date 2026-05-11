import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2, XCircle, Loader2, Clock, Ban,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { STATUS_LABEL, type ReconcileStatus } from "@/types/reconcile"

type Variant = "default" | "secondary" | "destructive" | "warning" | "outline"

const STATUS_VARIANT: Record<ReconcileStatus, Variant> = {
    PENDING: "outline",
    IN_PROGRESS: "secondary",
    SUCCEEDED: "default",
    FAILED: "destructive",
    CANCELLING: "warning",
    CANCELLED: "outline",
}

export function JobStatusBadge({
    status,
    showIcon = true,
}: {
    status: ReconcileStatus
    showIcon?: boolean
}) {
    const variant = STATUS_VARIANT[status] ?? "outline"
    const label = STATUS_LABEL[status] ?? status

    return (
        <Badge variant={variant} className="gap-1">
            {showIcon && <StatusIcon status={status} />}
            {label}
        </Badge>
    )
}

function StatusIcon({ status }: { status: ReconcileStatus }) {
    switch (status) {
        case "PENDING":
            return <Clock className="size-3" />
        case "IN_PROGRESS":
            return <Loader2 className={cn("size-3 animate-spin")} />
        case "SUCCEEDED":
            return <CheckCircle2 className="size-3" />
        case "FAILED":
            return <XCircle className="size-3" />
        case "CANCELLING":
            return <Loader2 className={cn("size-3 animate-spin")} />
        case "CANCELLED":
            return <Ban className="size-3" />
        default:
            return null
    }
}
