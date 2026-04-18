import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/auth/useAuth"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    useUnsavedChangesGuard,
} from "@/hooks/useUnsavedChangesGuard"
import {
    UnsavedChangesDialog,
} from "@/components/profile/unsaved-changes-dialog"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialFormValues {
    twitch: string
    youtube: string
    twitter: string
    bluesky: string
    therun_gg: string
}

type StatusMsg = {
    type: "success" | "error"
    text: string
} | null

const panelClass = cn(
    "rounded-lg border border-border/40",
    "bg-background/70 backdrop-blur-sm",
    "shadow-sm p-5",
)

export function SocialSection() {
    const { player, updateProfile } = useAuth()

    const [statusMsg, setStatusMsg] = useState<StatusMsg>(null)

    const socialForm = useForm<SocialFormValues>({
        defaultValues: {
            twitch: "",
            youtube: "",
            twitter: "",
            bluesky: "",
            therun_gg: "",
        },
    })

    // Sync form with player data when it arrives
    useEffect(() => {
        if (!player) return
        socialForm.reset({
            twitch: player.socials.twitch ?? "",
            youtube: player.socials.youtube ?? "",
            twitter: player.socials.twitter ?? "",
            bluesky: player.socials.bluesky ?? "",
            therun_gg: player.socials.therun_gg ?? "",
        })
    }, [player, socialForm])

    const handleSaveSocials = useCallback(async () => {
        const data = socialForm.getValues()
        setStatusMsg(null)

        try {
            await updateProfile.mutateAsync({
                socials: {
                    twitch: data.twitch || null,
                    youtube: data.youtube || null,
                    twitter: data.twitter || null,
                    bluesky: data.bluesky || null,
                    therun_gg: data.therun_gg || null,
                },
            })

            setStatusMsg({
                type: "success",
                text: "Social links updated.",
            })
        } catch (err) {
            setStatusMsg({
                type: "error",
                text: err instanceof Error
                    ? err.message
                    : "Update failed.",
            })
            throw err
        }
    }, [socialForm, updateProfile])

    const handleDiscard = useCallback(() => {
        if (!player) return
        socialForm.reset({
            twitch: player.socials.twitch ?? "",
            youtube: player.socials.youtube ?? "",
            twitter: player.socials.twitter ?? "",
            bluesky: player.socials.bluesky ?? "",
            therun_gg: player.socials.therun_gg ?? "",
        })
        setStatusMsg(null)
    }, [player, socialForm])

    const {
        isBlocked,
        handleSave: guardSave,
        handleDiscard: guardDiscard,
        handleCancel: guardCancel,
    } = useUnsavedChangesGuard({
        isDirty: socialForm.formState.isDirty,
        onSave: handleSaveSocials,
        onDiscard: handleDiscard,
    })

    if (!player) return null

    const onSubmit = socialForm.handleSubmit(async () => {
        await handleSaveSocials()
    })

    return (
        <div className="flex flex-col gap-6">
            <section className={panelClass}>
                <h2 className="text-xl font-semibold">
                    Social Media
                </h2>
                <p className={cn(
                    "text-sm text-muted-foreground",
                    "mb-4",
                )}>
                    Link your social media profiles
                </p>
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="twitch">
                                Twitch
                            </Label>
                            <Input
                                id="twitch"
                                type="url"
                                placeholder="https://twitch.tv/..."
                                {...socialForm.register(
                                    "twitch",
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="youtube">
                                YouTube
                            </Label>
                            <Input
                                id="youtube"
                                type="url"
                                placeholder="https://youtube.com/..."
                                {...socialForm.register(
                                    "youtube",
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="twitter">
                                Twitter
                            </Label>
                            <Input
                                id="twitter"
                                type="url"
                                placeholder="https://twitter.com/..."
                                {...socialForm.register(
                                    "twitter",
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="bluesky">
                                Bluesky
                            </Label>
                            <Input
                                id="bluesky"
                                type="url"
                                placeholder="https://bsky.app/profile/..."
                                {...socialForm.register(
                                    "bluesky",
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="therun_gg">
                                therun.gg
                            </Label>
                            <Input
                                id="therun_gg"
                                type="text"
                                placeholder="username"
                                {...socialForm.register(
                                    "therun_gg",
                                )}
                            />
                        </div>
                    </div>

                    <div className={cn(
                        "border-t border-border/40",
                        "pt-4 mt-2",
                    )}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="discord">
                                Discord
                            </Label>
                            <Input
                                id="discord"
                                value={
                                    player.socials.discord
                                        ?? "Not linked"
                                }
                                disabled
                                className="opacity-60"
                            />
                            <p className={cn(
                                "text-xs",
                                "text-muted-foreground",
                                "flex items-center gap-1",
                            )}>
                                <Info className="size-3" />
                                Discord will be linked via
                                account connection in the
                                future.
                            </p>
                        </div>
                    </div>

                    {statusMsg && (
                        <AlertBanner
                            variant={statusMsg.type}
                        >
                            {statusMsg.text}
                        </AlertBanner>
                    )}

                    <Button
                        type="submit"
                        disabled={
                            updateProfile.isPending
                        }
                    >
                        {updateProfile.isPending
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </form>
            </section>

            <UnsavedChangesDialog
                open={isBlocked}
                onSave={guardSave}
                onDiscard={guardDiscard}
                onCancel={guardCancel}
                isSaving={updateProfile.isPending}
            />
        </div>
    )
}
