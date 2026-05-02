import { KeyRound } from "lucide-react"
import { useLoginWithPasskey } from "@/hooks/auth/useLoginWithPasskey"
import { Button } from "@/components/ui/button"

export function PasskeyLoginButton() {
    const login = useLoginWithPasskey()
    return (
        <Button
            variant="outline"
            onClick={() => login.mutate()}
            disabled={login.isPending}
            className="w-full"
        >
            <KeyRound className="mr-1 size-4" />
            Sign in with Passkey
        </Button>
    )
}
