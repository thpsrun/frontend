import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/auth/useAuth"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const panelClass = cn(
    "rounded-lg border border-border/40",
    "bg-background/70 backdrop-blur-sm",
    "shadow-sm p-5",
)

export function DangerSection() {
    const navigate = useNavigate()
    const { player, deleteAccount, logout } = useAuth()

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
                err instanceof Error
                    ? err.message
                    : "Account deletion failed.",
            )
        }
    }

    return (
        <section className={cn(
            panelClass,
            "border-destructive/50",
        )}>
            <h2 className={cn(
                "text-xl font-semibold",
                "text-destructive",
            )}>
                Danger Zone
            </h2>
            <p className={cn(
                "text-sm text-muted-foreground",
                "mb-4",
            )}>
                Permanently delete your account. Your
                runs will be preserved under
                "Anonymous".
            </p>
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
                    <p className={cn(
                        "text-sm",
                        "text-muted-foreground",
                    )}>
                        Type{" "}
                        <strong>
                            {player.player.name}
                        </strong>
                        {" "}to confirm account
                        deletion. This action cannot
                        be undone.
                    </p>
                    <div className={cn(
                        "flex flex-col gap-2",
                    )}>
                        <Label
                            htmlFor="delete-confirm"
                        >
                            Display Name
                        </Label>
                        <Input
                            id="delete-confirm"
                            value={deleteConfirmName}
                            onChange={(e) =>
                                setDeleteConfirmName(
                                    e.target.value,
                                )
                            }
                            placeholder={
                                player.player.name
                            }
                        />
                    </div>

                    {deleteMsg && (
                        <AlertBanner variant="error">
                            {deleteMsg}
                        </AlertBanner>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={
                                handleDeleteAccount
                            }
                            disabled={
                                deleteAccount
                                    .isPending
                            }
                        >
                            {deleteAccount.isPending
                                ? "Deleting..."
                                : "Permanently Delete"}
                        </Button>
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
        </section>
    )
}
