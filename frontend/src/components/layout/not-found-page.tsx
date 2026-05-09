import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export function NotFoundPage() {
    return (
        <div className="flex flex-col items-center gap-4 pt-20 text-center">
            <Compass className="size-8 text-muted-foreground" />
            <h2 className="text-3xl font-semibold tracking-tight">
                404
            </h2>
            <p className="text-base font-medium">
                That page could not be found.
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
                The link may be broken, or the page may
                have been moved. Try heading home or
                browsing the leaderboards.
            </p>
            <div className="flex gap-2">
                <Button asChild variant="default">
                    <Link to="/">Return home</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link to="/rankings">Rankings</Link>
                </Button>
            </div>
        </div>
    )
}
