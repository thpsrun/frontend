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
    const [password, setPassword] = useState("")
    const [deleteMsg, setDeleteMsg] =
        useState<string | null>(null)

    if (!player) return null

    const nameMatches =
        deleteConfirmName.toLowerCase()
        === player.player.name.toLowerCase()
    const canSubmit =
        nameMatches && password.length > 0
        && !deleteAccount.isPending

    const resetForm = () => {
        setShowDeleteConfirm(false)
        setDeleteConfirmName("")
        setPassword("")
        setDeleteMsg(null)
    }

    const handleDeleteAccount = async (
        e: React.SyntheticEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()
        setDeleteMsg(null)

        if (!nameMatches) {
            setDeleteMsg("Name does not match.")
            return
        }
        if (!password) {
            setDeleteMsg("Password is required.")
            return
        }

        try {
            await deleteAccount.mutateAsync({ password })
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
                    Permanently delete your account. Your runs will be preserved under "Anonymous".
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
                <form
                    onSubmit={handleDeleteAccount}
                    className="flex flex-col gap-4"
                >
                    <p className="text-sm text-muted-foreground">
                        Type{" "}
                        <strong>
                            {player.player.name}
                        </strong>
                        {" "}and confirm your password to
                        delete your account. This action
                        cannot be undone!
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                        I mean, Anastasia could fix it... But it'd be annoying.
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
                        autoComplete="off"
                    />
                    <FormField
                        label="Password"
                        id="delete-confirm-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    {deleteMsg && (
                        <AlertBanner variant="error">
                            {deleteMsg}
                        </AlertBanner>
                    )}

                    <div className="flex gap-2">
                        <SaveButton
                            type="submit"
                            variant="destructive"
                            isPending={
                                deleteAccount.isPending
                            }
                            disabled={!canSubmit}
                            idleLabel="Permanently Delete"
                            pendingLabel="Deleting..."
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={
                                deleteAccount.isPending
                            }
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </SectionPanel>
    )
}
