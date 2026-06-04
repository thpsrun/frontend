import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoHintProps {
    text: string
    className?: string
}

export function InfoHint({ text, className }: InfoHintProps) {
    return (
        <span title={text}>
            <Info className={cn(
                "size-4",
                "text-muted-foreground",
                className,
            )} />
        </span>
    )
}
