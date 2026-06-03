import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { acknowledgeCookies, hasAcknowledgedCookies } from "@/lib/cookie-consent"

export function CookieConsentBanner() {
    const [visible, setVisible] = useState(() => !hasAcknowledgedCookies())

    if (!visible) {
        return null
    }

    function handleAcknowledge() {
        acknowledgeCookies()
        setVisible(false)
    }

    return (
        <div
            role="region"
            aria-label="Cookie notice"
            className={cn(
                "fixed bottom-3 left-3 z-50",
                "w-[calc(100%-2rem)] max-w-sm",
            )}
        >
            <Card className="border-border/60 bg-background/90 shadow-lg backdrop-blur">
                <CardContent className="flex flex-col gap-1 p-2 text-sm">
                    <p className="text-muted-foreground text-center">
                        We use essential cookies to keep you signed in and protect
                        your account. We don&apos;t use advertising or tracking
                        cookies.{" "}
                        <Link
                            to="/privacy"
                            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                    <div className="flex justify-end center">
                        <Button size="sm" onClick={handleAcknowledge}>
                            Got it!
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
