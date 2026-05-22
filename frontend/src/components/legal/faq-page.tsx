import { useEffect, useState } from "react"
import { useLocation } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Panel } from "@/components/ui/panel"
import { PageShell } from "@/components/common/page-shell"
import { FAQ_ENTRIES } from "@/data/faq"

export function FAQPage() {
    const location = useLocation()
    const [openItems, setOpenItems] = useState<string[]>([])

    useEffect(() => {
        const hash = location.hash.slice(1)
        if (!hash) return
        if (!FAQ_ENTRIES.some((entry) => entry.id === hash)) return

        setOpenItems((prev) => (prev.includes(hash) ? prev : [...prev, hash]))
        requestAnimationFrame(() => {
            document.getElementById(hash)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        })
    }, [location.hash])

    return (
        <PageShell width="lg">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:gap-8">
                <aside className="lg:w-64 lg:shrink-0">
                    <Panel className="lg:sticky lg:top-20">
                        <nav aria-label="Table of contents">
                            <h3 className="mb-3 text-sm font-semibold text-foreground">
                                On this page
                            </h3>
                            <ul className="flex flex-col gap-2 text-sm">
                                {FAQ_ENTRIES.map((entry) => (
                                    <li key={entry.id}>
                                        <a
                                            href={`#${entry.id}`}
                                            className="block leading-snug text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {entry.question}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </Panel>
                </aside>
                <div className="min-w-0 flex-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Frequently Asked Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion
                                type="multiple"
                                value={openItems}
                                onValueChange={setOpenItems}
                                className="w-full"
                            >
                                {FAQ_ENTRIES.map((entry) => (
                                    <AccordionItem
                                        key={entry.id}
                                        id={entry.id}
                                        value={entry.id}
                                        className="scroll-mt-24"
                                    >
                                        <AccordionTrigger className="text-left text-base font-semibold">
                                            {entry.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-foreground/90">
                                            {entry.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageShell>
    )
}
