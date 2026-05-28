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
                    onExpire={() => onToken(null)}
                    onError={() => onToken(null)}
                    options={{ theme: "dark" }}
                />
            </div>
        )
    },
)
