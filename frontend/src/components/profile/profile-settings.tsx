import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/auth/useAuth"
import { BACKEND_URL } from "@/constants"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validatePassword } from "@/lib/validation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UserIcon, Eye, EyeOff, Info } from "lucide-react"
import { ModerationSettings } from "@/components/profile/moderation-settings"
import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
    CountryFlag,
    type CountryCode,
} from "@/lib/leaderboard-helpers"
import { cn } from "@/lib/utils"

interface ProfileFormValues {
    name: string
    nickname: string
    pronouns: string
    countrycode: string
    twitch: string
    youtube: string
    twitter: string
    bluesky: string
    discord: string
}

interface PasswordFormValues {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
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

export function ProfileSettings() {
    const navigate = useNavigate()
    const {
        player,
        countries,
        updateProfile,
        uploadPfp,
        deleteAccount,
        changePassword,
        logout,
        setSrcKey,
        deleteSrcKey,
    } = useAuth()

    // Country managed outside React Hook Form to avoid Controller/reset race condition
    const [selectedCountry, setSelectedCountry] = useState("")
    const [countryReady, setCountryReady] = useState(false)
    const [exStream, setExStream] = useState(false)

    const profileForm = useForm<ProfileFormValues>({
        defaultValues: {
            name: "",
            nickname: "",
            pronouns: "",
            countrycode: "",
            twitch: "",
            youtube: "",
            twitter: "",
            bluesky: "",
            discord: "",
        },
    })

    // Sync form + country with player data when it arrives
    useEffect(() => {
        if (!player) return
        profileForm.reset({
            name: player.name ?? "",
            nickname: player.nickname ?? "",
            pronouns: player.pronouns ?? "",
            countrycode: player.countrycode ?? "",
            twitch: player.twitch ?? "",
            youtube: player.youtube ?? "",
            twitter: player.twitter ?? "",
            bluesky: player.bluesky ?? "",
            discord: player.discord ?? "",
        })
        setSelectedCountry(player.countrycode ?? "")
        setExStream(player.ex_stream ?? false)
        setCountryReady(true)
    }, [player, profileForm])

    const passwordForm = useForm<PasswordFormValues>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)

    // Danger zone state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmName, setDeleteConfirmName] = useState("")

    // Messages
    const [profileMsg, setProfileMsg] = useState<StatusMsg>(null)
    const [passwordMsg, setPasswordMsg] = useState<StatusMsg>(null)
    const [deleteMsg, setDeleteMsg] = useState<string | null>(null)

    // PFP state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingPfpFile, setPendingPfpFile] = useState<File | null>(null)
    const [pfpPreviewUrl, setPfpPreviewUrl] = useState<string | null>(null)
    const [pfpVersion, setPfpVersion] = useState(0)
    const [rawImageUrl, setRawImageUrl] = useState<string | null>(null)
    const [cropDialogOpen, setCropDialogOpen] = useState(false)

    useEffect(() => {
        return () => {
            if (rawImageUrl) URL.revokeObjectURL(rawImageUrl)
            if (pfpPreviewUrl) URL.revokeObjectURL(pfpPreviewUrl)
        }
    }, [rawImageUrl, pfpPreviewUrl])

    if (!player) return null

    const avatarUrl = player.pfp
        ? `${BACKEND_URL}${player.pfp}?v=${pfpVersion}`
        : null

    const handlePfpSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        setProfileMsg(null)

        if (file.size > 5 * 1024 * 1024) {
            setProfileMsg({
                type: "error",
                text: "File must be under 5 MB.",
            })
            return
        }

        if (!file.type.startsWith("image/")) {
            setProfileMsg({
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

    const handleSaveProfile = profileForm.handleSubmit(
        async (data) => {
            setProfileMsg(null)

            try {
                await updateProfile.mutateAsync({
                    name: data.name || undefined,
                    nickname: data.nickname || null,
                    pronouns: data.pronouns || null,
                    countrycode: selectedCountry || undefined,
                    twitch: data.twitch || null,
                    youtube: data.youtube || null,
                    twitter: data.twitter || null,
                    bluesky: data.bluesky || null,
                    discord: data.discord || null,
                    ex_stream: exStream,
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

                setProfileMsg({
                    type: "success",
                    text: "Profile updated.",
                })
            } catch (err) {
                setProfileMsg({
                    type: "error",
                    text: err instanceof Error
                        ? err.message
                        : "Update failed.",
                })
            }
        },
    )

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
                    text: err instanceof Error
                        ? err.message
                        : "Password change failed.",
                })
            }
        },
    )

