import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useConfirmPasswordReset } from "@/hooks/auth/useConfirmPasswordReset"
import {
    resetPasswordSchema,
    type ResetPasswordForm,
} from "@/lib/schemas"
import { ApiError } from "@/lib/api-client"
import { passwordResetConfirmErrorMessage } from "@/lib/auth-errors"
import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/profile/form-field"

export function ResetPasswordPage() {
    const navigate = useNavigate()
    const { uidb36, key } = useParams<{ uidb36: string, key: string }>()
    const confirmReset = useConfirmPasswordReset()

    const form = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmNewPassword: "" },
    })

    const [error, setError] = useState<string | null>(null)

    // Both params are required by the route definition, but if a user hand-
    // edits the URL we surface a clear error rather than posting an empty key.
    const resetKey = uidb36 && key ? `${uidb36}-${key}` : null

    const onSubmit = form.handleSubmit(async ({ newPassword }) => {
        setError(null)
        if (!resetKey) {
            setError(passwordResetConfirmErrorMessage(null))
            return
        }
        try {
            await confirmReset.mutateAsync({ key: resetKey, password: newPassword })
            toast.success("Password updated. You can now log in!")
            navigate("/login", { replace: true })
        } catch (err) {
            const code = err instanceof ApiError ? err.code : null
            setError(passwordResetConfirmErrorMessage(code))
        }
    })

    const fieldErrors = form.formState.errors

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-100">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Set a New Password
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {error && (
                        <AlertBanner variant="error">
                            {error}{" "}
                            <Link
                                to="/forgot-password"
                                className="underline underline-offset-4"
                            >
                                Request a New Link
                            </Link>
                            .
                        </AlertBanner>
                    )}

                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            Choose a new password for your account.
                        </p>
                        <FormField
                            label="New Password"
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={fieldErrors.newPassword?.message}
                            {...form.register("newPassword")}
                        />
                        <FormField
                            label="Confirm New Password"
                            id="confirm-new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={fieldErrors.confirmNewPassword?.message}
                            {...form.register("confirmNewPassword")}
                        />
                        <Button
                            type="submit"
                            disabled={confirmReset.isPending || !resetKey}
                        >
                            {confirmReset.isPending
                                ? "Updating..."
                                : "Update Password"}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            <Link
                                to="/login"
                                className="text-foreground underline underline-offset-4 hover:text-primary"
                            >
                                Back to Login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
