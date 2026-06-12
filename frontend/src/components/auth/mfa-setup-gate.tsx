import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { ShieldAlert, Smartphone, Fingerprint } from "lucide-react"
import { useAuthenticators } from "@/hooks/auth/useAuthenticators"
import { useLogout } from "@/hooks/auth/useLogout"
import { setMfaGate } from "@/lib/mfa-gate"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EnrollTotpDialog } from "@/components/profile/sections/enroll-totp-dialog"
import { EnrollPasskeyDialog } from "@/components/profile/sections/enroll-passkey-dialog"

// Full-screen pop-up/gate thingy shown when the backend requires the user to register a second
// factor before any /api/v1 access. Renders OUTSIDE the normal chrome (no TopBar),
// so it makes no gated calls itself. Setup uses allauth endpoints, which stay open
// while gated; once a TOTP/passkey factor exists the backend lifts the gate, so we
// drop the flag and refetch everything to resume the app in place.
export function MfaSetupGate() {
    const navigate = useNavigate()
    const qc = useQueryClient()
    const { data: authenticators } = useAuthenticators()
    const logout = useLogout()

    const [totpOpen, setTotpOpen] = useState(false)
    const [passkeyOpen, setPasskeyOpen] = useState(false)

    const hasFactor = (authenticators ?? []).some(
        (a) => a.type === "totp" || a.type === "webauthn",
    )
    useEffect(() => {
        if (!hasFactor || totpOpen || passkeyOpen) return
        setMfaGate(false)
        void qc.invalidateQueries()
    }, [hasFactor, totpOpen, passkeyOpen, qc])

    const handleLogout = () => {
        logout.mutate(undefined, {
            // onSettled, not onSuccess: drop the gate even if the logout request fails so
            // the user can't get stuck on this screen.
            onSettled: () => {
                setMfaGate(false)
                navigate("/login", { replace: true })
            },
        })
    }

    return (
        <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="size-5 text-primary" />
                        <CardTitle>Two-Factor Authentication Required</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Moderators on the thps.run require two-factor authentication (2FA) before
                        you can proceed. You can set this up with an authenticator app on your
                        phone or use a password manager. OR, if you use Passkeys, then this will
                        also skip this!
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => setTotpOpen(true)}>
                            <Smartphone className="size-4" />
                            Set Up One-Time Password
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPasskeyOpen(true)}
                        >
                            <Fingerprint className="size-4" />
                            Set Up Passkey
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="self-center text-muted-foreground"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                    >
                        {logout.isPending ? "Logging out..." : "Log out"}
                    </Button>
                </CardContent>
            </Card>
            <EnrollTotpDialog open={totpOpen} onOpenChange={setTotpOpen} />
            <EnrollPasskeyDialog open={passkeyOpen} onOpenChange={setPasskeyOpen} />
        </div>
    )
}
