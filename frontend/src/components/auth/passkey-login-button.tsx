import { KeyRound } from "lucide-react"
import { useLoginWithPasskey } from "@/hooks/auth/useLoginWithPasskey"
import { Button } from "@/components/ui/button"

interface Props {
    rememberMe?: boolean
}

export function PasskeyLoginButton({ rememberMe = false }: Props) {
    const login = useLoginWithPasskey()
    return (
        <Button
            variant="outline"
            onClick={() => login.mutate({ rememberMe })}
            disabled={login.isPending}
            className="w-full"
        >
            <KeyRound className="mr-1 size-4" />
            Sign in with Passkeys
        </Button>
    )
}
