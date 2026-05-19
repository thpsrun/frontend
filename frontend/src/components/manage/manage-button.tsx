import { useNavigate } from "react-router"
import { Wrench } from "lucide-react"
import { useIsGameMod } from "@/hooks/game/useIsGameMod"
import { cn } from "@/lib/utils"

interface ManageButtonProps {
    gameSlug: string
    isActive?: boolean
}

export function ManageButton({ gameSlug, isActive }: ManageButtonProps) {
    const navigate = useNavigate()
    const { isMod } = useIsGameMod(gameSlug)
    if (!isMod) return null
    return (
        <button
            onClick={() => navigate(`/${gameSlug}/manage`)}
            className={cn(
                "w-full px-3 py-1.5",
                "text-xs font-semibold",
                "rounded-md transition",
                "flex items-center justify-center gap-1.5",
                isActive
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-amber-400/80 hover:text-white hover:bg-amber-600/30",
            )}
        >
            <Wrench className="size-3" />
            Manage
        </button>
    )
}
