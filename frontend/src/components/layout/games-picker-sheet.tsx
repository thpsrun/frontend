import { Link } from "react-router"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useGames } from "@/hooks/game/useGames"
import { Skeleton } from "@/components/ui/skeleton"

interface GamesPickerSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GamesPickerSheet({ open, onOpenChange }: GamesPickerSheetProps) {
    const { data: games, isLoading } = useGames()

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="max-h-[80vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            >
                <SheetHeader>
                    <SheetTitle>Games</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto overscroll-contain px-4 pb-4">
                    {isLoading &&
                        [...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-10 shrink-0 rounded-md" />
                        ))}
                    {games?.map((game) => (
                        <Link
                            key={game.slug}
                            to={`/${game.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="block shrink-0 rounded-md px-3 py-2.5 text-sm hover:bg-accent truncate"
                        >
                            {game.name}
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
