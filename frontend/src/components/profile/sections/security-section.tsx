import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useChangePassword } from "@/hooks/auth/useChangePassword"
import { useSetSrcKey, useDeleteSrcKey } from "@/hooks/auth/useSrcKey"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import { validatePassword } from "@/lib/validation"
import {
    ModerationSettings,
} from "@/components/profile/moderation-settings"
import type { StatusMsg } from "@/types/shared"
import { cn, getErrorMessage } from "@/lib/utils"

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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="current-password">
                            Current Password
                        </Label>
                        <PasswordInput
                            id="current-password"
                            autoComplete="current-password"
                            required
                            {...passwordForm.register(
                                "currentPassword",
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="new-password">
                            New Password
                        </Label>
                        <PasswordInput
                            id="new-password"
                            autoComplete="new-password"
                            required
                            {...passwordForm.register(
                                "newPassword",
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="confirm-new-password"
                        >
                            Confirm New Password
                        </Label>
                        <PasswordInput
                            id="confirm-new-password"
                            autoComplete="new-password"
                            required
                            {...passwordForm.register(
                                "confirmNewPassword",
                            )}
                        />
                    </div>

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

            <SectionPanel
                title="Connected Accounts"
                description="Manage linked accounts and authentication methods."
            >
                <div className="flex flex-col gap-3">
                    {["Discord", "Twitch", "Passkeys"].map(
                        (name) => (
                            <div
                                key={name}
                                className={cn(
                                    "flex items-center",
                                    "justify-between",
                                    "rounded-md",
                                    "border border-border/40",
                                    "px-4 py-3",
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-medium",
                                )}>
                                    {name}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                >
                                    Coming Soon
                                </Button>
                            </div>
                        ),
                    )}
                </div>
            </SectionPanel>
        </div>
    )
}
