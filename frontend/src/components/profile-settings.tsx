import { useState, useRef } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UserIcon } from "lucide-react"
import { ModerationSettings } from "@/components/moderation-settings"

export function ProfileSettings() {
    const navigate = useNavigate()
    const {
        player,
        countries,
        isAuthenticated,
        isLoading,
        updateProfile,
        uploadPfp,
        deleteAccount,
        changePassword,
        logout,
        setSrcKey,
        deleteSrcKey,
    } = useAuth()

    // Profile form state - initialized from player data
    const [name, setName] = useState<string | null>(null)
    const [nickname, setNickname] = useState<string | null>(null)
    const [pronouns, setPronouns] = useState<string | null>(null)
    const [countrycode, setCountrycode] = useState<string | null>(null)
    const [twitch, setTwitch] = useState<string | null>(null)
    const [youtube, setYoutube] = useState<string | null>(null)
    const [twitter, setTwitter] = useState<string | null>(null)
    const [bluesky, setBluesky] = useState<string | null>(null)
    const [discord, setDiscord] = useState<string | null>(null)

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")

    // Danger zone state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmName, setDeleteConfirmName] = useState("")

    // Messages
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [deleteMsg, setDeleteMsg] = useState<string | null>(null)

    // PFP state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingPfpFile, setPendingPfpFile] = useState<File | null>(null)
    const [pfpPreviewUrl, setPfpPreviewUrl] = useState<string | null>(null)
    const [pfpVersion, setPfpVersion] = useState(0)

    // Track if form has been initialized from player data
    const [initialized, setInitialized] = useState(false)

    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
        navigate("/login")
        return null
    }

    if (isLoading || !player) {
        return null
    }

    // Initialize form state from player data (once)
    if (!initialized) {
        setName(player.name)
        setNickname(player.nickname)
        setPronouns(player.pronouns)
        setCountrycode(player.countrycode)
        setTwitch(player.twitch)
        setYoutube(player.youtube)
        setTwitter(player.twitter)
        setBluesky(player.bluesky)
        setDiscord(player.discord)
        setInitialized(true)
    }

    const avatarUrl = player.pfp
        ? `${BACKEND_URL}${player.pfp}?v=${pfpVersion}`
        : null

    const handlePfpSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setProfileMsg(null)

        if (file.size > 5 * 1024 * 1024) {
            setProfileMsg({ type: "error", text: "File must be under 5 MB." })
            return
        }

        if (!file.type.startsWith("image/")) {
            setProfileMsg({ type: "error", text: "File must be an image." })
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

    const handleSaveProfile = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setProfileMsg(null)

        try {
            await updateProfile.mutateAsync({
                name: name ?? undefined,
                nickname,
                pronouns,
                countrycode: countrycode ?? undefined,
                twitch,
                youtube,
                twitter,
                bluesky,
                discord,
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

            setProfileMsg({ type: "success", text: "Profile updated." })
        } catch (err) {
            setProfileMsg({
                type: "error",
                text: err instanceof Error ? err.message : "Update failed.",
            })
        }
    }

    const handleChangePassword = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setPasswordMsg(null)

        if (newPassword !== confirmNewPassword) {
            setPasswordMsg({ type: "error", text: "New passwords do not match." })
            return
        }

        if (newPassword.length < 8 || newPassword.length > 64) {
            setPasswordMsg({ type: "error", text: "Password must be 8-64 characters." })
            return
        }

        if (!/^[\x20-\x7E]+$/.test(newPassword)) {
            setPasswordMsg({
                type: "error",
                text: "Password can only contain printable ASCII characters.",
            })
            return
        }

        try {
            await changePassword.mutateAsync({
                current_password: currentPassword,
                new_password: newPassword,
            })
            setPasswordMsg({ type: "success", text: "Password changed." })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
        } catch (err) {
            setPasswordMsg({
                type: "error",
                text: err instanceof Error ? err.message : "Password change failed.",
            })
        }
    }

    const handleDeleteAccount = async () => {
        setDeleteMsg(null)

        if (deleteConfirmName.toLowerCase() !== player.name.toLowerCase()) {
            setDeleteMsg("Name does not match.")
            return
        }

        try {
            await deleteAccount.mutateAsync()
            await logout.mutateAsync()
            navigate("/")
        } catch (err) {
            setDeleteMsg(
                err instanceof Error ? err.message : "Account deletion failed.",
            )
        }
    }

    return (
        <div className="flex justify-center pt-12">
            <div className="w-full max-w-[600px] flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Edit Profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
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
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {pendingPfpFile ? "Change Image" : "Upload Image"}
                                    </Button>
                                    {pendingPfpFile && (
                                        <p className="text-xs text-muted-foreground">
                                            New image selected — save to apply.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={name ?? ""}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="nickname">Nickname</Label>
                                    <Input
                                        id="nickname"
                                        value={nickname ?? ""}
                                        onChange={(e) => setNickname(e.target.value || null)}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="pronouns">Pronouns</Label>
                                    <Input
                                        id="pronouns"
                                        value={pronouns ?? ""}
                                        onChange={(e) => setPronouns(e.target.value || null)}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="countrycode">Country</Label>
                                    <Select
                                        value={countrycode ?? ""}
                                        onValueChange={(val) => setCountrycode(val || null)}
                                    >
                                        <SelectTrigger id="countrycode" className="w-full">
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mt-2">
                                <p className="text-sm font-medium mb-3">Social Links</p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="twitch">Twitch</Label>
                                        <Input
                                            id="twitch"
                                            type="url"
                                            value={twitch ?? ""}
                                            onChange={(e) => setTwitch(e.target.value || null)}
                                            placeholder="https://twitch.tv/..."
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="youtube">YouTube</Label>
                                        <Input
                                            id="youtube"
                                            type="url"
                                            value={youtube ?? ""}
                                            onChange={(e) => setYoutube(e.target.value || null)}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="twitter">Twitter</Label>
                                        <Input
                                            id="twitter"
                                            type="url"
                                            value={twitter ?? ""}
                                            onChange={(e) => setTwitter(e.target.value || null)}
                                            placeholder="https://twitter.com/..."
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="bluesky">Bluesky</Label>
                                        <Input
                                            id="bluesky"
                                            type="url"
                                            value={bluesky ?? ""}
                                            onChange={(e) => setBluesky(e.target.value || null)}
                                            placeholder="https://bsky.app/profile/..."
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="discord">Discord</Label>
                                        <Input
                                            id="discord"
                                            type="text"
                                            value={discord ?? ""}
                                            onChange={(e) => setDiscord(e.target.value || null)}
                                            placeholder="aeiou"
                                        />
                                    </div>
                                </div>
                            </div>

                            {profileMsg && (
                                <div className={`rounded-md px-4 py-3 text-sm ${
                                    profileMsg.type === "success"
                                        ? "bg-green-500/10 border border-green-500/20 text-green-500"
                                        : "bg-destructive/10 border border-destructive/20 text-destructive"
                                }`}>
                                    {profileMsg.text}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={
                                    updateProfile.isPending || uploadPfp.isPending
                                }
                            >
                                {(updateProfile.isPending || uploadPfp.isPending)
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
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {passwordMsg && (
                                <div className={`rounded-md px-4 py-3 text-sm ${
                                    passwordMsg.type === "success"
                                        ? "bg-green-500/10 border border-green-500/20 text-green-500"
                                        : "bg-destructive/10 border border-destructive/20 text-destructive"
                                }`}>
                                    {passwordMsg.text}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={changePassword.isPending}
                            >
                                {changePassword.isPending ? "Changing..." : "Change Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Connected Accounts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>
                            Manage linked accounts and authentication methods.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between rounded-md border px-4 py-3">
                                <span className="text-sm font-medium">Discord</span>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-4 py-3">
                                <span className="text-sm font-medium">Twitch</span>
                                <Button variant="outline" size="sm" disabled>
                                    Coming Soon
                                </Button>
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-4 py-3">
                                <span className="text-sm font-medium">Passkeys</span>
                                <Button variant="outline" size="sm" disabled>
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
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Permanently delete your account. Your runs will be preserved
                            under &quot;Anonymous&quot;.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showDeleteConfirm ? (
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete Account
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Type <strong>{player.name}</strong> to confirm account
                                    deletion. This action cannot be undone.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="delete-confirm">Display Name</Label>
                                    <Input
                                        id="delete-confirm"
                                        value={deleteConfirmName}
                                        onChange={(e) => setDeleteConfirmName(e.target.value)}
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
                                        disabled={deleteAccount.isPending}
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
