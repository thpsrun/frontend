import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/hooks/auth/useAuth"
import { BACKEND_URL } from "@/constants"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
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
import { UserIcon } from "lucide-react"
import { ModerationSettings } from "@/components/profile/moderation-settings"

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

    // Profile form via React Hook Form
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

    // Password form via React Hook Form
    const passwordForm = useForm<PasswordFormValues>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    // Reset profile form when player data arrives
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
    }, [player, profileForm])

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

        if (pfpPreviewUrl) {
            URL.revokeObjectURL(pfpPreviewUrl)
        }
        setPendingPfpFile(file)
        setPfpPreviewUrl(URL.createObjectURL(file))

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
                    countrycode: data.countrycode || undefined,
                    twitch: data.twitch || null,
                    youtube: data.youtube || null,
                    twitter: data.twitter || null,
                    bluesky: data.bluesky || null,
                    discord: data.discord || null,
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

    const msgClasses = (type: "success" | "error") =>
        type === "success"
            ? "bg-success/10 border border-success/20 text-success"
            : "bg-destructive/10 border border-destructive/20 text-destructive"

    return (
        <div className="flex justify-center pt-12">
            <div className="w-full max-w-[600px] flex flex-col gap-6">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Edit Profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSaveProfile}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-6">
                                <div className="shrink-0">
                                    {(pfpPreviewUrl || avatarUrl) ? (
                                        <img
                                            src={pfpPreviewUrl ?? avatarUrl!}
                                            alt={player.name}
                                            className="size-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                                            <UserIcon className="size-10 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
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
                                        <p className="text-xs text-muted-foreground">
                                            New image selected - save to apply.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">
                                        Display Name
                                    </Label>
                                    <Input
                                        id="name"
                                        {...profileForm.register("name")}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="nickname">
                                        Nickname
                                    </Label>
                                    <Input
                                        id="nickname"
                                        placeholder="Optional"
                                        {...profileForm.register("nickname")}
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
                                        {...profileForm.register("pronouns")}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="countrycode">
                                        Country
                                    </Label>
                                    <Controller
                                        control={profileForm.control}
                                        name="countrycode"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger
                                                    id="countrycode"
                                                    className="w-full"
                                                >
                                                    <SelectValue
                                                        placeholder="Select a country"
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((c) => (
                                                        <SelectItem
                                                            key={c.id}
                                                            value={c.id}
                                                        >
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mt-2">
                                <p className="text-sm font-medium mb-3">
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
                                            {...profileForm.register("twitch")}
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
                                            {...profileForm.register("youtube")}
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
                                            {...profileForm.register("twitter")}
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
                                            {...profileForm.register("bluesky")}
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
                                            {...profileForm.register("discord")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {profileMsg && (
                                <div className={`rounded-md px-4 py-3 text-sm ${
                                    msgClasses(profileMsg.type)
                                }`}>
                                    {profileMsg.text}
                                </div>
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
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleChangePassword}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="current-password">
                                    Current Password
                                </Label>
                                <Input
                                    id="current-password"
                                    type="password"
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
                                <Input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    {...passwordForm.register(
                                        "newPassword",
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirm-new-password">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="confirm-new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    {...passwordForm.register(
                                        "confirmNewPassword",
                                    )}
                                />
                            </div>

                            {passwordMsg && (
                                <div className={`rounded-md px-4 py-3 text-sm ${
                                    msgClasses(passwordMsg.type)
                                }`}>
                                    {passwordMsg.text}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={changePassword.isPending}
                            >
                                {changePassword.isPending
                                    ? "Changing..."
                                    : "Change Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Connected Accounts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>
                            Manage linked accounts and authentication
                            methods.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between rounded-md border px-4 py-3">
                                <span className="text-sm font-medium">
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
                            <div className="flex items-center justify-between rounded-md border px-4 py-3">
                                <span className="text-sm font-medium">
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
                            <div className="flex items-center justify-between rounded-md border px-4 py-3">
                                <span className="text-sm font-medium">
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
                    </CardContent>
                </Card>

                {player.is_moderator && (
                    <ModerationSettings
                        player={player}
                        setSrcKey={setSrcKey}
                        deleteSrcKey={deleteSrcKey}
                    />
                )}

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Permanently delete your account. Your runs
                            will be preserved under &quot;Anonymous&quot;.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    <strong>{player.name}</strong>{" "}
                                    to confirm account deletion.
                                    This action cannot be undone.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="delete-confirm">
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
                                    <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                                        {deleteMsg}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={
                                            deleteAccount.isPending
                                        }
                                    >
                                        {deleteAccount.isPending
                                            ? "Deleting..."
                                            : "Permanently Delete"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteConfirm(false)
                                            setDeleteConfirmName("")
                                            setDeleteMsg(null)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
