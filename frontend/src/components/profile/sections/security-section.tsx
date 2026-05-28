import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useChangePassword } from "@/hooks/auth/useChangePassword"
import { useAuthMethods } from "@/hooks/auth/useAuthMethods"
import { canRemovePassword } from "@/lib/auth-methods"
import { AlertBanner } from "@/components/common/alert-banner"
import { FormField } from "@/components/profile/form-field"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import { RemovePasswordDialog } from "@/components/auth/remove-password-dialog"
import { Button } from "@/components/ui/button"
import {
    passwordChangeSchema,
    type PasswordChangeForm,
} from "@/lib/schemas"
import type { StatusMsg } from "@/types/shared"
import { getErrorMessage } from "@/lib/utils"
import { ConnectedAccountsSection } from "./connected-accounts-section"
import { PasskeysSection } from "./passkeys-section"
import { EmailSection } from "@/components/profile/sections/email-section"

export function SecuritySection() {
    const { player } = useCurrentPlayer()
    const changePassword = useChangePassword()
    const { data: methods } = useAuthMethods()

    const passwordForm = useForm<PasswordChangeForm>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    const [passwordMsg, setPasswordMsg] = useState<StatusMsg>(null)
    const [removeOpen, setRemoveOpen] = useState(false)

    if (!player) return null

    const hasPassword = methods?.has_usable_password ?? true

    const handleChangePassword = passwordForm.handleSubmit(async (data) => {
        setPasswordMsg(null)
        try {
            await changePassword.mutateAsync(
                hasPassword
                    ? {
                        current_password: data.currentPassword,
                        new_password: data.newPassword,
                    }
                    : { new_password: data.newPassword },
            )
            setPasswordMsg({
                type: "success",
                text: hasPassword ? "Password changed." : "Password set.",
            })
            passwordForm.reset()
        } catch (err) {
            setPasswordMsg({
                type: "error",
                text: getErrorMessage(
                    err,
                    hasPassword
                        ? "Password change failed."
                        : "Setting password failed.",
                ),
            })
        }
    })

    const showRemoveBlock = hasPassword
    const removeEnabled = methods ? canRemovePassword(methods) : false
    const fieldErrors = passwordForm.formState.errors

    return (
        <div className="flex flex-col gap-6">
            <EmailSection />
            <SectionPanel title={hasPassword ? "Change Password" : "Set Password"}>
                <form
                    onSubmit={handleChangePassword}
                    className="flex flex-col gap-4"
                >
                    {!hasPassword && (
                        <p className="text-sm text-muted-foreground">
                            You do not have a password on this account and will login with
                            OAuth (Discord/Twitch) or Passkeys. You can set a brand new password
                            to login to your account above.
                        </p>
                    )}
                    {hasPassword && (
                        <FormField
                            label="Current Password"
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            error={fieldErrors.currentPassword?.message}
                            {...passwordForm.register("currentPassword")}
                        />
                    )}
                    <FormField
                        label="New Password"
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        error={fieldErrors.newPassword?.message}
                        {...passwordForm.register("newPassword")}
                    />
                    <FormField
                        label="Confirm New Password"
                        id="confirm-new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        error={fieldErrors.confirmNewPassword?.message}
                        {...passwordForm.register("confirmNewPassword")}
                    />

                    {passwordMsg && (
                        <AlertBanner variant={passwordMsg.type}>
                            {passwordMsg.text}
                        </AlertBanner>
                    )}

                    <SaveButton
                        isPending={changePassword.isPending}
                        idleLabel={hasPassword ? "Change Password" : "Set Password"}
                        pendingLabel={hasPassword ? "Changing..." : "Setting..."}
                    />
                </form>

                {showRemoveBlock && (
                    <>
                        <hr className="my-4 border-border/40" />
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">
                                With OAuth (Discord/Twitch) or Passkeys set, you can remove your password from your account.
                                When you do this, you will login with one of those methods. You can set a password later, if you wish.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={!removeEnabled}
                                onClick={() => setRemoveOpen(true)}
                                className="self-start"
                            >
                                Remove password
                            </Button>
                            {!removeEnabled && (
                                <p className="text-xs text-muted-foreground">
                                    Add a passkey or link a Discord/Twitch account first.
                                </p>
                            )}
                            <RemovePasswordDialog
                                open={removeOpen}
                                onOpenChange={setRemoveOpen}
                            />
                        </div>
                    </>
                )}
            </SectionPanel>

            <ConnectedAccountsSection />
            <PasskeysSection />
        </div>
    )
}
