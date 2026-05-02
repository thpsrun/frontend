import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useChangePassword } from "@/hooks/auth/useChangePassword"
import { useSetSrcKey, useDeleteSrcKey } from "@/hooks/auth/useSrcKey"
import { AlertBanner } from "@/components/ui/alert-banner"
import { FormField } from "@/components/profile/form-field"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import { validatePassword } from "@/lib/validation"
import {
    ModerationSettings,
} from "@/components/profile/moderation-settings"
import type { StatusMsg } from "@/types/shared"
import { getErrorMessage } from "@/lib/utils"
import { ConnectedAccountsSection } from "./connected-accounts-section"
import { PasskeysSection } from "./passkeys-section"

interface PasswordFormValues {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

export function SecuritySection() {
    const { player } = useCurrentPlayer()
    const changePassword = useChangePassword()
    const setSrcKey = useSetSrcKey()
    const deleteSrcKey = useDeleteSrcKey()

    const passwordForm = useForm<PasswordFormValues>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    const [passwordMsg, setPasswordMsg] =
        useState<StatusMsg>(null)

    if (!player) return null

    const handleChangePassword = passwordForm.handleSubmit(
        async (data) => {
            setPasswordMsg(null)

            if (data.newPassword !== data.confirmNewPassword) {
                setPasswordMsg({
                    type: "error",
                    text: "New passwords do not match.",
                })
                return
            }

            const pwError = validatePassword(
                data.newPassword,
            )
            if (pwError) {
                setPasswordMsg({
                    type: "error",
                    text: pwError,
                })
                return
            }

            try {
                await changePassword.mutateAsync({
                    current_password: data.currentPassword,
                    new_password: data.newPassword,
                })
                setPasswordMsg({
                    type: "success",
                    text: "Password changed.",
                })
                passwordForm.reset()
            } catch (err) {
                setPasswordMsg({
                    type: "error",
                    text: getErrorMessage(
                        err,
                        "Password change failed.",
                    ),
                })
            }
        },
    )

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel title="Change Password">
                <form
                    onSubmit={handleChangePassword}
                    className="flex flex-col gap-4"
                >
                    <FormField
                        label="Current Password"
                        id="current-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        {...passwordForm.register("currentPassword")}
                    />
                    <FormField
                        label="New Password"
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        {...passwordForm.register("newPassword")}
                    />
                    <FormField
                        label="Confirm New Password"
                        id="confirm-new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        {...passwordForm.register("confirmNewPassword")}
                    />

                    {passwordMsg && (
                        <AlertBanner
                            variant={passwordMsg.type}
                        >
                            {passwordMsg.text}
                        </AlertBanner>
                    )}

                    <SaveButton
                        isPending={changePassword.isPending}
                        idleLabel="Change Password"
                        pendingLabel="Changing..."
                    />
                </form>
            </SectionPanel>

            <ModerationSettings
                player={player}
                setSrcKey={setSrcKey}
                deleteSrcKey={deleteSrcKey}
            />

            <ConnectedAccountsSection />
            <PasskeysSection />
        </div>
    )
}
