import { forwardRef, useImperativeHandle, useRef } from "react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { TURNSTILE_SITE_KEY, isTurnstileEnabled } from "@/lib/turnstile"

export interface TurnstileWidgetHandle {
    reset: () => void
}

export interface TurnstileWidgetProps {
    onToken: (token: string | null) => void
    className?: string
}

// Thin wrapper over react-turnstile that renders nothing when no site key is configured
// (local dev). Callers gate their submit buttons on onToken and call reset() after every
// attempt, since a Turnstile token is single-use.
export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
    function TurnstileWidget({ onToken, className }, ref) {
        const innerRef = useRef<TurnstileInstance | null>(null)

        useImperativeHandle(ref, () => ({
            reset: () => {
                innerRef.current?.reset()
                onToken(null)
            },
        }), [onToken])

        if (!isTurnstileEnabled()) {
            return null
        }

        return (
            <div className={className}>
                <Turnstile
                    ref={innerRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => onToken(token)}
                    // Tokens lapse after a few minutes; clearing on expire/error re-disables
                    // the caller's submit until the widget issues a fresh one.
                    onExpire={() => onToken(null)}
                    onError={() => onToken(null)}
                    options={{ theme: "dark" }}
                />
            </div>
        )
    },
)
