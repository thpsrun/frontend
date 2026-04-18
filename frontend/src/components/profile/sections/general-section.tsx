import { useState, useRef, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/auth/useAuth"
import { BACKEND_URL } from "@/constants"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog"
import {
    useUnsavedChangesGuard,
} from "@/hooks/useUnsavedChangesGuard"
import {
    UnsavedChangesDialog,
} from "@/components/profile/unsaved-changes-dialog"
import { UserIcon, Info } from "lucide-react"
import {
    CountryFlag,
    type CountryCode,
} from "@/lib/leaderboard-helpers"
import { cn } from "@/lib/utils"

interface GeneralFormValues {
    name: string
    nickname: string
    pronouns: string
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

export function GeneralSection() {
    const {
        player,
        countries,
        updateProfile,
        uploadPfp,
    } = useAuth()

    // Country managed outside React Hook Form to avoid
    // Controller/reset race condition
    const [selectedCountry, setSelectedCountry] = useState("")
    const [initialCountry, setInitialCountry] = useState("")
    const [countryReady, setCountryReady] = useState(false)
    const [exStream, setExStream] = useState(false)
    const [initialExStream, setInitialExStream] = useState(false)

    const [statusMsg, setStatusMsg] = useState<StatusMsg>(null)

    // PFP state
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

    // Sync form + country with player data when it arrives
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
        const exStreamVal = player.player.ex_stream ?? false
        setExStream(exStreamVal)
        setInitialExStream(exStreamVal)
        setCountryReady(true)
    }, [player, profileForm])

    // Revoke object URLs on unmount
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
    const exStreamChanged = exStream !== initialExStream
    const isDirty =
        profileForm.formState.isDirty
        || countryChanged
        || exStreamChanged
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
                    ex_stream: exStream,
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

            setStatusMsg({
                type: "success",
                text: "Profile updated.",
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
    }, [
        profileForm,
        updateProfile,
        uploadPfp,
        selectedCountry,
        exStream,
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
        const exStreamVal = player.player.ex_stream ?? false
        setExStream(exStreamVal)
        setInitialExStream(exStreamVal)
        setPendingPfpFile(null)
        if (pfpPreviewUrl) {
            URL.revokeObjectURL(pfpPreviewUrl)
            setPfpPreviewUrl(null)
        }
        setStatusMsg(null)
    }, [player, profileForm, pfpPreviewUrl])

    const {
        isBlocked,
        handleSave: guardSave,
        handleDiscard: guardDiscard,
        handleCancel: guardCancel,
    } = useUnsavedChangesGuard({
        isDirty,
        onSave: handleSaveProfile,
        onDiscard: handleDiscard,
    })

    if (!player) return null

    const avatarUrl = player.player.pfp
        ? `${BACKEND_URL}${player.player.pfp}?v=${pfpVersion}`
        : null

    const handlePfpSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
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

    return (
        <div className="flex flex-col gap-6">
            <section className={panelClass}>
                <h2 className="text-xl font-semibold">
                    General
                </h2>
                <p className={cn(
                    "text-sm text-muted-foreground",
                    "mb-4",
                )}>
                    Manage your profile information
                </p>
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
                                New image selected -
                                save to apply.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">
                                Display Name
                            </Label>
                            <Input
                                id="name"
                                {...profileForm.register(
                                    "name",
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="nickname">
                                Nickname
                            </Label>
                            <Input
                                id="nickname"
                                placeholder="Optional"
                                {...profileForm.register(
                                    "nickname",
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="pronouns">
                                Pronouns
                            </Label>
                            <Input
                                id="pronouns"
                                placeholder="Optional"
                                {...profileForm.register(
                                    "pronouns",
                                )}
                            />
                        </div>
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

                    <div className={cn(
                        "border-t border-border/40",
                        "pt-4 mt-2",
                    )}>
                        <p className={cn(
                            "text-sm font-medium mb-3",
                        )}>
                            Preferences
                        </p>
                        <div className={cn(
                            "flex items-center gap-2",
                        )}>
                            <Checkbox
                                id="ex_stream"
                                checked={exStream}
                                onCheckedChange={(
                                    checked,
                                ) =>
                                    setExStream(
                                        checked === true,
                                    )
                                }
                            />
                            <Label
                                htmlFor="ex_stream"
                                className="cursor-pointer"
                            >
                                Exclude from Streams
                            </Label>
                            <span title="When checked, you will not appear on the website's streams page and not appear on the livestream channel in the Discord server.">
                                <Info className={cn(
                                    "size-4",
                                    "text-muted-foreground",
                                )} />
                            </span>
                        </div>
                    </div>

                    <div className={cn(
                        "border-t border-border/40",
                        "pt-4 mt-2",
                    )}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={
                                    player.player.username
                                }
                                disabled
                                className="opacity-60"
                            />
                            <p className={cn(
                                "text-xs",
                                "text-muted-foreground",
                            )}>
                                This username cannot be changed by normal means. If you wanna change it, contact Anastasia.
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
                            || uploadPfp.isPending
                        }
                    >
                        {(updateProfile.isPending
                            || uploadPfp.isPending)
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </form>
            </section>

            <AvatarCropDialog
                imageUrl={rawImageUrl}
                open={cropDialogOpen}
                onCrop={handleCropConfirm}
                onCancel={handleCropCancel}
            />

            <UnsavedChangesDialog
                open={isBlocked}
                onSave={guardSave}
                onDiscard={guardDiscard}
                onCancel={guardCancel}
                isSaving={
                    updateProfile.isPending
                    || uploadPfp.isPending
                }
            />
        </div>
    )
}
