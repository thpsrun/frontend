import { useState, useRef, useEffect, useCallback } from "react"
import type { ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useCountries } from "@/hooks/auth/useCountries"
import { useUpdateProfile } from "@/hooks/auth/useUpdateProfile"
import { useUploadPfp } from "@/hooks/auth/useUploadPfp"
import { BACKEND_URL } from "@/constants"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SectionDivider } from "@/components/ui/section-divider"
import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog"
import { FormField } from "@/components/profile/form-field"
import { SaveButton } from "@/components/profile/save-button"
import { SectionPanel } from "@/components/profile/section-panel"
import {
    UnsavedChangesGuard,
} from "@/components/profile/unsaved-changes-guard"
import { UserIcon } from "lucide-react"
import {
    CountryFlag,
    type CountryCode,
} from "@/lib/leaderboard-helpers"
import type { StatusMsg } from "@/types/shared"
import { cn, getErrorMessage } from "@/lib/utils"

interface GeneralFormValues {
    name: string
    nickname: string
    pronouns: string
}

export function GeneralSection() {
    const { player } = useCurrentPlayer()
    const { countries } = useCountries()
    const updateProfile = useUpdateProfile()
    const uploadPfp = useUploadPfp()

    const [selectedCountry, setSelectedCountry] = useState("")
    const [initialCountry, setInitialCountry] = useState("")
    const [countryReady, setCountryReady] = useState(false)

    const [statusMsg, setStatusMsg] = useState<StatusMsg>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingPfpFile, setPendingPfpFile] =
        useState<File | null>(null)
    const [pfpPreviewUrl, setPfpPreviewUrl] =
        useState<string | null>(null)
    const [pfpVersion, setPfpVersion] = useState(0)
    const [rawImageUrl, setRawImageUrl] =
        useState<string | null>(null)
    const [cropDialogOpen, setCropDialogOpen] = useState(false)

    const profileForm = useForm<GeneralFormValues>({
        defaultValues: {
            name: "",
            nickname: "",
            pronouns: "",
        },
    })

    useEffect(() => {
        if (!player) return
        profileForm.reset({
            name: player.player.name ?? "",
            nickname: player.player.nickname ?? "",
            pronouns: player.player.pronouns ?? "",
        })
        const countryId = player.player.country?.id ?? ""
        setSelectedCountry(countryId)
        setInitialCountry(countryId)
        setCountryReady(true)
    }, [player, profileForm])

    useEffect(() => {
        return () => {
            if (rawImageUrl) URL.revokeObjectURL(rawImageUrl)
            if (pfpPreviewUrl) {
                URL.revokeObjectURL(pfpPreviewUrl)
            }
        }
    }, [rawImageUrl, pfpPreviewUrl])

    const countryChanged =
        selectedCountry !== initialCountry
    const isDirty =
        profileForm.formState.isDirty
        || countryChanged
        || !!pendingPfpFile

    const handleSaveProfile = useCallback(async () => {
        const data = profileForm.getValues()
        setStatusMsg(null)

        try {
            await updateProfile.mutateAsync({
                player: {
                    name: data.name || undefined,
                    nickname: data.nickname || null,
                    pronouns: data.pronouns || null,
                    country: selectedCountry || undefined,
                },
            })

            if (pendingPfpFile) {
                await uploadPfp.mutateAsync(pendingPfpFile)
                setPendingPfpFile(null)
                setPfpVersion((v) => v + 1)
                if (pfpPreviewUrl) {
                    URL.revokeObjectURL(pfpPreviewUrl)
                    setPfpPreviewUrl(null)
                }
            }

            toast.success("Profile Updated!")
        } catch (err) {
            const text = getErrorMessage(err, "Update Failed...")
            setStatusMsg({ type: "error", text })
            toast.error(text)
            throw err
        }
    }, [
        profileForm,
        updateProfile,
        uploadPfp,
        selectedCountry,
        pendingPfpFile,
        pfpPreviewUrl,
    ])

    const handleDiscard = useCallback(() => {
        if (!player) return
        profileForm.reset({
            name: player.player.name ?? "",
            nickname: player.player.nickname ?? "",
            pronouns: player.player.pronouns ?? "",
        })
        const countryId = player.player.country?.id ?? ""
        setSelectedCountry(countryId)
        setInitialCountry(countryId)
        setPendingPfpFile(null)
        if (pfpPreviewUrl) {
            URL.revokeObjectURL(pfpPreviewUrl)
            setPfpPreviewUrl(null)
        }
        setStatusMsg(null)
    }, [player, profileForm, pfpPreviewUrl])

    if (!player) return null

    const avatarUrl = player.player.pfp
        ? `${BACKEND_URL}${player.player.pfp}?v=${pfpVersion}`
        : null

    const handlePfpSelect = (
        e: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        setStatusMsg(null)

        if (file.size > 5 * 1024 * 1024) {
            setStatusMsg({
                type: "error",
                text: "File must be under 5 MB.",
            })
            return
        }

        if (!file.type.startsWith("image/")) {
            setStatusMsg({
                type: "error",
                text: "File must be an image.",
            })
            return
        }

        if (rawImageUrl) {
            URL.revokeObjectURL(rawImageUrl)
        }
        setRawImageUrl(URL.createObjectURL(file))
        setCropDialogOpen(true)

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleCropConfirm = (blob: Blob) => {
        const file = new File([blob], "avatar.png", {
            type: "image/png",
        })

        if (pfpPreviewUrl) {
            URL.revokeObjectURL(pfpPreviewUrl)
        }
        setPendingPfpFile(file)
        setPfpPreviewUrl(URL.createObjectURL(blob))

        if (rawImageUrl) {
            URL.revokeObjectURL(rawImageUrl)
            setRawImageUrl(null)
        }
        setCropDialogOpen(false)
    }

    const handleCropCancel = () => {
        if (rawImageUrl) {
            URL.revokeObjectURL(rawImageUrl)
            setRawImageUrl(null)
        }
        setCropDialogOpen(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onSubmit = profileForm.handleSubmit(async () => {
        await handleSaveProfile()
    })

    const isPending =
        updateProfile.isPending || uploadPfp.isPending

    return (
        <div className="flex flex-col gap-6">
            <SectionPanel
                title="General"
                description="Manage your profile information"
            >
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4"
                >
                    <div className={cn(
                        "flex flex-col",
                        "items-center gap-3",
                    )}>
                        {(pfpPreviewUrl || avatarUrl) ? (
                            <img
                                src={
                                    pfpPreviewUrl
                                        ?? avatarUrl!
                                }
                                alt={player.player.name}
                                className={cn(
                                    "size-20 rounded-full",
                                    "object-cover",
                                )}
                            />
                        ) : (
                            <div className={cn(
                                "size-20 rounded-full",
                                "bg-muted flex items-center",
                                "justify-center",
                            )}>
                                <UserIcon className={cn(
                                    "size-10",
                                    "text-muted-foreground",
                                )} />
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePfpSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            {pendingPfpFile
                                ? "Change Image"
                                : "Upload Image"}
                        </Button>
                        {pendingPfpFile && (
                            <p className={cn(
                                "text-xs",
                                "text-muted-foreground",
                            )}>
                                New image selected. Save to apply!
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Display Name"
                            id="name"
                            {...profileForm.register("name")}
                        />
                        <FormField
                            label="Nickname"
                            id="nickname"
                            placeholder="Optional"
                            {...profileForm.register("nickname")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Pronouns"
                            id="pronouns"
                            placeholder="Optional"
                            {...profileForm.register("pronouns")}
                        />
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="countrycode">
                                Country
                            </Label>
                            <Select
                                key={countryReady
                                    ? "ready" : "init"}
                                value={selectedCountry}
                                onValueChange={
                                    setSelectedCountry
                                }
                            >
                                <SelectTrigger
                                    id="countrycode"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder="Select"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id}
                                        >
                                            <CountryFlag
                                                countryCode={
                                                    c.id as CountryCode
                                                }
                                                flagUrl={c.flag}
                                                className={cn(
                                                    "size-4",
                                                    "object-contain",
                                                    "inline",
                                                )}
                                            />
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <SectionDivider>
                        <FormField
                            label="Username"
                            id="username"
                            value={player.player.username}
                            disabled
                            className="opacity-60"
                            description="This username cannot be changed by normal means. If you wanna change it, contact Anastasia."
                        />
                    </SectionDivider>

                    {statusMsg && (
                        <AlertBanner
                            variant={statusMsg.type}
                        >
                            {statusMsg.text}
                        </AlertBanner>
                    )}

                    <SaveButton isPending={isPending} />
                </form>
            </SectionPanel>

            <AvatarCropDialog
                imageUrl={rawImageUrl}
                open={cropDialogOpen}
                onCrop={handleCropConfirm}
                onCancel={handleCropCancel}
            />

            <UnsavedChangesGuard
                isDirty={isDirty}
                onSave={handleSaveProfile}
                onDiscard={handleDiscard}
                isSaving={isPending}
            />
        </div>
    )
}
