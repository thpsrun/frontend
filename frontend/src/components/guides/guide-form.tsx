import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { AlertBanner } from "@/components/ui/alert-banner"
import { ChevronsUpDown, Trash2 } from "lucide-react"
import { useGames } from "@/hooks/game/useGames"
import { useTags } from "@/hooks/guides/useTags"
import { useCreateGuide } from "@/hooks/guides/useCreateGuide"
import { useUpdateGuide } from "@/hooks/guides/useUpdateGuide"
import { useDeleteGuide } from "@/hooks/guides/useDeleteGuide"
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard"
import {
    validateGuideTitle,
    validateGuideShortDescription,
    validateGuideContent,
} from "@/lib/validation"
import { ApiError } from "@/lib/api-client"
import type { Guide } from "@/types/guides"
import { UnsavedChangesDialog } from "@/components/profile/unsaved-changes-dialog"
import { GuideMarkdownEditor } from "./guide-markdown-editor"
import { DeleteGuideDialog } from "./delete-guide-dialog"

interface FormValues {
    title: string
    short_description: string
    content: string
    game_id: string
    tag_ids: string[]
}

interface Props {
    mode: "create" | "edit"
    guide?: Guide
}

export function GuideForm({ mode, guide }: Props) {
    const navigate = useNavigate()
    const games = useGames()
    const tags = useTags()
    const create = useCreateGuide()
    const update = useUpdateGuide()
    const del = useDeleteGuide()

    const [showDelete, setShowDelete] = useState(false)
    const [topError, setTopError] = useState<string | null>(null)

    const form = useForm<FormValues>({
        mode: "onBlur",
        defaultValues: {
            title: guide?.title ?? "",
            short_description: guide?.short_description ?? "",
            content: guide?.content ?? "",
            game_id: guide?.game?.id ?? "",
            tag_ids: (guide?.tags ?? []).map((t) => t.slug),
        },
    })

    async function onSubmit(values: FormValues) {
        setTopError(null)
        try {
            if (mode === "create") {
                const created = await create.mutateAsync({
                    title: values.title.trim(),
                    short_description: values.short_description.trim(),
                    content: values.content,
                    game_id: values.game_id,
                    tag_ids: values.tag_ids,
                })
                toast.success("Guide created.")
                navigate(`/guides/${created.slug}`)
            } else {
                const updated = await update.mutateAsync({
                    slug: guide!.slug,
                    data: {
                        title: values.title.trim(),
                        short_description: values.short_description.trim(),
                        content: values.content,
                        tag_ids: values.tag_ids,
                    },
                })
                toast.success("Guide saved.")
                navigate(`/guides/${updated.slug}`)
            }
        } catch (e) {
            if (e instanceof ApiError) {
                const body = e.body as
                    | { errors?: Array<{ loc?: string[]; msg?: string }> }
                    | null
                const errors = body?.errors
                if (Array.isArray(errors) && errors.length > 0) {
                    let mappedAny = false
                    for (const item of errors) {
                        const field = item.loc?.[item.loc.length - 1]
                        if (
                            field === "title"
                            || field === "short_description"
                            || field === "content"
                            || field === "game_id"
                            || field === "tag_ids"
                        ) {
                            form.setError(field, { message: item.msg ?? "Invalid." })
                            mappedAny = true
                        }
                    }
                    if (!mappedAny) setTopError(e.message)
                } else {
                    setTopError(e.message)
                }
            } else {
                setTopError(e instanceof Error ? e.message : "Save failed.")
            }
        }
    }

    const guard = useUnsavedChangesGuard({
        isDirty: form.formState.isDirty,
        onSave: form.handleSubmit(onSubmit),
        onDiscard: () => form.reset(),
    })

    function onCancel() {
        if (mode === "edit" && guide) {
            navigate(`/guides/${guide.slug}`)
        } else {
            navigate("/guides")
        }
    }

    async function onConfirmDelete() {
        if (!guide) return
        await del.mutateAsync(guide.slug)
        toast.success("Guide deleted.")
        navigate("/guides")
    }

    const isPending = create.isPending || update.isPending
    const showGameSelect = mode === "create"

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {topError && <AlertBanner variant="error">{topError}</AlertBanner>}

            {showGameSelect ? (
                <div className="space-y-1.5">
                    <Label htmlFor="game">Game</Label>
                    <Controller
                        control={form.control}
                        name="game_id"
                        rules={{ required: "Game is required." }}
                        render={({ field, fieldState }) => (
                            <>
                                <Select
                                    value={field.value || undefined}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger id="game">
                                        <SelectValue placeholder="Select a game" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(games.data ?? []).map((g) => (
                                            <SelectItem key={g.id} value={g.id}>
                                                {g.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <p className="text-sm text-destructive">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </div>
            ) : (
                <div className="text-sm">
                    <span className="text-muted-foreground">Game:</span>{" "}
                    <span className="font-medium">{guide?.game?.name ?? "—"}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Controller
                    control={form.control}
                    name="title"
                    rules={{ validate: (v) => validateGuideTitle(v) ?? true }}
                    render={({ field, fieldState }) => (
                        <>
                            <Input id="title" {...field} maxLength={200} />
                            <FieldFooter
                                error={fieldState.error?.message}
                                count={field.value.length}
                                limit={200}
                            />
                        </>
                    )}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="short_description">Short description</Label>
                <Controller
                    control={form.control}
                    name="short_description"
                    rules={{ validate: (v) => validateGuideShortDescription(v) ?? true }}
                    render={({ field, fieldState }) => (
                        <>
                            <Textarea
                                id="short_description"
                                rows={2}
                                maxLength={500}
                                {...field}
                            />
                            <FieldFooter
                                error={fieldState.error?.message}
                                count={field.value.length}
                                limit={500}
                            />
                        </>
                    )}
                />
            </div>

            <div className="space-y-1.5">
                <Label>Tags</Label>
                <Controller
                    control={form.control}
                    name="tag_ids"
                    render={({ field }) => {
                        const tagsList = tags.data ?? []
                        const selected = tagsList.filter((t) => field.value.includes(t.slug))
                        const toggle = (slug: string) => {
                            field.onChange(
                                field.value.includes(slug)
                                    ? field.value.filter((s) => s !== slug)
                                    : [...field.value, slug],
                            )
                        }
                        return (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between gap-2"
                                    >
                                        <span className="flex flex-wrap items-center gap-1">
                                            {selected.length === 0
                                                ? <span className="text-muted-foreground">Select tags</span>
                                                : selected.map((t) => (
                                                    <Badge key={t.slug} variant="secondary">
                                                        {t.name}
                                                    </Badge>
                                                ))}
                                        </span>
                                        <ChevronsUpDown className="size-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0">
                                    <Command>
                                        <CommandInput placeholder="Search tags..." />
                                        <CommandList>
                                            <CommandEmpty>No tags available.</CommandEmpty>
                                            <CommandGroup>
                                                {tagsList.map((t) => (
                                                    <CommandItem
                                                        key={t.slug}
                                                        value={`${t.name} ${t.slug}`}
                                                        onSelect={() => toggle(t.slug)}
                                                    >
                                                        <span
                                                            className={`mr-2 inline-flex size-4 items-center justify-center rounded border ${
                                                                field.value.includes(t.slug)
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "border-border"
                                                            }`}
                                                            aria-hidden
                                                        >
                                                            {field.value.includes(t.slug) ? "✓" : ""}
                                                        </span>
                                                        {t.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )
                    }}
                />
            </div>

            <div className="space-y-1.5">
                <Label>Content</Label>
                <Controller
                    control={form.control}
                    name="content"
                    rules={{ validate: (v) => validateGuideContent(v) ?? true }}
                    render={({ field, fieldState }) => (
                        <>
                            <GuideMarkdownEditor
                                value={field.value}
                                onChange={field.onChange}
                            />
                            <FieldFooter
                                error={fieldState.error?.message}
                                count={field.value.length}
                                limit={50_000}
                            />
                        </>
                    )}
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : mode === "create" ? "Create guide" : "Save guide"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </Button>
                </div>
                {mode === "edit" && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDelete(true)}
                        disabled={isPending || del.isPending}
                    >
                        <Trash2 className="mr-2 size-4" />Delete
                    </Button>
                )}
            </div>

            <UnsavedChangesDialog
                open={guard.isBlocked}
                onSave={guard.handleSave}
                onDiscard={guard.handleDiscard}
                onCancel={guard.handleCancel}
                isSaving={isPending}
            />

            {mode === "edit" && guide && (
                <DeleteGuideDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    guideTitle={guide.title}
                    onConfirm={onConfirmDelete}
                    isPending={del.isPending}
                />
            )}
        </form>
    )
}

function FieldFooter({
    error,
    count,
    limit,
}: {
    error: string | undefined
    count: number
    limit: number
}) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-destructive">{error ?? ""}</span>
            <span className="text-muted-foreground">{count} / {limit}</span>
        </div>
    )
}
