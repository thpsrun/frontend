import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"

import { AlertBanner } from "@/components/common/alert-banner"
import { SectionPanel } from "@/components/profile/section-panel"
import { SaveButton } from "@/components/profile/save-button"

import { useGameDetail } from "@/hooks/game/useGameDetail"
import { useUpdateCategory } from "@/hooks/game/useUpdateCategory"
import { applyValidationErrors } from "@/lib/validation-errors"
import {
    effectiveRequiredMethods,
    effectiveDefaultTime,
} from "@/lib/timing-inheritance"

import { TimingMethodField } from "@/components/manage/timing-method-field"
import { RequiredMethodsField } from "@/components/manage/required-methods-field"
import { GuideMarkdownEditor } from "@/components/guides/guide-markdown-editor"

import type { GameCategory, GameDetail } from "@/types/api"
import type { TimingMethodType } from "@/types/shared"
import { ALL_TIMING_METHODS } from "@/types/shared"

interface CategoryFormValues {
    rules: string
    defaulttime: TimingMethodType | null
    required_methods: TimingMethodType[] | null
}

const CATEGORY_FIELDS: Array<keyof CategoryFormValues> = [
    "rules",
    "defaulttime",
    "required_methods",
]

interface CategoryCardProps {
    category: GameCategory
    game: GameDetail
}

function CategoryCard({ category, game }: CategoryCardProps) {
    const update = useUpdateCategory(game.slug)
    const [topError, setTopError] = useState<string | null>(null)

    const parentRequired = (category.type === "per-game"
        ? game.required_methods_fg
        : game.required_methods_il) ?? [...ALL_TIMING_METHODS]

    const parentChain = [{
        defaulttime: (category.type === "per-game"
            ? game.defaulttime
            : game.idefaulttime) ?? null,
        required_methods: parentRequired,
    }]

    const inheritedDefault = effectiveDefaultTime(
        { defaulttime: null },
        parentChain,
    )

    const form = useForm<CategoryFormValues>({
        mode: "onBlur",
        defaultValues: {
            rules: category.rules ?? "",
            defaulttime: category.defaulttime ?? null,
            required_methods: category.required_methods ?? null,
        },
    })

    useEffect(() => {
        form.reset({
            rules: category.rules ?? "",
            defaulttime: category.defaulttime ?? null,
            required_methods: category.required_methods ?? null,
        })
    }, [category.rules, category.defaulttime, category.required_methods, form])

    const handleSave = useCallback(async () => {
        const values = form.getValues()
        setTopError(null)
        try {
            await update.mutateAsync({
                categoryId: category.id,
                data: values,
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
    }, [form, update, category.id, category.name])

    const onSubmit = form.handleSubmit(handleSave)

    const watched = form.watch()
    const effectiveRequired = effectiveRequiredMethods(
        { required_methods: watched.required_methods },
        [{ required_methods: parentRequired }],
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
                <Controller
                    control={form.control}
                    name="rules"
                    render={({ field }) => (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground/80">
                                Rules
                            </label>
                            <GuideMarkdownEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={`Rules for ${category.name} (Markdown Supported).`}
                            />
                        </div>
                    )}
                />
                <Controller
                    control={form.control}
                    name="required_methods"
                    render={({ field, fieldState }) => (
                        <RequiredMethodsField
                            id={`category-${category.id}-required`}
                            label="Required methods"
                            value={field.value}
                            onChange={field.onChange}
                            parentRequired={parentRequired}
                            allowInherit
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="defaulttime"
                    rules={{
                        validate: (v) => {
                            if (v === null) return true
                            return effectiveRequired.includes(v)
                                || "Primary timing method must be in the required set!"
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <TimingMethodField
                            id={`category-${category.id}-default`}
                            label="Primary timing method"
                            value={field.value}
                            onChange={field.onChange}
                            requiredMethods={effectiveRequired}
                            allowInherit
                            inheritedValue={inheritedDefault}
                            error={fieldState.error?.message}
                        />
                    )}
                />
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

    const categories = game.data.categories ?? []

    if (categories.length === 0) {
        return (
            <SectionPanel
                title="Categories"
                description="Narrow timing methods on a per-category basis."
            >
                <p className="text-sm text-muted-foreground">
                    No categories defined for this game?????
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
