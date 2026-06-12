import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Check, Copy } from "lucide-react"
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
import { AlertBanner } from "@/components/common/alert-banner"
import { Panel } from "@/components/ui/panel"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { validateApiKeyLabel } from "@/lib/validation"
import { useCreateApiKey } from "@/hooks/auth/useCreateApiKey"
import { useCapabilities } from "@/hooks/auth/useCapabilities"
import { apiKeyErrorMessage } from "@/hooks/auth/api-keys-api"
import { capabilityLabel } from "@/lib/capability-labels"
import {
    LabelDescriptionFields,
    type LabelDescriptionFormValues,
} from "./label-description-fields"
import { ScopePillsInput, type ScopePillOption } from "./scope-pills-input"
import { ScopeSummary } from "./scope-summary"
import type {
    ApiKeyCreateResponse,
    ApiKeyExpiryDays,
} from "@/types/api-keys"

// expiryDays is kept as a string in the form because ToggleGroup values are strings; it is
// converted back to a number on submit.
type CreateFormValues = LabelDescriptionFormValues & {
    expiryDays: `${ApiKeyExpiryDays}`
}

const EXPIRY_CHOICES: ApiKeyExpiryDays[] = [30, 90, 180, 365]

type CreateApiKeyDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateApiKeyDialog({
    open,
    onOpenChange,
}: CreateApiKeyDialogProps) {
    const [stage, setStage] = useState<"form" | "ready">("form")
    const [advancedOpen, setAdvancedOpen] = useState(false)
    const [created, setCreated] = useState<ApiKeyCreateResponse | null>(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [scopeCaps, setScopeCaps] = useState<string[]>([])
    const [scopeGames, setScopeGames] = useState<string[]>([])

    const createKey = useCreateApiKey()
    // The capabilities query only runs while the dialog is open; it feeds the scope pickers.
    const caps = useCapabilities(open)

    const form = useForm<CreateFormValues>({
        defaultValues: {
            label: "",
            description: "",
            expiryDays: "180",
        },
    })

    useEffect(() => {
        if (open) {
            setStage("form")
            setAdvancedOpen(false)
            setCreated(null)
            setCopied(false)
            setError(null)
            setScopeCaps([])
            setScopeGames([])
            form.reset({ label: "", description: "", expiryDays: "180" })
        }
    }, [open, form])

    const capOptions: ScopePillOption[] = (caps.data?.capabilities ?? []).map(
        (raw) => ({
            value: raw,
            label: capabilityLabel(raw),
            suffix: raw,
        }),
    )

    const gameOptions: ScopePillOption[] = (caps.data?.games ?? []).map(
        (g) => ({ value: g.id, label: g.name }),
    )

    const onSubmit = form.handleSubmit(async (values) => {
        setError(null)

        const labelError = validateApiKeyLabel(values.label)
        if (labelError) {
            form.setError("label", { message: labelError })
            return
        }

        const expiryDays = Number(values.expiryDays) as ApiKeyExpiryDays

        try {
            const response = await createKey.mutateAsync({
                label: values.label.trim(),
                description: values.description,
                expiry_days: expiryDays,
                scope_capabilities: scopeCaps,
                scope_games: scopeGames,
            })
            setCreated(response)
            setStage("ready")
        } catch (err) {
            setError(apiKeyErrorMessage(err))
        }
    })

    const handleCopy = async () => {
        if (!created) return
        try {
            await navigator.clipboard.writeText(created.key)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("Copy failed. Select the key and copy manually.")
        }
    }

    const handleDone = () => {
        toast.success("Key created.")
        onOpenChange(false)
    }

    // Once the key is shown, this is the only time the full secret is visible. Block every
    // dismissal path (escape, outside click, the X button) so it cannot be closed by accident;
    // the explicit Done button is the only way out.
    const blockClose = stage === "ready"

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next && blockClose) return
                onOpenChange(next)
            }}
        >
            <DialogContent
                hideClose={blockClose}
                onEscapeKeyDown={(e) => {
                    if (blockClose) e.preventDefault()
                }}
                onPointerDownOutside={(e) => {
                    if (blockClose) e.preventDefault()
                }}
            >
                {stage === "form" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Create thps.run API Key</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={onSubmit} className="flex flex-col gap-4">
                            <LabelDescriptionFields
                                register={form.register}
                                labelError={form.formState.errors.label}
                                idPrefix="api-key-create"
                            />

                            <div className="flex flex-col gap-2">
                                <Label>Expires In</Label>
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={form.watch("expiryDays")}
                                    onValueChange={(v) => {
                                        if (v) form.setValue("expiryDays", v as CreateFormValues["expiryDays"])
                                    }}
                                    className="w-full"
                                >
                                    {EXPIRY_CHOICES.map((days) => (
                                        <ToggleGroupItem
                                            key={days}
                                            value={String(days)}
                                            aria-label={`${days} days`}
                                        >
                                            {days} Days
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAdvancedOpen((v) => !v)}
                                    className="text-sm text-left text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <span>{advancedOpen ? "▾" : "▸"}</span>
                                    <span>Advanced: Restrict Scope</span>
                                </button>

                                {advancedOpen && (
                                    <div className="flex flex-col gap-4 rounded-md border border-border/40 p-3">
                                        {caps.isLoading && (
                                            <span className="text-xs text-muted-foreground">
                                                Loading Scope Options...
                                            </span>
                                        )}
                                        {caps.isError && (
                                            <AlertBanner variant="error">
                                                Could not load capabilities, for some reason. You can
                                                still create an unscoped key.
                                            </AlertBanner>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <Label>Games</Label>
                                            <ScopePillsInput
                                                options={gameOptions}
                                                selected={scopeGames}
                                                onChange={setScopeGames}
                                                placeholder="Add game..."
                                                emptyHint="Empty = ALL games you have access to."
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>Capabilities</Label>
                                            <ScopePillsInput
                                                options={capOptions}
                                                selected={scopeCaps}
                                                onChange={setScopeCaps}
                                                placeholder="Add capability..."
                                                emptyHint="Empty = No restrictions."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && <AlertBanner variant="error">{error}</AlertBanner>}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={createKey.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createKey.isPending}
                                >
                                    {createKey.isPending ? "Creating..." : "Create key"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    created && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-success" />
                                    Key created
                                </DialogTitle>
                            </DialogHeader>

                            <AlertBanner variant="error">
                                <strong>COPY THIS KEY!!</strong> This is the ONLY time you'll
                                see the full key - afterwards, you will only see a snippet to help
                                identify your keys later. Store this key in a password manager, in your
                                CI secrets, or somewhere safe BEFORE closing this dialog.
                            </AlertBanner>

                            <div className="flex flex-col gap-2">
                                <Label>Your new key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={created.key}
                                        className="font-mono text-xs"
                                        onFocus={(e) => e.currentTarget.select()}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCopy}
                                        className="shrink-0"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-1" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Prefix <code className="text-[10px]">{created.prefix}</code>
                                    {" "}is what shows in your key list.
                                </span>
                            </div>

                            <Panel className={cn("text-sm flex flex-col gap-1")}>
                                <div>
                                    <span className="text-muted-foreground">Label: </span>
                                    {created.label}
                                </div>
                                {created.expiry_date && (
                                    <div>
                                        <span className="text-muted-foreground">Expires: </span>
                                        {new Date(created.expiry_date).toLocaleDateString()}
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground">Scope: </span>
                                    <ScopeSummary
                                        scopeCapabilities={created.scope_capabilities}
                                        scopeGames={created.scope_games}
                                    />
                                </div>
                            </Panel>

                            <DialogFooter>
                                <Button type="button" onClick={handleDone}>
                                    I've stored it! (Hopefully)
                                </Button>
                            </DialogFooter>
                        </>
                    )
                )}
            </DialogContent>
        </Dialog>
    )
}
