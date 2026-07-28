import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"

import { AlertBanner } from "@/components/common/alert-banner"
import { Button } from "@/components/ui/button"
import { SectionPanel } from "@/components/profile/section-panel"
import { SaveButton } from "@/components/profile/save-button"
import { ChevronDown, ChevronRight } from "lucide-react"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useUpdateCategory } from "@/hooks/game/useUpdateCategory"
import { applyValidationErrors } from "@/lib/validation-errors"
import {
    effectiveAllowedMethods,
    effectiveRequiredMethods,
    effectiveDefaultTime,
    normalizeRequired,
} from "@/lib/timing-inheritance"

import { TimingMethodsEditor } from "@/components/manage/timing-methods-editor"
import { GuideMarkdownEditor } from "@/components/guides/guide-markdown-editor"

import type { GameCategory, GameDetail } from "@/types/api"
import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

interface CategoryFormValues {
    rules: string
    defaulttime: TimingMethodType | null
    allowed_methods: TimingMethodType[] | null
    required_methods: TimingMethodType[] | null
}

const CATEGORY_FIELDS: Array<keyof CategoryFormValues> = [
    "rules",
    "defaulttime",
    "allowed_methods",
    "required_methods",
]

interface CategoryCardProps {
    category: GameCategory
    game: GameDetail
}

function CategoryCard({ category, game }: CategoryCardProps) {
    const update = useUpdateCategory(game.slug)
    const [topError, setTopError] = useState<string | null>(null)
    const [rulesOpen, setRulesOpen] = useState(false)

    const parentAllowed = useMemo(
        () => (category.type === "per-game"
            ? game.allowed_methods_fg
            : game.allowed_methods_il) ?? [...ALL_TIMING_METHODS],
        [category.type, game.allowed_methods_fg, game.allowed_methods_il],
    )

    const parentChain = [{
        defaulttime: (category.type === "per-game"
            ? game.defaulttime
            : game.idefaulttime) ?? null,
        allowed_methods: parentAllowed,
    }]

    // The game-scope required subset this category inherits from.
    const parentRequired = (category.type === "per-game"
        ? game.required_methods_fg
        : game.required_methods_il) ?? parentAllowed

    const inheritedDefault = effectiveDefaultTime(
        { defaulttime: null },
        parentChain,
    )

    const form = useForm<CategoryFormValues>({
        mode: "onBlur",
        defaultValues: {
            rules: category.rules ?? "",
            defaulttime: category.defaulttime ?? null,
            allowed_methods: category.allowed_methods ?? null,
            required_methods: category.required_methods ?? null,
        },
    })

    // Re-seed the form when the server values change (saving invalidates the game query, which
    // refetches every category).
    useEffect(() => {
        form.reset({
            rules: category.rules ?? "",
            defaulttime: category.defaulttime ?? null,
            allowed_methods: category.allowed_methods ?? null,
            required_methods: category.required_methods ?? null,
        })
    }, [
        category.rules, category.defaulttime,
        category.allowed_methods, category.required_methods, form,
    ])

    const handleSave = useCallback(async () => {
        const values = form.getValues()
        setTopError(null)
        // Clamp the required subset to the effective allowed window and guarantee the effective
        // primary before sending; a null stays null (inherit) for the server to resolve.
        const effAllowed = effectiveAllowedMethods(
            { allowed_methods: values.allowed_methods },
            [{ allowed_methods: parentAllowed }],
        )
        const effPrimary = values.defaulttime ?? inheritedDefault
        try {
            await update.mutateAsync({
                categoryId: category.id,
                data: {
                    ...values,
                    required_methods: normalizeRequired(
                        values.required_methods, effAllowed, effPrimary,
                    ),
                },
            })
            toast.success(`Saved ${category.name}.`)
            form.reset(values)
        } catch (e) {
            const msg = applyValidationErrors(e, form, CATEGORY_FIELDS)
            if (msg) {
                setTopError(msg)
                toast.error(msg)
            }
        }
    }, [
        form, update, category.id, category.name,
        parentAllowed, inheritedDefault,
    ])

    const onSubmit = form.handleSubmit(handleSave)

    const watched = form.watch()
    // What "inherit" resolves to when selected in the editor.
    const inheritedRequired = effectiveRequiredMethods(
        { required_methods: null },
        [{ required_methods: parentRequired }],
        parentAllowed,
        inheritedDefault,
    )

    const description = category.type === "per-game"
        ? "Full Game Category"
        : "Individual Levels Category"

    return (
        <SectionPanel title={category.name} description={description}>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {topError && (
                    <AlertBanner variant="error">{topError}</AlertBanner>
                )}
                <TimingMethodsEditor
                    id={`category-${category.id}-timing`}
                    value={{
                        allowed: watched.allowed_methods,
                        required: watched.required_methods,
                        primary: watched.defaulttime,
                    }}
                    onChange={(next) => {
                        form.setValue("allowed_methods", next.allowed, {
                            shouldDirty: true,
                        })
                        form.setValue("required_methods", next.required, {
                            shouldDirty: true,
                        })
                        form.setValue("defaulttime", next.primary, {
                            shouldDirty: true,
                        })
                    }}
                    parentAllowed={parentAllowed}
                    inheritedRequired={inheritedRequired}
                    inheritedPrimary={inheritedDefault}
                    allowInherit
                    parentLabel={category.type === "per-game"
                        ? "Full Game"
                        : "Individual Levels"}
                    error={
                        form.formState.errors.allowed_methods?.message
                        ?? form.formState.errors.required_methods?.message
                        ?? form.formState.errors.defaulttime?.message
                    }
                />
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-fit gap-1 px-2"
                        onClick={() => setRulesOpen((o) => !o)}
                    >
                        {rulesOpen
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        Rules
                    </Button>
                    {rulesOpen && (
                        <Controller
                            control={form.control}
                            name="rules"
                            render={({ field }) => (
                                <GuideMarkdownEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={`Rules for ${category.name} (Markdown Supported).`}
                                />
                            )}
                        />
                    )}
                </div>
                <SaveButton
                    isPending={update.isPending}
                    disabled={!form.formState.isDirty}
                />
            </form>
        </SectionPanel>
    )
}

export function CategoriesSection() {
    const { gameSlug } = useParams<{ gameSlug: string }>()
    const game = useGameDetail(gameSlug ?? "")

    if (game.isLoading) return null
    if (!game.data) {
        return (
            <SectionPanel title="Categories">
                <AlertBanner variant="error">Game Not Found!</AlertBanner>
            </SectionPanel>
        )
    }

    // Filter out archived categories; they are not editable right now, but it will
    // be added kinda sorta soon.
    const categories = (game.data.categories ?? []).filter((c) => !c.archive)

    if (categories.length === 0) {
        return (
            <SectionPanel
                title="Categories"
                description="Narrow timing methods on a per-category basis."
            >
                <p className="text-sm text-muted-foreground">
                    No categories are defined for this game.
                </p>
            </SectionPanel>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    category={cat}
                    game={game.data!}
                />
            ))}
        </div>
    )
}
