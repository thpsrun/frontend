import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ApiError } from "@/lib/api-client"
import { mapCorrectSignupEmailError } from "@/lib/auth-errors"
import { emailRecoverySchema, type EmailRecoveryForm } from "@/lib/schemas"
import { useCorrectSignupEmail } from "@/hooks/auth/useCorrectSignupEmail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
    onSuccess: (newEmail: string) => void
}

// Recovery path for a mistyped signup email: the user can't receive the verification code,
// so the SRC API key they supplied at signup proves ownership and the backend re-sends the
// code to the corrected address instead.
export function EmailRecoveryForm({ onSuccess }: Props) {
    const correct = useCorrectSignupEmail()
    const form = useForm<EmailRecoveryForm>({
        resolver: zodResolver(emailRecoverySchema),
        defaultValues: { srcApiKey: "", newEmail: "" },
    })

    const onSubmit = form.handleSubmit((values) => {
        correct.mutate(
            { srcApiKey: values.srcApiKey, newEmail: values.newEmail },
            {
                onSuccess: () => onSuccess(values.newEmail),
                onError: (err) => {
                    const code = err instanceof ApiError ? err.code : null
                    form.setError("root", { message: mapCorrectSignupEmailError(code) })
                },
            },
        )
    })

    const rootError = form.formState.errors.root?.message

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                If you mistyped your email and it has been less than 24 hours since signup, paste your SRC API key below and we'll send a fresh code to a corrected address. If it has been longer, please reach out to a moderator on Discord.
            </p>
            <div className="flex flex-col gap-1">
                <Label htmlFor="recovery-src-key">
                    SRC API key
                    <span
                        className="ml-1 text-muted-foreground"
                        title="The SRC API key you used at signup."
                    >
                        (?)
                    </span>
                </Label>
                <Input
                    id="recovery-src-key"
                    type="text"
                    autoComplete="off"
                    {...form.register("srcApiKey")}
                />
                {form.formState.errors.srcApiKey && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.srcApiKey.message}
                    </p>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <Label htmlFor="recovery-new-email">Corrected Email</Label>
                <Input
                    id="recovery-new-email"
                    type="email"
                    autoComplete="email"
                    {...form.register("newEmail")}
                />
                {form.formState.errors.newEmail && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.newEmail.message}
                    </p>
                )}
            </div>
            {rootError && (
                <p className="text-sm text-destructive">{rootError}</p>
            )}
            <Button
                type="submit"
                size="sm"
                disabled={correct.isPending}
                className="self-start"
            >
                {correct.isPending ? "Sending..." : "Send link to corrected email"}
            </Button>
        </form>
    )
}
