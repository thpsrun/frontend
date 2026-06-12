import { useEffect, useMemo, useState } from "react"
import type { SyntheticEvent } from "react"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertBanner } from "@/components/common/alert-banner"
import { validateSocialUrl } from "@/lib/validation"
import { getErrorMessage } from "@/lib/utils"
import {
    SOCIAL_PLATFORMS,
    isKnownPlatform,
} from "@/lib/social-platforms"
import {
    useCreateSocial,
    useUpdateSocial,
} from "@/hooks/admin/useNavbarAdmin"
import type { NavbarAdminSocial } from "@/types/admin-navbar"

interface Props {
    open: boolean
    onOpenChange: (v: boolean) => void
    mode: "create" | "edit"
    link: NavbarAdminSocial | null
    existingPlatforms: ReadonlyArray<string>
}

export function SocialFormDialog({
    open,
    onOpenChange,
    mode,
    link,
    existingPlatforms,
}: Props) {
    const [platform, setPlatform] = useState("")
    const [url, setUrl] = useState("")
    const [isVisible, setIsVisible] = useState(true)
    const [errors, setErrors] = useState<{
        platform?: string
        url?: string
        top?: string
    }>({})

    const create = useCreateSocial()
    const update = useUpdateSocial()

    // The dialog stays mounted while closed, so reseed the fields on every open.
    useEffect(() => {
        if (open) {
            setErrors({})
            if (mode === "edit" && link) {
                setPlatform(link.platform)
                setUrl(link.url)
                setIsVisible(link.is_visible)
            } else {
                setPlatform("")
                setUrl("")
                setIsVisible(true)
            }
        }
    }, [open, mode, link])

    // Each platform may only have one link, so already-used platforms are disabled in the picker.
    // In edit mode the link's own platform is not counted as taken, otherwise its current value
    // would be unselectable.
    const platformOptions = useMemo(() => {
        const taken = new Set(
            existingPlatforms
                .filter((p) => mode === "create" || p !== link?.platform)
                .map((p) => p.toLowerCase()),
        )
        return SOCIAL_PLATFORMS.map((p) => ({
            platform: p.platform,
            disabled: taken.has(p.platform.toLowerCase()),
        }))
    }, [existingPlatforms, mode, link])

    async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        const platformErr = platform.trim().length === 0
            ? "Platform is required."
            : !isKnownPlatform(platform)
                ? "Pick a registered platform."
                : null
        const urlErr = validateSocialUrl(url)
        if (platformErr || urlErr) {
            setErrors({
                platform: platformErr ?? undefined,
                url: urlErr ?? undefined,
            })
            return
        }
        setErrors({})

        try {
            if (mode === "create") {
                await create.mutateAsync({
                    platform: platform.trim(),
                    url: url.trim(),
                    is_visible: isVisible,
                })
            } else if (link) {
                await update.mutateAsync({
                    linkId: link.id,
                    body: {
                        platform: platform.trim(),
                        url: url.trim(),
                        is_visible: isVisible,
                    },
                })
            }
            onOpenChange(false)
        } catch (err) {
            setErrors({ top: getErrorMessage(err, "Save Failed...") })
        }
    }

    const isPending = create.isPending || update.isPending

    return (
        // Ignore dismissal (escape, overlay click) while a save is in flight.
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!isPending) onOpenChange(v)
            }}
        >
            <DialogContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create"
                                ? "New Social Link"
                                : "Edit Social Link"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        {errors.top && (
                            <AlertBanner variant="error">{errors.top}</AlertBanner>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="social-platform">Platform</Label>
                            <Select
                                value={platform}
                                onValueChange={setPlatform}
                            >
                                <SelectTrigger
                                    id="social-platform"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {platformOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.platform}
                                            value={opt.platform}
                                            disabled={opt.disabled}
                                        >
                                            {opt.platform}
                                            {opt.disabled && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    (already added)
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.platform ? (
                                <p className="text-sm text-destructive">
                                    {errors.platform}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    That platform isn't supported... Uhh, I guess ask Anastasia
                                    if you wanna add this?
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="social-url">URL</Label>
                            <Input
                                id="social-url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                maxLength={500}
                                className="font-mono"
                            />
                            {errors.url && (
                                <p className="text-sm text-destructive">
                                    {errors.url}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2">
                            <div>
                                <Label
                                    htmlFor="social-visible"
                                    className="cursor-pointer"
                                >
                                    Visible on Navbar
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Hidden links stay configured but do not render for visitors.
                                </p>
                            </div>
                            <Switch
                                id="social-visible"
                                checked={isVisible}
                                onCheckedChange={setIsVisible}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !platform || !url.trim()}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
