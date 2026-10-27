import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RulesView } from "@/lib/rules"

const GuideMarkdown = lazy(() =>
    import("@/components/guides/guide-markdown").then((m) => ({ default: m.GuideMarkdown })),
)

interface RulesContentProps {
    view: RulesView
    className?: string
}

export function RulesContent({ view, className }: RulesContentProps) {
    if (!view.hasAny) return null

    return (
        <Suspense
            fallback={
                <div className="flex justify-center p-8 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                </div>
            }
        >
            <div className={cn("space-y-6", className)}>
                {view.sections.map((section, index) => (
                    <section
                        key={`${section.kind}-${index}`}
                        className={cn(
                            "space-y-2",
                            index > 0 && "border-t border-border/40 pt-4",
                        )}
                    >
                        <div className="space-y-0.5">
                            <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
                                {section.label}
                            </p>
                            <h3 className="text-lg font-semibold leading-tight">
                                {section.title}
                            </h3>
                        </div>
                        <GuideMarkdown content={section.body} />
                    </section>
                ))}
            </div>
        </Suspense>
    )
}
