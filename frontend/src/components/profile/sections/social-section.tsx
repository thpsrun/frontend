import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useUpdateProfile } from "@/hooks/auth/useUpdateProfile"
import { AlertBanner } from "@/components/ui/alert-banner"
import { SectionDivider } from "@/components/ui/section-divider"
import { FormField } from "@/components/profile/form-field"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import {
    UnsavedChangesGuard,
} from "@/components/profile/unsaved-changes-guard"
import { Info } from "lucide-react"
import type { StatusMsg } from "@/types/shared"
import { cn, getErrorMessage } from "@/lib/utils"

interface SocialFormValues {
    twitch: string
    youtube: string
    twitter: string
    bluesky: string
    therun_gg: string
}

export function SocialSection() {
    const { player } = useCurrentPlayer()
    const updateProfile = useUpdateProfile()

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

            toast.success("Social Links Updated!")
        } catch (err) {
            const text = getErrorMessage(err, "Update Failed...")
            setStatusMsg({ type: "error", text })
            toast.error(text)
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

    if (!player) return null

    const onSubmit = socialForm.handleSubmit(async () => {
        await handleSaveSocials()
    })

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel
                title="Social Media"
                description="Link your social media profiles"
            >
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-3">
                        <FormField
                            label="Twitch"
                            id="twitch"
                            type="url"
                            placeholder="https://twitch.tv/..."
                            {...socialForm.register("twitch")}
                        />
                        <FormField
                            label="YouTube"
                            id="youtube"
                            type="url"
                            placeholder="https://youtube.com/..."
                            {...socialForm.register("youtube")}
                        />
                        <FormField
                            label="Twitter"
                            id="twitter"
                            type="url"
                            placeholder="https://twitter.com/..."
                            {...socialForm.register("twitter")}
                        />
                        <FormField
                            label="Bluesky"
                            id="bluesky"
                            type="url"
                            placeholder="https://bsky.app/profile/..."
                            {...socialForm.register("bluesky")}
                        />
                        <FormField
                            label="therun.gg"
                            id="therun_gg"
                            type="text"
                            placeholder="username"
                            {...socialForm.register("therun_gg")}
                        />
                    </div>

                    <SectionDivider>
                        <FormField
                            label="Discord"
                            id="discord"
                            value={
                                player.socials.discord
                                    ?? "Not linked"
                            }
                            disabled
                            className="opacity-60"
                            description={
                                <span className={cn(
                                    "flex items-center gap-1",
                                )}>
                                    <Info className="size-3" />
                                    Discord can be linked from the Security section.
                                </span>
                            }
                        />
                    </SectionDivider>

                    {statusMsg && (
                        <AlertBanner
                            variant={statusMsg.type}
                        >
                            {statusMsg.text}
                        </AlertBanner>
                    )}

                    <SaveButton
                        isPending={updateProfile.isPending}
                    />
                </form>
            </SectionPanel>

            <UnsavedChangesGuard
                isDirty={socialForm.formState.isDirty}
                onSave={handleSaveSocials}
                onDiscard={handleDiscard}
                isSaving={updateProfile.isPending}
            />
        </div>
    )
}
