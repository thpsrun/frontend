import { useState } from "react"
import { useNavigate } from "react-router"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useDeleteAccount } from "@/hooks/auth/useDeleteAccount"
import { useLogout } from "@/hooks/auth/useLogout"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/profile/form-field"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import { getErrorMessage } from "@/lib/utils"

export function DangerSection() {
    const navigate = useNavigate()
    const { player } = useCurrentPlayer()
    const deleteAccount = useDeleteAccount()
    const logout = useLogout()

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false)
    const [deleteConfirmName, setDeleteConfirmName] =
        useState("")
    const [deleteMsg, setDeleteMsg] =
        useState<string | null>(null)

    if (!player) return null

    const handleDeleteAccount = async () => {
        setDeleteMsg(null)

        if (
            deleteConfirmName.toLowerCase()
            !== player.player.name.toLowerCase()
        ) {
            setDeleteMsg("Name does not match.")
            return
        }

        try {
            await deleteAccount.mutateAsync()
            await logout.mutateAsync()
            navigate("/")
        } catch (err) {
            setDeleteMsg(
                getErrorMessage(
                    err,
                    "Account deletion failed.",
                ),
            )
        }
    }

    return (
        <SectionPanel
            title="Danger Zone"
            description={
                <>
                    Permanently delete your account. Your
                    runs will be preserved under
                    "Anonymous".
                </>
            }
            className="border-destructive/50"
            titleClassName="text-destructive"
        >
            {!showDeleteConfirm ? (
                <Button
                    variant="destructive"
                    onClick={() =>
                        setShowDeleteConfirm(true)
                    }
                >
                    Delete Account
                </Button>
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Type{" "}
                        <strong>
                            {player.player.name}
                        </strong>
                        {" "}to confirm account
                        deletion. This action cannot
                        be undone.
                    </p>
                    <FormField
                        label="Display Name"
                        id="delete-confirm"
                        value={deleteConfirmName}
                        onChange={(e) =>
                            setDeleteConfirmName(
                                e.target.value,
                            )
                        }
                        placeholder={player.player.name}
                    />

                    {deleteMsg && (
                        <AlertBanner variant="error">
                            {deleteMsg}
                        </AlertBanner>
                    )}

                    <div className="flex gap-2">
                        <SaveButton
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            isPending={
                                deleteAccount.isPending
                            }
                            idleLabel="Permanently Delete"
                            pendingLabel="Deleting..."
                        />
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteConfirm(
                                    false,
                                )
                                setDeleteConfirmName(
                                    "",
                                )
                                setDeleteMsg(null)
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </SectionPanel>
    )
}
