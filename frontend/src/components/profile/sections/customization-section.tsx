import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useUpdateProfile } from "@/hooks/auth/useUpdateProfile"
import {
    useUploadProfileBg,
    useDeleteProfileBg,
} from "@/hooks/auth/useProfileBg"
import { normalizeGradients } from "@/lib/gradients"
import {
    GradientUsername,
} from "@/components/profile/gradient-username"
import {
    ColorSlotPicker,
} from "@/components/profile/color-slot-picker"
import { BgUpload } from "@/components/profile/bg-upload"
import {
    useUnsavedChangesGuard,
} from "@/hooks/useUnsavedChangesGuard"
import {
    UnsavedChangesDialog,
} from "@/components/profile/unsaved-changes-dialog"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/ui/panel"
import { cn } from "@/lib/utils"

interface CustomizationFormValues {
    tagline: string
}

type StatusMsg = {
    type: "success" | "error"
    text: string
} | null

export function CustomizationSection() {
    const { player } = useCurrentPlayer()
    const updateProfile = useUpdateProfile()
    const uploadProfileBg = useUploadProfileBg()
    const deleteProfileBg = useDeleteProfileBg()

    const [msg, setMsg] = useState<StatusMsg>(null)

    // Gradient state (managed outside form)
    const [g1, setG1] = useState<string | null>(null)
    const [g2, setG2] = useState<string | null>(null)
    const [g3, setG3] = useState<string | null>(null)
    const [initialG1, setInitialG1] =
        useState<string | null>(null)
    const [initialG2, setInitialG2] =
        useState<string | null>(null)
    const [initialG3, setInitialG3] =
        useState<string | null>(null)

    // Background file state
    const [pendingBgFile, setPendingBgFile] =
        useState<File | null>(null)
    const [bgPreviewUrl, setBgPreviewUrl] =
        useState<string | null>(null)

    const bioForm = useForm<CustomizationFormValues>({
        defaultValues: {
            tagline: "",
        },
    })

    // Sync form + gradients with player data
    useEffect(() => {
        if (!player) return
        const c = player.customizations
        bioForm.reset({
            tagline: c.tagline ?? "",
        })
        setG1(c.gradient_1)
        setG2(c.gradient_2)
        setG3(c.gradient_3)
        setInitialG1(c.gradient_1)
        setInitialG2(c.gradient_2)
        setInitialG3(c.gradient_3)
    }, [player, bioForm])

    // Revoke preview URL on unmount
    useEffect(() => {
        return () => {
            if (bgPreviewUrl) {
                URL.revokeObjectURL(bgPreviewUrl)
            }
        }
    }, [bgPreviewUrl])

    const handleGradientChange = (
        slot: 1 | 2 | 3,
        value: string | null,
    ) => {
        const raw: [
            string | null,
            string | null,
            string | null,
        ] = [g1, g2, g3]
        raw[slot - 1] = value
        const [n1, n2, n3] = normalizeGradients(...raw)
        setG1(n1)
        setG2(n2)
        setG3(n3)
    }

    const gradientsChanged =
        g1 !== initialG1
        || g2 !== initialG2
        || g3 !== initialG3

    const isDirty =
        bioForm.formState.isDirty
        || gradientsChanged
        || !!pendingBgFile

    const handleSave = useCallback(async () => {
        const formData = bioForm.getValues()
        setMsg(null)

        try {
            await updateProfile.mutateAsync({
                customizations: {
                    tagline: formData.tagline || null,
                    gradient_1: g1,
                    gradient_2: g2,
                    gradient_3: g3,
                },
            })

            if (pendingBgFile) {
                await uploadProfileBg.mutateAsync(
                    pendingBgFile,
                )
                setPendingBgFile(null)
                if (bgPreviewUrl) {
                    URL.revokeObjectURL(bgPreviewUrl)
                    setBgPreviewUrl(null)
                }
            }

            setMsg({
                type: "success",
                text: "Customization updated.",
            })
        } catch (err) {
            setMsg({
                type: "error",
                text: err instanceof Error
                    ? err.message
                    : "Update failed.",
            })
            throw err
        }
    }, [
        bioForm,
        updateProfile,
        uploadProfileBg,
        g1,
        g2,
        g3,
        pendingBgFile,
        bgPreviewUrl,
    ])

    const handleDiscard = useCallback(() => {
        if (!player) return
        const c = player.customizations
        bioForm.reset({
            tagline: c.tagline ?? "",
        })
        setG1(c.gradient_1)
        setG2(c.gradient_2)
        setG3(c.gradient_3)
        setInitialG1(c.gradient_1)
        setInitialG2(c.gradient_2)
        setInitialG3(c.gradient_3)
        setPendingBgFile(null)
        if (bgPreviewUrl) {
            URL.revokeObjectURL(bgPreviewUrl)
            setBgPreviewUrl(null)
        }
        setMsg(null)
    }, [player, bioForm, bgPreviewUrl])

    const handleRemoveExistingBg =
        useCallback(async () => {
            try {
                await deleteProfileBg.mutateAsync()
            } catch (err) {
                setMsg({
                    type: "error",
                    text: err instanceof Error
                        ? err.message
                        : "Failed to remove background.",
                })
            }
        }, [deleteProfileBg])

    const {
        isBlocked,
        handleSave: guardSave,
        handleDiscard: guardDiscard,
        handleCancel: guardCancel,
    } = useUnsavedChangesGuard({
        isDirty,
        onSave: handleSave,
        onDiscard: handleDiscard,
    })

    if (!player) return null

    const onSubmit = bioForm.handleSubmit(async () => {
        await handleSave()
    })

    return (
        <div className="flex flex-col gap-6">
            <Panel className="p-5">
                <h2 className="text-xl font-semibold">
                    Customization
                </h2>
                <p className={cn(
                    "text-sm text-muted-foreground",
                    "mb-4",
                )}>
                    Personalize your profile appearance
                </p>

                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tagline">
                                Tagline
                            </Label>
                            <Input
                                id="tagline"
                                placeholder={
                                    "A short tagline..."
                                }
                                maxLength={100}
                                {...bioForm.register(
                                    "tagline",
                                )}
                            />
                        </div>
                    </div>

                    <div className={cn(
                        "border-t border-border/40",
                    )} />

                    <div className="flex flex-col gap-4">
                        <p className="text-sm font-medium">
                            Username Gradient
                        </p>
                        <div className={cn(
                            "flex items-center",
                            "justify-center py-3",
                        )}>
                            <GradientUsername
                                name={player.player.name}
                                gradients={{
                                    gradient_1: g1,
                                    gradient_2: g2,
                                    gradient_3: g3,
                                }}
                                className={cn(
                                    "text-2xl font-bold",
                                )}
                            />
                        </div>
                        <div className={cn(
                            "flex items-center",
                            "justify-center gap-6",
                        )}>
                            <ColorSlotPicker
                                label="Color 1"
                                color={g1}
                                onChange={(v) =>
                                    handleGradientChange(
                                        1,
                                        v,
                                    )
                                }
                            />
                            <ColorSlotPicker
                                label="Color 2"
                                color={g2}
                                onChange={(v) =>
                                    handleGradientChange(
                                        2,
                                        v,
                                    )
                                }
                            />
                            <ColorSlotPicker
                                label="Color 3"
                                color={g3}
                                onChange={(v) =>
                                    handleGradientChange(
                                        3,
                                        v,
                                    )
                                }
                            />
                        </div>
                        <p className={cn(
                            "text-xs text-muted-foreground",
                            "text-center",
                        )}>
                            Click a swatch to open color
                            picker. Clear a slot to reduce
                            gradient stops.
                        </p>
                    </div>

                    <div className={cn(
                        "border-t border-border/40",
                    )} />

                    <div className="flex flex-col gap-4">
                        <p className="text-sm font-medium">
                            Profile Background
                        </p>
                        <BgUpload
                            currentBg={
                                player.customizations
                                    .profile_bg
                            }
                            pendingFile={pendingBgFile}
                            previewUrl={bgPreviewUrl}
                            onFileSelect={(file, url) => {
                                setPendingBgFile(file)
                                setBgPreviewUrl(url)
                            }}
                            onFileClear={() => {
                                setPendingBgFile(null)
                                if (bgPreviewUrl) {
                                    URL.revokeObjectURL(
                                        bgPreviewUrl,
                                    )
                                    setBgPreviewUrl(null)
                                }
                            }}
                            onRemoveExisting={
                                handleRemoveExistingBg
                            }
                        />
                    </div>

                    {msg && (
                        <AlertBanner variant={msg.type}>
                            {msg.text}
                        </AlertBanner>
                    )}

                    <Button
                        type="submit"
                        disabled={
                            updateProfile.isPending
                            || uploadProfileBg.isPending
                        }
                    >
                        {(updateProfile.isPending
                            || uploadProfileBg.isPending)
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </form>
            </Panel>

            <UnsavedChangesDialog
                open={isBlocked}
                onSave={guardSave}
                onDiscard={guardDiscard}
                onCancel={guardCancel}
                isSaving={
                    updateProfile.isPending
                    || uploadProfileBg.isPending
                }
            />
        </div>
    )
}
