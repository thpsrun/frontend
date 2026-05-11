import { RotateCcw } from "lucide-react"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"

interface Props {
    error: Error
    onRetry: () => void
    retryLabel?: string
}

export function QueryErrorBanner({
    error,
    onRetry,
    retryLabel = "Retry",
}: Props) {
    return (
        <AlertBanner variant="error">
            <div className="flex items-center justify-between gap-3">
                <span>{error.message}</span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onRetry}
                    className="gap-1 shrink-0"
                >
                    <RotateCcw className="size-3" />
                    {retryLabel}
                </Button>
            </div>
        </AlertBanner>
    )
}