    const handleDeleteAccount = async () => {
        setDeleteMsg(null)

        if (
            deleteConfirmName.toLowerCase()
            !== player.name.toLowerCase()
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
        <div className="flex justify-center pt-12">
            <div className="w-full max-w-150 flex flex-col gap-6">
                {/* Profile */}
                <section className={panelClass}>
                    <h2 className="text-xl font-semibold">
                        Profile
                    </h2>
                    <p className={cn(
                        "text-sm text-muted-foreground",
                        "mb-4",
                    )}>
                        Edit Profile
                    </p>
                    <form
                        onSubmit={handleSaveProfile}
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
                                    alt={player.name}
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
                                Social Links
                            </p>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="twitch">
                                        Twitch
                                    </Label>
                                    <Input
                                        id="twitch"
                                        type="url"
                                        placeholder="https://twitch.tv/..."
                                        {...profileForm.register(
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
                                        {...profileForm.register(
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
                                        {...profileForm.register(
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
                                        {...profileForm.register(
                                            "bluesky",
                                        )}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="discord">
                                        Discord
                                    </Label>
                                    <Input
                                        id="discord"
                                        type="text"
                                        placeholder="aeiou"
                                        {...profileForm.register(
                                            "discord",
                                        )}
                                    />
                                </div>
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

                        {profileMsg && (
                            <AlertBanner
                                variant={profileMsg.type}
                            >
                                {profileMsg.text}
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

                {/* Change Password */}
                <section className={panelClass}>
                    <h2 className={cn(
                        "text-xl font-semibold mb-4",
                    )}>
                        Change Password
                    </h2>
                    <form
                        onSubmit={handleChangePassword}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="current-password">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrentPw
                                        ? "text" : "password"}
                                    autoComplete={
                                        "current-password"
                                    }
                                    required
                                    {...passwordForm.register(
                                        "currentPassword",
                                    )}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowCurrentPw(
                                            (v) => !v,
                                        )
                                    }
                                    className={cn(
                                        "absolute right-2.5",
                                        "top-1/2 -translate-y-1/2",
                                        "text-muted-foreground",
                                        "hover:text-foreground",
                                    )}
                                >
                                    {showCurrentPw
                                        ? <EyeOff
                                            className="size-4"
                                        />
                                        : <Eye
                                            className="size-4"
                                        />}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="new-password">
                                New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNewPw
                                        ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    {...passwordForm.register(
                                        "newPassword",
                                    )}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowNewPw(
                                            (v) => !v,
                                        )
                                    }
                                    className={cn(
                                        "absolute right-2.5",
                                        "top-1/2 -translate-y-1/2",
                                        "text-muted-foreground",
                                        "hover:text-foreground",
                                    )}
                                >
                                    {showNewPw
                                        ? <EyeOff
                                            className="size-4"
                                        />
                                        : <Eye
                                            className="size-4"
                                        />}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="confirm-new-password"
                            >
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirm-new-password"
                                    type={showConfirmPw
                                        ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    {...passwordForm.register(
                                        "confirmNewPassword",
                                    )}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowConfirmPw(
                                            (v) => !v,
                                        )
                                    }
                                    className={cn(
                                        "absolute right-2.5",
                                        "top-1/2 -translate-y-1/2",
                                        "text-muted-foreground",
                                        "hover:text-foreground",
                                    )}
                                >
                                    {showConfirmPw
                                        ? <EyeOff
                                            className="size-4"
                                        />
                                        : <Eye
                                            className="size-4"
                                        />}
                                </button>
                            </div>
                        </div>

                        {passwordMsg && (
                            <AlertBanner
                                variant={passwordMsg.type}
                            >
                                {passwordMsg.text}
                            </AlertBanner>
                        )}

                        <Button
                            type="submit"
                            disabled={
                                changePassword.isPending
                            }
                        >
                            {changePassword.isPending
                                ? "Changing..."
                                : "Change Password"}
                        </Button>
                    </form>
                </section>

                {/* Connected Accounts */}
                <section className={panelClass}>
                    <h2 className="text-xl font-semibold">
                        Connected Accounts
                    </h2>
                    <p className={cn(
                        "text-sm text-muted-foreground",
                        "mb-4",
                    )}>
                        Manage linked accounts and
                        authentication methods.
                    </p>
                    <div className="flex flex-col gap-3">
                        <div className={cn(
                            "flex items-center",
                            "justify-between rounded-md",
                            "border border-border/40",
                            "px-4 py-3",
                        )}>
                            <span className={cn(
                                "text-sm font-medium",
                            )}>
                                Discord
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </div>
                        <div className={cn(
                            "flex items-center",
                            "justify-between rounded-md",
                            "border border-border/40",
                            "px-4 py-3",
                        )}>
                            <span className={cn(
                                "text-sm font-medium",
                            )}>
                                Twitch
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </div>
                        <div className={cn(
                            "flex items-center",
                            "justify-between rounded-md",
                            "border border-border/40",
                            "px-4 py-3",
                        )}>
                            <span className={cn(
                                "text-sm font-medium",
                            )}>
                                Passkeys
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </div>
                    </div>
                </section>

                {/* SRC API Key (Moderation) */}
                <ModerationSettings
                    player={player}
                    setSrcKey={setSrcKey}
                    deleteSrcKey={deleteSrcKey}
                />

                {/* Danger Zone */}
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
                                <strong>{player.name}</strong>
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
                                    placeholder={player.name}
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
                <AvatarCropDialog
                    imageUrl={rawImageUrl}
                    open={cropDialogOpen}
                    onCrop={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            </div>
        </div>
    )
}
