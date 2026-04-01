import { Link } from "react-router"

export function Footer() {
    return (
        <footer className="mt-auto w-full bg-background px-5 py-2 rounded-lg text-center text-xs text-muted-foreground">
            <div className="flex flex-col gap-2">
                <p>&copy; 2022-2026 Copyright thps.run</p>

                <div className="flex items-center justify-center gap-3">
                    <span>&bull;</span>
                    <Link
                        to="/privacy"
                        className="hover:text-foreground transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <span>&bull;</span>
                    <Link
                        to="/changelog"
                        className="hover:text-foreground transition-colors"
                    >
                        Changelog
                    </Link>
                    <span>&bull;</span>
                    <Link
                        to="/faq"
                        className="hover:text-foreground transition-colors"
                    >
                        FAQ
                    </Link>
                    <span>&bull;</span>
                </div>

                <p className="text-[0.65rem] text-muted-foreground/60 leading-snug">
                    thps.run is an independent fan website and is not
                    affiliated with, endorsed by, or in any way officially
                    connected with the Tony Hawk's Pro Skater franchise,
                    its developers, Activision, or any of its
                    subsidiaries. All trademarks, game names, skater
                    names, and logos appearing on the site are the
                    property of their respective owners. Any reference to
                    the Tony Hawk's series is for descriptive
                    purposes only and does not imply any association with
                    or endorsement by the game's creators.
                </p>
            </div>
        </footer>
    )
}
