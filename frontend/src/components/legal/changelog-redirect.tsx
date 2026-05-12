import { useEffect } from "react"

const CHANGELOG_URL =
    "https://github.com/thpsrun/website/blob/main/CHANGELOG.md"

export function ChangelogRedirect() {
    useEffect(() => {
        window.location.replace(CHANGELOG_URL)
    }, [])

    return (
        <div className="flex justify-center text-sm text-muted-foreground">
            Redirecting to Changelog...
        </div>
    )
}
