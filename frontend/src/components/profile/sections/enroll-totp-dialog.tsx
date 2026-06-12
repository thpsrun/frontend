import { useCallback, useEffect, useRef, useState } from "react"
import type { SyntheticEvent } from "react"
import { QRCodeSVG } from "qrcode.react"
import { getTotpSetup } from "@/hooks/auth/totp-api"
import { useActivateTotp } from "@/hooks/auth/useTotp"
import { useGenerateRecoveryCodes } from "@/hooks/auth/useRecoveryCodes"
import { useReauthGuard } from "@/hooks/auth/useReauthGuard"
import type { TotpSetup } from "@/types/auth"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"
import { ReauthStep } from "@/components/auth/reauth-step"
import { RecoveryCodesDisplay } from "./recovery-codes-display"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Step = "loading" | "setup" | "recovery"

// Every allauth call in this flow (setup fetch, activation, recovery code generation) can
// demand step-up reauth, so each runs through runGuarded: the dialog body swaps to ReauthStep
// and the original action replays after the user verifies.
export function EnrollTotpDialog({ open, onOpenChange }: Props) {
    const activate = useActivateTotp()
    const { mutateAsync: genCodes, isPending: generating } =
        useGenerateRecoveryCodes()
    const { reauthNeeded, error, runGuarded, onReauthed, reset } =
        useReauthGuard()

    const [step, setStep] = useState<Step>("loading")
    const [setup, setSetup] = useState<TotpSetup | null>(null)
    const [code, setCode] = useState("")
    const [codes, setCodes] = useState<string[]>([])
    const generated = useRef(false)

    const close = () => onOpenChange(false)

    useEffect(() => {
        if (open) return
        setStep("loading")
        setSetup(null)
        setCode("")
        setCodes([])
        generated.current = false
        reset()
    }, [open, reset])

    const loadSetup = useCallback(() => {
        setStep("loading")
        return runGuarded(async () => {
            const data = await getTotpSetup()
            setSetup(data)
            setStep("setup")
        }, "Couldn't start authenticator setup. Please try again...")
    }, [runGuarded])

    useEffect(() => {
        if (open) void loadSetup()
    }, [open, loadSetup])

    const generateCodes = useCallback(() => {
        return runGuarded(async () => {
            const result = await genCodes()
            setCodes(result.unused_codes)
        }, "Couldn't generate recovery codes. Please try again...")
    }, [runGuarded, genCodes])

    // Generate recovery codes exactly once per enrollment: every generation invalidates the
    // previous set, so a rerun would silently void codes the user may have already saved.
    useEffect(() => {
        if (step === "recovery" && !generated.current) {
            generated.current = true
            void generateCodes()
        }
    }, [step, generateCodes])

    const handleVerify = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (code.length !== 6) return
        void runGuarded(async () => {
            await activate.mutateAsync(code)
            setStep("recovery")
        }, "Invalid code. Please try again.")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {reauthNeeded ? (
                    <ReauthStep onSuccess={onReauthed} onCancel={close} />
                ) : step === "recovery" ? (
                    <div className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>Save Your Recovery Codes</DialogTitle>
                        </DialogHeader>
                        {error && (
                            <div className="text-sm text-destructive">{error}</div>
                        )}
                        {codes.length > 0 ? (
                            <RecoveryCodesDisplay codes={codes} />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Your authenticator app is enabled!
                                {generating ? " Generating recovery codes..." : ""}
                            </p>
                        )}
                        <DialogFooter>
                            {codes.length === 0 && !generating && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => void generateCodes()}
                                >
                                    {error ? "Try again" : "Generate recovery codes"}
                                </Button>
                            )}
                            <Button type="button" onClick={close}>
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>Set Up Authenticator App</DialogTitle>
                        </DialogHeader>
                        {error && (
                            <div className="text-sm text-destructive">{error}</div>
                        )}
                        {step === "loading" || !setup ? (
                            <p className="text-sm text-muted-foreground">
                                Loading Setup...
                            </p>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    You can either scan this QR code with your authenticator app or
                                    you can enter the key manually. Once you do so, enter the 6-digit
                                    code that appears to confirm everything works.
                                </p>
                                <div className="flex justify-center">
                                    <div className="rounded-md bg-white p-3">
                                        <QRCodeSVG
                                            value={setup.totpUrl}
                                            size={176}
                                            marginSize={2}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 break-all rounded-md border border-border/40 px-3 py-2 font-mono text-xs">
                                        {setup.secret}
                                    </code>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            void navigator.clipboard.writeText(
                                                setup.secret,
                                            )
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                                <FormField
                                    label="6-Digit Code"
                                    id="totp-code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value.replace(/\D/g, ""))
                                    }
                                    required
                                />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={close}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={activate.isPending || code.length !== 6}
                                    >
                                        {activate.isPending
                                            ? "Verifying..."
                                            : "Verify & Enable"}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
